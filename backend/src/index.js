const express = require('express');
const cors = require('cors');
require('dotenv').config();

const navigationRoutes = require('./routes/navigation');
const trafficRoutes = require('./routes/traffic');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/navigation', navigationRoutes);
app.use('/api/traffic', trafficRoutes);

app.get('/health', (req, res) => res.json({ status: 'Active', region: 'Kigali, Rwanda' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Rwanda Traffic Backend running on port ${PORT}`);
});