const mongoose = require('mongoose');

const apiCallsInfoSchema = mongoose.Schema(
  {
    numbOfApiCalls: {
      type: Number,
      required: true,
      min: [0, 'API calls cannot be negative.'],
      max: [500, 'API call limit exceeded. Max is 500.']
    },
    lastReset: {
    type: Date,
    default: Date.now
    }
  },
  {
    collection: 'ApiCallsInfo',
  }
);

const ApiCallsInfo = mongoose.model("ApiCallsInfo", apiCallsInfoSchema);

module.exports = ApiCallsInfo;