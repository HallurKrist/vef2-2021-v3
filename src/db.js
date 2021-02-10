import pg from 'pg';
import dotenv from 'dotenv';

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


export async function insert(signature) {
  const client = await pool.connect();

  // signiture = [name, nationalId, comment, anonymous]
  const query = 'INSERT INTO signatures(name, nationalId, comment, anonymous) VALUES($1, $2, $3, $4)';

  try {
    const result = await client.query(query, signature);
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }

  await pool.end();
}


export async function getAllSignatures() {
  const client = await pool.connect();

  const query = 'SELECT * FROM signatures;';

  try {
    return await client.query(query);
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }

  console.log("getAllSignatures done");
  await pool.end();
}


