const jwt = require('jsonwebtoken');
const User = require("../models/user");
const redisClient = require('../config/redis');


const userMiddleware = async (req,res,next)=>{

    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("Token Doesn't exist");
        }

        const payload =  jwt.verify(token,process.env.JWT_KEY);
        // console.log(payload);

        const {_id} = payload;

        if(!_id){
            throw new Error("Id is missing");
        }

        const result = await User.findById(_id);

        if(!result){
            throw new Error("User Doesn't exist");
        }


        const IsBlocked = await redisClient.exists(`KBtoken:${token}`);

        if(IsBlocked)
            throw new Error("Invalid Token");

        req.user = result;


        next();
    }
    catch(err){
        res.status(401).send("Error: "+ err.message)
    }

}

module.exports = userMiddleware;