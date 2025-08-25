const ApiCallsInfo = require('../models/apiCallsInfo.model')

const checkApiCallLimit = async(req, res, next) => {
  try{
    const apiCallsInfo = await ApiCallsInfo.findOne({});
    const now = new Date().toDateString();
    const lastReset = new Date(apiCallsInfo.lastReset).toDateString();

    if (now !== lastReset){
      apiCallsInfo.lastReset = new Date()
      apiCallsInfo.numbOfApiCalls = 0;;
      await apiCallsInfo.save();
    }

    if (apiCallsInfo.numbOfApiCalls >= 500){
      return res.status(429).json({ message: 'API call limit exceeded. Try again tomorrow.' });
    }

    next();
  }
  catch (error){
    res.status(500).json({ message: 'Error checking API call limit.' });
  }
};

module.exports = checkApiCallLimit;