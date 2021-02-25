import bcrypt from 'bcrypt';
import express from 'express';
import passport from './login.js';



export const admin = express.Router();

// Látum express nota passport með session
admin.use(passport.initialize());
admin.use(passport.session());

// admin.use((req, res, next) => {
//   if (req.isAuthenticated()) {
//     // getum núna notað user í viewum
//     res.locals.user = req.user;
//   }

//   next();
// });

// Hjálpar middleware sem athugar hvort notandi sé innskráður og hleypir okkur
// þá áfram, annars sendir á /admin
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/admin');
}

admin.get('/', (req, res) => {
  console.log('say something!');
  if ( req.isAuthenticated() ) { res.redirect('../'); }

  console.log(req.session);

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
  '/',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    console.log("login tokst");
    // console.log(await bcrypt.hash('123', 10));
    res.redirect('/');
  },
);
