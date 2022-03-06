module.exports = function() {
  return {
    production: process.env.PRODUCTION || false
  };
};