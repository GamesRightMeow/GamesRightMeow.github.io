module.exports = function() {
  return {
    eleventy: process.env.ELEVENTY_ENV,
    node: process.env.NODE_ENV
  };
};