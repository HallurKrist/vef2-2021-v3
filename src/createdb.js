import pg from 'pg';
import dotenv from 'dotenv';
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

export async function query(q, values = []) {
  const client = await pool.connect();

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    return null;
  } finally {
    client.release();
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
  } finally {
    pool.end();
  }
}

create().catch((err) => {
  console.error('Error creating schema', err);
});
