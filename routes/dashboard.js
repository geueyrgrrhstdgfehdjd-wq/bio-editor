const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const Setting = require('../models/Setting');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const bioMeta = await Setting.getBioMeta(user.id);
    const settings = await Setting.getSettings(user.id);

    res.render('dashboard', {
      title: 'จัดการ Bio',
      user,
      bioMeta,
      settings,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

router.post('/update-meta', requireAuth, async (req, res) => {
  const { 
    bio_title, bio_description, logo_text, logo_emoji, 
    theme_color, accent_color, bg_style,
    frame_style, frame_x_offset, frame_y_offset, frame_scale
  } = req.body;
  
  try {
    await Setting.updateBioMeta(req.user.id, {
      bio_title,
      bio_description,
      logo_text,
      logo_emoji,
      theme_color: theme_color || '#1a1a2e',
      accent_color: accent_color || '#e94560',
      bg_style: bg_style || 'dark',
      frame_style: frame_style || 'circle',
      frame_x_offset: parseInt(frame_x_offset) || 0,
      frame_y_offset: parseInt(frame_y_offset) || 0,
      frame_scale: parseFloat(frame_scale) || 1.0
    });
    
    res.redirect('/dashboard?success=อัปเดตข้อมูลสำเร็จ');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=เกิดข้อผิดพลาด');
  }
});

router.post('/add-setting', requireAuth, async (req, res) => {
  const { key, value, icon, type, display_order } = req.body;
  
  if (!key || !value) {
    return res.redirect('/dashboard?error=กรุณากรอกข้อมูลให้ครบ');
  }

  try {
    await Setting.setSetting(
      req.user.id,
      key.trim(),
      value.trim(),
      icon || null,
      type || 'text',
      parseInt(display_order) || 0
    );
    res.redirect('/dashboard?success=เพิ่มรายการสำเร็จ');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=เกิดข้อผิดพลาด');
  }
});

router.post('/delete-setting', requireAuth, async (req, res) => {
  const { key } = req.body;
  
  try {
    await Setting.deleteSetting(req.user.id, key);
    res.redirect('/dashboard?success=ลบรายการสำเร็จ');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=เกิดข้อผิดพลาด');
  }
});

router.post('/edit-setting', requireAuth, async (req, res) => {
  const { old_key, key, value, icon, type, display_order } = req.body;
  
  if (!key || !value) {
    return res.redirect('/dashboard?error=กรุณากรอกข้อมูลให้ครบ');
  }

  try {
    if (old_key && old_key !== key) {
      await Setting.deleteSetting(req.user.id, old_key);
    }
    await Setting.setSetting(
      req.user.id,
      key.trim(),
      value.trim(),
      icon || null,
      type || 'text',
      parseInt(display_order) || 0
    );
    res.redirect('/dashboard?success=แก้ไขรายการสำเร็จ');
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard?error=เกิดข้อผิดพลาด');
  }
});

module.exports = router;
