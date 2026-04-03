const mongoose = require('mongoose');

/**
 * 数据库连接函数
 * 本轮仅做骨架，连接失败不会阻塞服务启动
 */
async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/personal-os-lite';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB connection failed (service will continue running):', error.message);
    console.warn('If you need MongoDB, ensure it is running or update MONGO_URI in .env');
  }
}

module.exports = { connectDB };
