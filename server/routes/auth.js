const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// تسجيل الدخول
router.post('/login', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ error: 'كلمة السر مطلوبة' });
    }

    // مقارنة كلمة السر مع القيمة في متغيرات البيئة
    if (password === process.env.ADMIN_PASSWORD) {
        // توليد Token صالح لمدة 24 ساعة
        const token = jwt.sign(
            { role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        return res.json({ token });
    } else {
        return res.status(401).json({ error: 'كلمة سر غير صحيحة' });
    }
});

module.exports = router;
