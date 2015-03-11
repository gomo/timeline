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
        src: ['src/Util.js', 'src/View.js', 'src/scroll-events/jquery.scroll-events.js', 'src/classes/*.js'],
        dest: 'lib/timeline.js'
      }
    },
    uglify: {
      distJs: {
        src: ['lib/timeline.js'],
        dest: 'lib/timeline.min.js'
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'lib',
          src: ['*.css', '!*.min.css'],
          dest: 'lib',
          ext: '.min.css'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js', 'src/scroll-events/jquery.scroll-events.js', 'src/classes/*.js', 'lib/timeline.js', 'lib/timeline.css'],
        tasks: ['concat', 'uglify', 'cssmin']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default task.
  grunt.registerTask('default', ['watch']);
};