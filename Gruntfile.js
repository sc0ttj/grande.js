module.exports = function(grunt) {

  grunt.initConfig({
    qunit: {
      options: {
        "--web-security": "no",
        coverage: {
          src: ["js/grande.js"],
          instrumentedFiles: "temp/",
          htmlReport: "report/coverage",
          coberturaReport: "report/"
        }
      },
      all: ["test/**.html"]
    },
    uglify: {
      all: {
        files: {
          'dist/grande.min.js': ['js/grande.js']
        }
      }
    },
    cssmin: {
      all: {
        files: {
          'dist/grande.min.css': ['css/menu.js', 'css/editor.css']
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-qunit-istanbul");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  // @TODO: add lint hook here as well for eslint
  grunt.registerTask("travis", "qunit");

  grunt.registerTask("build", ["uglify", "cssmin"]);
};

