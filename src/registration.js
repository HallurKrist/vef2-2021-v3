import express from 'express';
import { query } from './db.js';
import { body, validationResult } from 'express-validator';

export const router = express.Router();

router.use(express.urlencoded({ extended: true }));

let allSignatures;

router.get('/', async (req, res) => {

    allSignatures = await query('SELECT * FROM signatures');

    console.log("komið með all signatures !");
    // console.log(new Date(allSignatures.rows[0].signed.getTime()));
    // console.log(new Date(allSignatures.rows[0].signed.replace(' ','T')));
    // console.log(allSignatures.rows[0].signed.toLocaleDateString().replace('/','.').replace('/','.'));

    res.render('registration', { registrationErrors: ['test1','test2'], signatures: allSignatures.rows })

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
      name = '',
      nationalId = '',
      comment = '',
      anon = true,
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      return res.render('registration', { registrationErrors: errorMessages, signatures: allSignatures.rows })
    }

    return next();
  },

  body('name').trim().escape(),
  body('nationalId').blacklist('-'),

  async (req, res) => {
    const {
      name,
      nationalId,
      comment,
      anon = true,
    } = req.body;

    const result = await query('INSERT INTO signatures (name, nationalId, comment, anonymous) VALUES ($1, $2, $3, $4);', [name, nationalId, comment, anon]);

    allSignatures = await query('SELECT * FROM signatures');
    console.log([name, nationalId, comment, anon]);
    console.log(result);
    console.log("thad tokst");
    return res.render('registration', { registrationErrors: [], signatures: allSignatures.rows });

  },
);
