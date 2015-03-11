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
    watch: {
      scripts: {
        files: ['src/*.js', 'src/scroll-events/jquery.scroll-events.js', 'src/classes/*.js'],
        tasks: ['concat', 'uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['watch']);
};