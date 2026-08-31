const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const Setting = require('../models/Setting');
const { authMiddleware } = require('../middleware/auth');

router.get('/:username', authMiddleware, async (req, res) => {
  const username = req.params.username;
  
  try {
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).render('404', { title: 'ไม่พบผู้ใช้นี้' });
    }

    const bioMeta = await Setting.getBioMeta(user.id);
    const settings = await Setting.getSettings(user.id);

    const links = settings.filter(s => s.type === 'link' || s.type === 'link-icon');
    const texts = settings.filter(s => s.type === 'text' || s.type === 'text-icon');
    const others = settings.filter(s => 
      s.type !== 'link' && s.type !== 'link-icon' && 
      s.type !== 'text' && s.type !== 'text-icon'
    );

    res.render('index', {
      title: bioMeta?.bio_title || `Bio ของ ${user.display_name || user.username}`,
      user: req.user || null,
      bioUser: user,
      bioMeta,
      settings,
      links,
      texts,
      others
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('เกิดข้อผิดพลาด');
  }
});

router.get('/', authMiddleware, (req, res) => {
  if (req.user) {
    return res.redirect(`/${req.user.username}`);
  }
  res.redirect('/auth/login');
});

module.exports = router;
