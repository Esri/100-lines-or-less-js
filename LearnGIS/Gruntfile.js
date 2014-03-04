module.exports = function(grunt) {
    "use strict";
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
      
      connect: {
        server: {
          options: {
            port: 8000,
            base: '.'
          }
        }
      }


      
    });
};
