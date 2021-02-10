import express from 'express';
import { query } from './db.js';

export const router = express.Router();

router.get('/', async (req, res) => {

    let allSignatures = await query('SELECT * FROM signatures');

    console.log("komið með all signatures !");
    console.log(allSignatures.rows[0].name);

    res.render('registration', { registrationErrors: ["test 1","test 2"], signatures: allSignatures.rows })

});
