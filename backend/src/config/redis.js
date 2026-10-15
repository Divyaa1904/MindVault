const redis = require('redis');

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-19934.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 19934
    }
});



module.exports = redisClient;
