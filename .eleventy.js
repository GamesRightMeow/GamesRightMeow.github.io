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
  eleventyConfig.addWatchTarget('./src/projects/**/*');
  eleventyConfig.addWatchTarget('./src/garden/**/*');
  eleventyConfig.addWatchTarget('./src/games/**/*');
  
  eleventyConfig.addPassthroughCopy('./src/projects/what-the-fanta/play/**/*');

  eleventyConfig.addPassthroughCopy('./src/garden/**/*.png');
  eleventyConfig.addPassthroughCopy('./src/garden/**/*.jpg');
  eleventyConfig.addPassthroughCopy('./src/garden/**/*.gif');
  eleventyConfig.addPassthroughCopy('./src/projects/**/*.png');
  eleventyConfig.addPassthroughCopy('./src/projects/**/*.jpg');
  eleventyConfig.addPassthroughCopy('./src/projects/**/*.gif');
  eleventyConfig.addPassthroughCopy('./src/games/**/*.png');
  eleventyConfig.addPassthroughCopy('./src/games/**/*.jpg');
  eleventyConfig.addPassthroughCopy('./src/games/**/*.gif');
  eleventyConfig.addPassthroughCopy('./src/playdate.json')
  eleventyConfig.addPassthroughCopy('./src/playdate-update.js')
  
  eleventyConfig.addPassthroughCopy({ './_tmp/style.css': './style.css' });
  eleventyConfig.addPassthroughCopy({ './src/media/': './media/' });
  eleventyConfig.addPassthroughCopy({ './src/fontawesome/': './fontawesome/' });
  eleventyConfig.addPassthroughCopy({ './src/favicon.ico': './favicon.ico' });

  eleventyConfig.addLiquidFilter("dateToRfc3339", pluginRss.dateToRfc3339);

  eleventyConfig.addFilter("findPage", function find(slug, collection) {
    let result = collection.find(page => page.fileSlug === slug);
    if (result == null) {
      console.error("Page not found!");
    }
    return result;
  });

  eleventyConfig.addLiquidFilter("prettyStatus", function (status) {
    if (status == null) {
      // no status = seedling
      return "🌱 <i>Seedling</i>";
    }

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
    if (status == null) {
      // no status = seedling
      return "🌱";
    }

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

  eleventyConfig.addLiquidFilter("withTag", function(collection, tag) {
    return collection.filter((item) => item.data.tags.includes(tag));
  });
    
  eleventyConfig.addLiquidFilter("withoutTag", function(collection, tag) {
    return collection.filter((item) => !item.data.tags.includes(tag));
  });
    
  eleventyConfig.addCollection("recentlyTended", function(collectionApi) {
    return collectionApi.getFilteredByTag("garden")
    .filter(function(item) {
      return !item.data.tags.includes("hide-recently-tended")
    }).sort(function(a, b) {
      return b.data.tended - a.data.tended;
    });
  });

  eleventyConfig.addCollection("recentlyPlanted", function(collectionApi) {
    return collectionApi.getFilteredByTag("garden")
    .filter(function(item) {
      return !item.data.tags.includes("hide-recently-planted")
    }).sort(function(a, b) {
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