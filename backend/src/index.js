const express=require('express');
const app=express();
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const main=require('./config/db');
const cookieParser=require('cookie-parser');
const authRouter=require('./routes/userAuth');
const noteRouter=require('./routes/noteWork');
const communityRouter=require('./routes/community');
const redisClient = require("./config/redis");
const cors = require('cors')

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/notes',noteRouter);
app.use('/community',communityRouter);

app.get('/health', (req, res) => {
    res.status(200).json({ status: "success", message: "Welcome to MindVault" });
});

const InitializeConnection=async()=>{
    try{
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB connected");
        app.listen(process.env.PORT,()=>{
        console.log("Server is listening at port number "+process.env.PORT);
    })
    }
    catch(err){
        console.log("Error: "+err);
    }
}

InitializeConnection();