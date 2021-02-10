import express from 'express';
import { insert } from './db.js';

export const router = express.Router();

router.get('/', (req, res) => {

  // TODO: make getAllSignatures in db.js
  // const allSignatures = getAllSignatures();

  res.render('registration', { registrationErrors: ["test 1"] }); //, { signatures: allSignatures })
});
