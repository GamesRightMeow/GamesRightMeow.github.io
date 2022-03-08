const Image = require("@11ty/eleventy-img");
const moment = require("moment");
const yaml = require("js-yaml");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const eleventyPluginFilesMinifier = require("@sherby/eleventy-plugin-files-minifier");

module.exports = function (eleventyConfig) {
  if (process.env.ELEVENTY_ENV === 'production') {
    eleventyConfig.addPlugin(eleventyPluginFilesMinifier);
  }

  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  eleventyConfig.addWatchTarget('./_tmp/style.css')

  eleventyConfig.addPassthroughCopy('./src/posts/**/*.jpg')
  
  eleventyConfig.addPassthroughCopy({ './src/CNAME': './CNAME' })
  eleventyConfig.addPassthroughCopy({ './_tmp/style.css': './style.css' })
  eleventyConfig.addPassthroughCopy({ './src/media/': './media/' })
  eleventyConfig.addPassthroughCopy({ './src/favicon.ico': './favicon.ico' })
  eleventyConfig.addPassthroughCopy({ './src/admin/': './admin/' })

  eleventyConfig.addLiquidFilter("dateToRfc3339", pluginRss.dateToRfc3339);

  eleventyConfig.addLiquidFilter("formatDate", function(utc, format) {
    return moment.utc(utc).format(format);
  });

  eleventyConfig.addLiquidFilter("length", function(array) {
    return array.length
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    }
  }
};