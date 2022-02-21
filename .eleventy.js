const Image = require("@11ty/eleventy-img");
const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");

module.exports = function (eleventyConfig) {
  if (process.env.ELEVENTY_ENV === 'production') {
    eleventyConfig.addPlugin(eleventyPluginFilesMinifier);
  }

  eleventyConfig.addWatchTarget('./_tmp/style.css')

  eleventyConfig.addPassthroughCopy({ './_tmp/style.css': './style.css' })
  eleventyConfig.addPassthroughCopy({ './src/media/': './media/' })
  eleventyConfig.addPassthroughCopy({ './src/favicon.ico': './favicon.ico' })
  eleventyConfig.addPassthroughCopy({ './src/admin/': './admin/' })

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    }
  }
};