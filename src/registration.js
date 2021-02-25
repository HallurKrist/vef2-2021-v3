import express from 'express';
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import { query, getPage } from './db.js';

export const router = express.Router();

// router.use(express.urlencoded({ extended: true }));
// router.use(session({
//   name: 'counter.sid',
//   secret: 'sessionSecret',
//   resave: false,
//   saveUninitialized: false,
// }));

router.use((req, res, next) => {
  const { originalUrl } = req;

  if (!req.session.page) {
    req.session.page = 0;
  }

  if (!req.session.signCount) {
    req.session.signCount = 0;
  }

  next();
});

let allSignatures;

router.get('/', async (req, res) => {
  req.session.page = 0;
  allSignatures = await getPage(0);
  const signCount = await query("SELECT COUNT(*) AS count FROM signatures;");
  req.session.signCount = signCount.rows[0].count;
  res.render('registration', { registrationErrors: [],
                              signatures: allSignatures.rows,
                              page: 0,
                              signCount: req.session.signCount });
});

router.post('/',
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('nationalId')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('nationalId')
    .matches(new RegExp('^[0-9]{6}-?[0-9]{4}$'))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),

  (req, res, next) => {
    const {
      name = '',  // eslint-disable-line
      nationalId = '',  // eslint-disable-line
      comment = '', // eslint-disable-line
      anon = false, // eslint-disable-line
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg); // eslint-disable-line
      return res.render('registration', { registrationErrors: errorMessages,
                                          signatures: allSignatures.rows,
                                          page: req.session.page,
                                          signCount: req.session.signCount });
    }

    return next();
  },

  body('name').trim().escape(),
  body('nationalId').blacklist('-'),
  body('comment').trim().escape(),

  async (req, res) => {
    const {
      name,
      nationalId,
      comment,
      anon = false,
    } = req.body;

    const result = await query('INSERT INTO signatures (name, nationalId, comment, anonymous) VALUES ($1, $2, $3, $4);', [name, nationalId, comment, anon]);

    let errors = [];
    if (result == null) {
      errors = ['Búið að skrifa undir með þessari kennitölu'];
    }

    allSignatures = await getPage(req.session.page);
    const signCount = await query("SELECT COUNT(*) AS count FROM signatures;");
    req.session.signCount = signCount.rows[0].count;
    return res.render('registration', { registrationErrors: errors,
                                      signatures: allSignatures.rows,
                                      page: req.session.page,
                                      signCount: signCount.rows[0].count });
  });


  router.get('/:pageNr', async (req, res, next) => {
    req.session.page = req.params.pageNr -1;
    allSignatures = await getPage(req.params.pageNr -1);
    res.render('registration', { registrationErrors: [],
                                signatures: allSignatures.rows,
                                page: req.session.page,
                                signCount: req.session.signCount });
  });
