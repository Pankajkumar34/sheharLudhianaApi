const NodeCache = require("node-cache");

const otpCache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
});


module.exports = otpCache;