module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    assets: {
      dir: 'assets',
      path: '<%= pkg.directories.src %>/<%= assets.dir %>',
      styles: {
        dir: 'styles',
        path: '<%= assets.path %>/<%= assets.styles.dir %>',
        files: '<%= assets.styles.path %>/**/*.sass'
      },
      scripts: {
        dir: 'scripts',
        path: '<%= assets.path %>/<%= assets.scripts.dir %>',
        files: '<%= assets.scripts.path %>/**/*.js'
      },
      html: {
        dir:'.',
        path: '<%= pkg.directories.src %>/<%= assets.html.dir %>',
        files: '<%= assets.html.path %>/**/*.html'
      }
    },
    sass: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= assets.styles.path %>/sass',
          src: ['*.scss'],
          dest: '<%= assets.styles.path %>',
          ext: '.css'
        }]
      }
    },
    postcss: {
      options: {
        map: true,
        processors: [
          // require('pixrem')(),
          require('autoprefixer')({browsers: 'last 2 versions'}),
          require('cssnano')()
        ]
      },
      dist: {
        src:  '<%= assets.styles.path %>/*.css'
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'index.html': '<%= assets.html.path %>/index.html'
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd:'<%= pkg.directories.src %>',
            src: [
              '<%= assets.dir %>/**',
              '!**/sass/**'
            ],
            dest: './'
          }
        ]
      }
    },
    watch: {
      // scripts: {
      //   files: ['**/*.js'],
      //   tasks: []
      // },
      html: {
        files: ['<%= assets.html.dir %>/index.html'],
        task: ['htmlmin']
      },
      css: {
        files: '<%= assets.styles.dir %>/sass/**/*.scss',
        tasks: ['css_compile'],
      }
    },
    browserSync: {
      dev: {
        bsFiles: {
          src : [
            '<%= assets.styles.dir %>/**/*.css',
            '<%= assets.scripts.dir %>/**/*.js',
            '<%= assets.html.dir %>/index.html'
          ]
        },
        options: {
          watchTask: true,
          server: '<%= pkg.directories.src %>'
        }
      }
    }
  });

  grunt.registerTask('css_compile', ['sass', 'postcss']);
  grunt.registerTask('build', ['css_compile', 'htmlmin']);
  grunt.registerTask('default', ['build', 'browserSync', 'watch']);
  grunt.registerTask('dist', ['build', 'copy'])
};
