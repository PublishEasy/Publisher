import express from 'express';

const app = express();
const port = process.env.PORT || '8080';

app.get('/', (req, res) => res.send('Hello Emil!'));

app.listen(port, () =>
  console.log(`Publisher API backend listening on port ${port}`),
);
