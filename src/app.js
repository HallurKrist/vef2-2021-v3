import express from 'express';
import dotenv from 'dotenv';

import { router } from './registration.js';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('public'));

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
