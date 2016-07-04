module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  , concat: {
      options: {
        separator: ';'
      }
    , dist: {
        src: [ 'src/libs/angular.js', 'src/libs/jquery.js', 'src/libs/*.js', 'src/app.js', 'src/*.js', 'src/services/*.js', 'src/controllers/*.js' ]
      , dest: 'dist/app.js'
      }
    }
  , bowercopy: {
      options: {
        destPrefix: 'src/libs'
      }
    , libs: {
        files: {
          'angular.js': 'angular/angular.js'
        , 'angular-route.js': 'angular-route/angular-route.js'
        , 'angular-resource.js': 'angular-resource/angular-resource.js'
        , 'jquery.js': 'jquery/dist/jquery.js'
        , 'bootstrap.js': 'bootstrap/dist/js/bootstrap.js'
        }
      }
    }
  , jscs: {
      src: [ 'Gruntfile.js', 'src/*.js' ]
    , options: {
        config: '.jscsrc'
      }
    }
  , jshint: {
      files: [ 'Gruntfile.js', 'src/*.js' ]
    , options: {
        'globals': {
          'angular': true
        , 'inject': true
        , 'expect': true
        }
      , 'asi': true
      , 'mocha': true
      , 'boss': true
      , 'browser': true
      , 'camelcase': true
      , 'curly': false
      , 'devel': true
      , 'eqeqeq': true
      , 'eqnull': true
      , 'es5': false
      , 'esversion': 6
      , 'evil': false
      , 'immed': false
      , 'indent': 2
      , 'latedef': false
      , 'laxbreak': true
      , 'laxcomma': true
      , 'maxcomplexity': 15
      , 'maxdepth': 4
      , 'maxstatements': 25
      , 'newcap': true
      , 'node': true
      , 'noempty': false
      , 'nonew': true
      , 'quotmark': 'single'
      , 'smarttabs': true
      , 'strict': false
      , 'trailing': false
      , 'undef': true
      , 'unused': true
      , 'sub':true
      }
    }
  , uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      }
    , build: {
        src: 'dist/app.js'
      , dest: 'dist/app.min.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-bowercopy')
  grunt.loadNpmTasks('grunt-contrib-concat')

  // Default task(s).
  grunt.registerTask('default', [ 'jshint', 'jscs', 'bowercopy', 'concat', 'uglify' ])

}
