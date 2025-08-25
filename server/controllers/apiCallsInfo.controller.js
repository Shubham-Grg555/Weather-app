const ApiCallsInfo = require('../models/apiCallsInfo.model.js');

const getApiCallsInfo = async (req, res) => {
    try{
    const apiCallsInfo = await ApiCallsInfo.findOne({});
    res.status(200).json(apiCallsInfo);
  }
  catch (error){
    res.status(500).json({message: error.message});
  }
};

const updateApiCallsInfo = async (req, res) => {
  try{
    await ApiCallsInfo.findOneAndUpdate(
      {},
      { $inc: { numbOfApiCalls: 1 } },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json(updateApiCallsInfo);
  }
  catch (error){
    res.status(500).json({message: error.message});
  }
};

module.exports = {
  getApiCallsInfo,
  updateApiCallsInfo
}