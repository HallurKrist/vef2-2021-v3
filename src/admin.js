import express from 'express';
import passport from './login.js';
import { query, getPage } from './db.js';

export const admin = express.Router();

// Látum express nota passport með session
admin.use(passport.initialize());
admin.use(passport.session());

// Gott að skilgreina eitthvað svona til að gera user hlut aðgengilegan í
// viewum ef við erum að nota þannig
admin.use((req, res, next) => {
  if (req.isAuthenticated()) {
    // getum núna notað user í viewum
    res.locals.user = req.user;
  }

  next();
});

// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /admin/login
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/admin/login');
}

admin.get('/login', (req, res) => {
  if (req.isAuthenticated()) { res.redirect('/admin'); }

  let message = '';

  // Athugum hvort einhver skilaboð séu til í session, ef svo er birtum þau
  // og hreinsum skilaboð
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  res.render('adminLogin', { loginErrors: message });
});

admin.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: './login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);

admin.get('/logout', ensureLoggedIn, (req, res) => {
  req.logout();
  res.redirect('/admin/login');
});

admin.get('/', ensureLoggedIn, async (req, res) => {
  if (!req.session.adminPage) { req.session.adminPage = 0; }
  const allSignatures = await getPage(req.session.adminPage);
  const signCount = await query('SELECT COUNT(*) AS count FROM signatures;');
  req.session.signCount = signCount.rows[0].count;
  res.render('adminList', {
    user: req.user,
    signatures: allSignatures.rows,
    page: req.session.adminPage,
    signCount: req.session.signCount,
  });
});

admin.post('/', ensureLoggedIn, async (req, res) => {
  const q = 'DELETE FROM signatures WHERE id = $1;';
  const result = await query(q, [req.body.id]);
  if (!result) { console.error('Error in delete from table'); }
  res.redirect('/admin');
});

admin.get('/page:nr', async (req, res) => {
  req.session.adminPage = req.params.nr - 1;
  const allSignatures = await getPage(req.params.nr - 1);
  res.render('adminList', {
    user: req.user,
    signatures: allSignatures.rows,
    page: req.session.adminPage,
    signCount: req.session.signCount,
  });
});
