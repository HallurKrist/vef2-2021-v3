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

export async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('Query error', e);
  } finally {
    client.release();
  }
}

export async function getPage(offset) {
  const client = await pool.connect();

  try {
    const q = 'SELECT * FROM signatures ORDER BY signed DESC OFFSET $1 LIMIT 50';
    const result = await client.query(q, [offset * 50]);
    return result;
  } catch (e) {
    console.error('Paging error', e);
  } finally {
    client.release();
  }
}
