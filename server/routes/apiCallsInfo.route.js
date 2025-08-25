const express = require('express');
const apiCallsInfoRouter = express.Router();
const {getApiCallsInfo, updateApiCallsInfo} = require('../controllers/apiCallsInfo.controller.js');

apiCallsInfoRouter.get('/', getApiCallsInfo);

apiCallsInfoRouter.put('/', updateApiCallsInfo);

module.exports = apiCallsInfoRouter;