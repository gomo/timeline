module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        banner: '(function($, global){\n',
        footer: '\n})(jQuery, (function(){return this;})());'
      },
      dist: {
        src: ['src/*.js'],
        dest: 'lib/timeline.js'
      }
    },
    uglify: {
      distJs: {
        src: ['lib/timeline.js'],
        dest: 'lib/timeline.min.js'
      }
    },
    stylus:{
      dist:{
        files: {
          'lib/timeline.min.css':['css/*.styl']
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'css/*.styl'],
        tasks: ['concat', 'uglify', 'stylus']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['watch']);
};