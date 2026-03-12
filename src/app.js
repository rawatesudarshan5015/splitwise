const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

app.get('/', (req, res) => {
  res.json({ message: "Splitwise API is running" });
});

app.use('/api', userRoutes);
app.use('/api', expenseRoutes);
app.use('/api', balanceRoutes);

app.use(notFound);
app.use(errorHandler);

const { syncDatabase } = require('./models/index');

const PORT = process.env.PORT || 3000;

syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
