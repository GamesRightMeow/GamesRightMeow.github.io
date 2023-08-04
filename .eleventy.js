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

  eleventyConfig.addWatchTarget('./_tmp/style.css');
  eleventyConfig.addPassthroughCopy('./src/garden/**/*.png');
  eleventyConfig.addPassthroughCopy('./src/garden/**/*.jpg');
  eleventyConfig.addPassthroughCopy('./src/garden/**/*.gif');
  eleventyConfig.addPassthroughCopy('./src/projects/**/*.png');
  eleventyConfig.addPassthroughCopy('./src/projects/**/*.jpg');
  eleventyConfig.addPassthroughCopy('./src/projects/**/*.gif');
  eleventyConfig.addWatchTarget('./src/projects/**/*');
  
  eleventyConfig.addPassthroughCopy({ './_tmp/style.css': './style.css' });
  eleventyConfig.addPassthroughCopy({ './src/media/': './media/' });
  eleventyConfig.addPassthroughCopy({ './src/fontawesome/': './fontawesome/' });
  eleventyConfig.addPassthroughCopy({ './src/favicon.ico': './favicon.ico' });

  eleventyConfig.addLiquidFilter("dateToRfc3339", pluginRss.dateToRfc3339);

  eleventyConfig.addLiquidFilter("prettyStatus", function(status) {
    switch (status.toLowerCase()) {
      default:
      case "seedling":
        return "🌱 <i>Seedling</i>";
      case "budding":
        return "🌿 <i>Budding</i>";
      case "evergreen":
        return "🌳 <i>Evergreen</i>";
    }
  });

  eleventyConfig.addLiquidFilter("prettyStatusIcon", function(status) {
    switch (status.toLowerCase()) {
      default:
      case "seedling":
        return "🌱";
      case "budding":
        return "🌿";
      case "evergreen":
        return "🌳";
    }
  });

  eleventyConfig.addLiquidFilter("timeSince", function(utc) {
    return moment.utc(utc).fromNow();   
  });

  eleventyConfig.addLiquidFilter("formatDate", function(utc, format) {
    return moment.utc(utc).format(format);
  });

  eleventyConfig.addLiquidFilter("length", function(array) {
    return array.length
  });

  eleventyConfig.addCollection("recentlyTended", function(collectionApi) {
    return collectionApi.getFilteredByTag("garden").sort(function(a, b) {
      return b.data.tended - a.data.tended;
    });
  });

  eleventyConfig.addCollection("recentlyPlanted", function(collectionApi) {
    return collectionApi.getFilteredByTag("garden").sort(function(a, b) {
      return b.data.planted - a.data.planted;
    });
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