import pg from 'pg';
import dotenv from 'dotenv';
import faker from 'faker';
import bcrypt from 'bcrypt';
import { readFile } from 'fs/promises';

dotenv.config();

const {
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('Error in query', e);
  } finally {
    client.release();
  }
}

async function fillTable() {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    for( let i = 0; i < 500; i++ ) {
      const name = faker.name.findName();
      const nationalId = Math.floor( 1000000000 + (Math.random() * 1000000000) );
      var comment = "";
      if( Math.random() < 0.5 ) {
        comment = faker.lorem.sentence();
      }
      var anon = true;
      if( Math.random() < 0.5 ) {
        anon = false;
      }
      const timeStamp = faker.date.between(startDate, new Date());

      const q = `
        INSERT INTO signatures (name, nationalId, comment, anonymous, signed)
        VALUES ($1, $2, $3, $4, $5);`;

      await query(q, [name, nationalId, comment, anon, timeStamp]);
    }

    const q2 = `INSERT INTO users (username, password, admin)
                VALUES ($1, $2, 'TRUE');`
    await query(q2,['admin', await bcrypt.hash('123', 10)]);
    await query(q2,['user', await bcrypt.hash('123', 10)]);
    console.info('fillTable success');
  } catch (e) {
    console.error('Error in fillTable', e);
  }
}

async function emptyTable() {
  try {
    const q =`
      TRUNCATE TABLE signatures;
      TRUNCATE TABLE users;`;

    await query(q, []);
    console.info('emptyTable success');
  } catch (e) {
    console.error('Error in emptyTable', e);
  }
}

const schemaFile = './schema.sql';

async function create() {
  const data = await readFile(schemaFile);

  try {
    await query(data.toString('utf-8'));
    console.info('Schema created');
  } catch (e) {
    console.error('Error creating schema', e);
  }
}

try {
  await create().catch((err) => {
    console.error('Error creating schema', err);
  });

  await emptyTable().catch((err) => {
    console.error('Error emptying table', err);
  });

  await fillTable().catch((err) => {
    console.error('Error filling table', err);
  });
} catch (e) {
  console.error('Error in setup', e);
} finally {
  pool.end();
}

