const express = require('express');
const axios = require('axios');
const router = express.Router();

// تخزين مؤقت للروابط والـ IPs (في الذاكرة - يمكن استبدالها بـ Redis للإنتاج)
const tempLinks = new Map();

// توليد رابط تحميل مؤقت
router.get('/generate/:modelId', async (req, res) => {
    try {
        const { modelId } = req.params;
        const userIP = req.ip || req.connection.remoteAddress;
        
        // التحقق من أن المستخدم لم يطلب أكثر من 3 روابط في الساعة (اختياري)
        // يمكن إضافة منطق للحد من الاستخدام هنا

        // توليد معرف فريد للرابط المؤقت
        const token = require('crypto').randomBytes(16).toString('hex');
        const expiresAt = Date.now() + 60 * 60 * 1000; // صلاحية ساعة واحدة

        // تخزين الرابط مع IP المستخدم ووقت الانتهاء
        tempLinks.set(token, {
            ip: userIP,
            modelId: modelId,
            expiresAt: expiresAt
        });

        // رابط التحميل المؤقت (سيتم استدعاؤه من الواجهة)
        const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/file/${token}`;
        
        res.json({
            downloadUrl,
            expiresIn: '60 دقيقة',
            message: 'تم توليد رابط التحميل بنجاح'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ في توليد الرابط' });
    }
});

// مسار التحميل الفعلي (محمي بـ IP)
router.get('/file/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const userIP = req.ip || req.connection.remoteAddress;
        
        // استرجاع معلومات الرابط المؤقت
        const linkData = tempLinks.get(token);
        
        // التحقق من وجود الرابط
        if (!linkData) {
            return res.status(404).send('الرابط غير موجود أو منتهي الصلاحية');
        }

        // التحقق من صلاحية الرابط
        if (Date.now() > linkData.expiresAt) {
            tempLinks.delete(token);
            return res.status(410).send('انتهت صلاحية رابط التحميل');
        }

        // التحقق من تطابق IP
        if (linkData.ip !== userIP) {
            return res.status(403).send('غير مصرح: هذا الرابط مرتبط بعنوان IP آخر');
        }

        // بعد التحقق، نقوم بتحميل الملف من GitHub Releases
        // استخدام الرابط المباشر من متغيرات البيئة
        const fileUrl = process.env.ZIP_FILE_URL;
        if (!fileUrl) {
            return res.status(500).send('لم يتم تكوين رابط التحميل بشكل صحيح');
        }

        // تحميل الملف من GitHub (مع تمرير التوكن إذا كان repo خاص)
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
            headers: {
                'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined
            }
        });

        // تحديد نوع الملف
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="blender-assets.zip"');
        
        // توجيه التحميل للمستخدم
        response.data.pipe(res);

        // حذف الرابط المؤقت بعد الاستخدام (استخدام مرة واحدة)
        tempLinks.delete(token);

    } catch (error) {
        console.error('خطأ في التحميل:', error);
        if (error.response && error.response.status === 404) {
            res.status(404).send('الملف غير موجود في المصدر');
        } else {
            res.status(500).send('حدث خطأ في تحميل الملف');
        }
    }
});

// مسار لحذف الروابط المنتهية (يمكن استدعاؤه دورياً)
router.post('/cleanup', (req, res) => {
    const now = Date.now();
    let deletedCount = 0;
    for (const [token, data] of tempLinks.entries()) {
        if (data.expiresAt < now) {
            tempLinks.delete(token);
            deletedCount++;
        }
    }
    res.json({ message: `تم حذف ${deletedCount} رابط منتهي` });
});

module.exports = router;
