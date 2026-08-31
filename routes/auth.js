const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

router.get('/login', (req, res) => {
  const redirect = req.query.redirect || '/dashboard';
  res.render('login', { 
    title: 'เข้าสู่ระบบ',
    redirect,
    error: null,
    user: req.user || null
  });
});

router.post('/login', async (req, res) => {
  const { username, password, redirect } = req.body;
  const redirectUrl = redirect || '/dashboard';

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.render('login', { 
        title: 'เข้าสู่ระบบ',
        redirect: redirectUrl,
        error: 'ไม่พบชื่อผู้ใช้',
        user: null
      });
    }

    const isValid = await User.verifyPassword(user, password);
    if (!isValid) {
      return res.render('login', { 
        title: 'เข้าสู่ระบบ',
        redirect: redirectUrl,
        error: 'รหัสผ่านไม่ถูกต้อง',
        user: null
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 604800000
    });
    req.session.token = token;
    req.session.userId = user.id;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.render('login', { 
      title: 'เข้าสู่ระบบ',
      redirect: redirectUrl,
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
      user: null
    });
  }
});

router.get('/register', (req, res) => {
  res.render('register', { 
    title: 'สมัครสมาชิก',
    error: null,
    user: req.user || null
  });
});

router.post('/register', async (req, res) => {
  const { username, password, confirmPassword, display_name, email } = req.body;

  if (password !== confirmPassword) {
    return res.render('register', {
      title: 'สมัครสมาชิก',
      error: 'รหัสผ่านไม่ตรงกัน',
      user: null
    });
  }

  if (password.length < 6) {
    return res.render('register', {
      title: 'สมัครสมาชิก',
      error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
      user: null
    });
  }

  try {
    const existing = await User.findByUsername(username);
    if (existing) {
      return res.render('register', {
        title: 'สมัครสมาชิก',
        error: 'ชื่อผู้ใช้นี้มีอยู่แล้ว',
        user: null
      });
    }

    const user = await User.create({ username, password, display_name, email });
    
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 604800000
    });
    req.session.token = token;
    req.session.userId = user.id;

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('register', {
      title: 'สมัครสมาชิก',
      error: 'เกิดข้อผิดพลาด กรุณาลองใหม่',
      user: null
    });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  if (req.session) {
    req.session.destroy();
  }
  res.redirect('/');
});

module.exports = router;
