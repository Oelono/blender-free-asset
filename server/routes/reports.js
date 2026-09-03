const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();

// ===== نماذج البيانات =====
// نموذج بلاغات الروابط المكسورة
const BrokenLinkReport = mongoose.model('BrokenLinkReport', new mongoose.Schema({
    modelName: { type: String, required: true },
    details: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
}));

// نموذج طلبات الموديلات
const ModelRequest = mongoose.model('ModelRequest', new mongoose.Schema({
    modelName: { type: String, required: true },
    description: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
}));

// ===== Middleware للتحقق من Token =====
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'غير مصرح: Token مطلوب' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'غير مصرح: Token غير صحيح' });
    }
};

// ===== مسارات البلاغات =====

// إضافة بلاغ رابط مكسور (عام)
router.post('/broken-links', async (req, res) => {
    try {
        const { modelName, details } = req.body;
        if (!modelName) {
            return res.status(400).json({ error: 'اسم الموديل مطلوب' });
        }

        const report = new BrokenLinkReport({ modelName, details });
        await report.save();
        res.status(201).json({ message: 'تم إرسال البلاغ بنجاح', report });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// الحصول على جميع بلاغات الروابط المكسورة (للآدمن)
router.get('/broken-links', authenticate, async (req, res) => {
    try {
        const reports = await BrokenLinkReport.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// حذف بلاغ رابط مكسور (للآدمن)
router.delete('/broken-links/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'معرف غير صحيح' });
        }

        const result = await BrokenLinkReport.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: 'البلاغ غير موجود' });
        }
        res.json({ message: 'تم حذف البلاغ بنجاح' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// ===== مسارات طلبات الموديلات =====

// إضافة طلب موديل جديد (عام)
router.post('/model-requests', async (req, res) => {
    try {
        const { modelName, description } = req.body;
        if (!modelName) {
            return res.status(400).json({ error: 'اسم الموديل مطلوب' });
        }

        const request = new ModelRequest({ modelName, description });
        await request.save();
        res.status(201).json({ message: 'تم إرسال الطلب بنجاح', request });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// الحصول على جميع طلبات الموديلات (للآدمن)
router.get('/model-requests', authenticate, async (req, res) => {
    try {
        const requests = await ModelRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// حذف طلب موديل (للآدمن)
router.delete('/model-requests/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'معرف غير صحيح' });
        }

        const result = await ModelRequest.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ error: 'الطلب غير موجود' });
        }
        res.json({ message: 'تم حذف الطلب بنجاح' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

module.exports = router;
