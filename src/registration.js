import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from './db.js';

export const router = express.Router();

router.use(express.urlencoded({ extended: true }));

let allSignatures;

router.get('/', async (req, res) => {
  allSignatures = await query('SELECT * FROM signatures ORDER BY id deSC');
  res.render('registration', { registrationErrors: [], signatures: allSignatures.rows });
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
      return res.render('registration', { registrationErrors: errorMessages, signatures: allSignatures.rows });
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

    allSignatures = await query('SELECT * FROM signatures ORDER BY id deSC');
    return res.render('registration', { registrationErrors: errors, signatures: allSignatures.rows });
  });
