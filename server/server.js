require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ تم الاتصال بـ MongoDB Atlas'))
    .catch(err => console.error('❌ فشل الاتصال بـ MongoDB:', err));

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/download', downloadRoutes);

// مسار الصحة
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'السيرفر يعمل بشكل صحيح' });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على المنفذ ${PORT}`);
});
