import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

const hostname = 'localhost';
const port = 8017;

app.listen(port, hostname, () => {
  console.log(`Hello mthuyet, I'm running server at http://${hostname}:${port}`);
});
