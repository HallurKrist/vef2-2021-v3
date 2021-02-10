import express from 'express';
import { insert, getAllSignatures } from './db.js';

export const router = express.Router();

router.get('/', async (req, res) => {

    const allSignatures = await getAllSignatures().catch((e) => { console.error(e); });

    console.log("komið með all signatures !");
    console.log(allSignatures.rows[0].name);

    res.render('registration', { registrationErrors: ["test 1","test 2"], signatures: allSignatures.rows })

});
