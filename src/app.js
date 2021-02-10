import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();

app.use((req, res) => {
  res.send('Hello World!');
});

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
