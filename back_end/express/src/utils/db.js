const mongoose = require('mongoose');

/**
 * 连接数据库
 * @returns {Promise<void>}
 */
const connectDB = async () =>{
    await mongoose.connect(process.env.NET_MONGO_URL);
    console.log(`MongoDB Connect Success`);
}

module.exports = connectDB;
