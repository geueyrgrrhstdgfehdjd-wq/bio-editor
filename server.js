const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const SQLiteStore = require('connect-sqlite3')(session);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: './database'
  }),
  secret: process.env.JWT_SECRET || 'mysecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.COOKIE_MAX_AGE) || 604800000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

const authRoutes = require('./routes/auth');
const bioRoutes = require('./routes/bio');
const dashboardRoutes = require('./routes/dashboard');

app.use('/auth', authRoutes);
app.use('/', bioRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: '404 - ไม่พบหน้า' });
});

app.listen(PORT, () => {
  console.log(`🔥 BluezyGPT เปิดเว็บให้มึงแล้วที่ http://localhost:${PORT}`);
});
