const express = require('express');
const mongoose = require('mongoose');
const coordsRouter = require('./routes/coords.route.js');
const apiCallsInfoRouter = require('./routes/apiCallsInfo.route.js');
const checkApiCallLimit = require('./middleware/checkApiCallLimit.middleware.js');
const cors = require('cors');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = express();
const port = process.env.PORT || 8000;
const connectionString = process.env.CONNECTION_STRING;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/api/coords', coordsRouter);
app.use('/api/callsInfo', checkApiCallLimit, apiCallsInfoRouter);

mongoose.connect(connectionString)
.then(() => {
  console.log("Connected to the database");
  app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  });
})
.catch(() => {
  console.log("Connection failed");
});