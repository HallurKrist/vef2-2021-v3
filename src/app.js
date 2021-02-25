import express from 'express';
import dotenv from 'dotenv';

import session from 'express-session';
import { router } from './registration.js';
import { admin } from './admin.js';


dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  name: 'counter.sid',
  secret: 'sessionSecret',
  resave: false,
  saveUninitialized: false,
}));



app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

// app.post(
//   '/admin/login',

//   // Þetta notar strat að ofan til að skrá notanda inn
//   passport.authenticate('local', {
//     failureMessage: 'Notandanafn eða lykilorð vitlaust.',
//     failureRedirect: '/admin',
//   }),

//   // Ef við komumst hingað var notandi skráður inn, senda á /admin
//   async (req, res) => {
//     console.log("login tokst");
//     // console.log(await bcrypt.hash('123', 10));
//     res.redirect('/');
//   },
// );

app.use('/admin', admin);
app.use('/', router);

// Síða fannst ekki
function notFoundHandler(req, res) {
  res.status(404).render('error', { errorNr: 404 });
}

// Meðhöndlar villur
function errorHandler(err, req, res) {
  res.status(500).render('error', { errorNr: 500 });
}

// Ef komist hingað í ferlinu þá er villa
app.use(notFoundHandler);
app.use(errorHandler);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
