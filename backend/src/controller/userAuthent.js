const User=require('../models/user');
const validate=require('../utils/validator');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const redisClient = require('../config/redis');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/emailService');

const register=async(req,res)=>{
    try{
        validate(req.body);
        const {emailId,password}=req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password,10);
        
        const user = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailId: req.body.emailId,
            password: hashedPassword
        });

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id
        };

        const token=jwt.sign({_id:user._id,emailId:emailId},process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token',token,{maxAge:60*60*1000, sameSite: 'none', secure: true});

        res.status(201).json({
            user:reply,
            message:"User registered Successfully"
        });
    }
    catch(err){
        res.status(400).json({message:err.message});
    }
}

const verifyOtpAndRegister = async(req,res) => {
    try {
        const { emailId, otp } = req.body;
        if (!emailId || !otp) {
            throw new Error("Email ID and OTP are required");
        }

        const otpDataString = await redisClient.get(`registrationOTP:${emailId}`);
        if (!otpDataString) {
            throw new Error("OTP expired or invalid");
        }

        const otpData = JSON.parse(otpDataString);
        if (otpData.otp !== otp) {
            throw new Error("Invalid OTP");
        }

        // create user without otp
        const { otp: _, ...userData } = otpData;
        const user = await User.create(userData);

        await redisClient.del(`registrationOTP:${emailId}`);

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id
        }

        const token=jwt.sign({_id:user._id,emailId:emailId},process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token',token,{maxAge:60*60*1000, sameSite: 'none', secure: true});

        res.status(201).json({
            user:reply,
            message:"User registered Successfully"
        });
    } catch(err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        res.status(400).json({message:err.message});
    }
}

const login=async(req,res)=>{
    try{
        const {emailId,password}=req.body;
        
        if(!emailId)
            throw new Error("Enter Email ID");
        if(!password)
            throw new Error("Enter Password");

        const user=await User.findOne({emailId});
        if(!user) throw new Error("Invalid Credentials")
        const match=await bcrypt.compare(password,user.password);
        if(!match)
            throw new Error("Invalid credentials");
        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role:user.role,
        }

        const token=jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token',token,{maxAge:60*60*1000, sameSite: 'none', secure: true});

        res.status(201).json({
            user:reply,
            message:"Loggin Successfully"
        })
    }
    catch(err){
        res.status(401).json({message:err.message});
    }


}

const logout=async(req,res)=>{
    try{
        const {token}=req.cookies;
        const payload=jwt.decode(token);
        await redisClient.set(`KBtoken:${token}`,'Blocked');
        await redisClient.expireAt(`KBtoken:${token}`,payload.exp);
        res.cookie("token",null,{expires:new Date(Date.now()), sameSite: 'none', secure: true});
        res.send("logged out successfully");
    }
    catch(err){
        res.status(203).send("Error: "+err);
    }
}


const deleteProfile = async(req,res)=>{
  
    try{
       const userId = req.result._id;
      
    await User.findByIdAndDelete(userId);//findByIdAndDelete is a mongoose function, in schema, we have to give equivalent mongoDB function

    // Submission se bhi delete karo...
    
    // await Submission.deleteMany({userId});// but can handle it in schema using post
    
    res.status(200).send("Deleted Successfully");

    }
    catch(err){
      
        res.status(500).send("Internal Server Error");
    }
}

const requestPasswordReset = async (req, res) => {
    try {
        const { emailId } = req.body;
        if (!emailId) throw new Error("Enter Email ID");

        const user = await User.findOne({ emailId });
        if (!user) {
            throw new Error("No user found with this email");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await redisClient.set(`passwordResetOTP:${emailId}`, otp, { EX: 600 });
        await sendPasswordResetEmail(emailId, otp);

        res.status(200).json({
            message: "Password reset OTP sent to your email."
        });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { emailId, otp, newPassword } = req.body;
        if (!emailId || !otp || !newPassword) {
            throw new Error("Email ID, OTP, and new password are required");
        }

        const storedOtp = await redisClient.get(`passwordResetOTP:${emailId}`);
        if (!storedOtp) {
            throw new Error("OTP expired or invalid");
        }

        if (storedOtp !== otp) {
            throw new Error("Invalid OTP");
        }

        // Validate strong password
        const validator = require('validator');
        if(!validator.isStrongPassword(newPassword)){
            throw new Error("Password must have minimum 8 characters with atleast one capital, one number and one symbol.");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ emailId }, { password: hashedPassword });
        
        await redisClient.del(`passwordResetOTP:${emailId}`);

        res.status(200).json({
            message: "Password reset successfully. You can now login."
        });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
}


const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) throw new Error("No Google credential provided");

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const emailId = payload['email'];
        const firstName = payload['given_name'];
        const lastName = payload['family_name'];

        let user = await User.findOne({ emailId });
        
        if (!user) {
            return res.status(200).json({
                requiresRegistration: true,
                googleData: { emailId, firstName, lastName, credential }
            });
        }

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role,
        };

        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });

        res.status(200).json({
            user: reply,
            message: "Logged in Successfully"
        });

    } catch (err) {
        res.status(401).json({ message: err.message });
    }
}

const googleRegister = async (req, res) => {
    try {
        const { credential, firstName, lastName } = req.body;
        if (!credential || !firstName) throw new Error("Missing required fields");

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const emailId = payload['email'];

        let user = await User.findOne({ emailId });
        if (user) {
            return res.status(400).json({ message: "User already exists. Please login." });
        }

        user = await User.create({
            firstName,
            lastName,
            emailId,
            authProvider: 'google'
        });

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id
        };

        const token = jwt.sign({ _id: user._id, emailId: emailId }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        res.cookie('token', token, { maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true });

        res.status(201).json({
            user: reply,
            message: "User registered Successfully"
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


module.exports={register,verifyOtpAndRegister,login,logout,deleteProfile,googleAuth,googleRegister, requestPasswordReset, resetPassword};
