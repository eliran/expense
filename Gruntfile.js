module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json')
  , jade: {
      compile: {
        options: {
        }
      , files: {
          'public/index.html': 'views/index.jade'
        , 'build/home.html': 'views/home.jade'
        , 'build/login.html': 'views/login.jade'
        , 'build/signup.html': 'views/signup.jade'
        , 'build/users.html': 'views/users.jade'
        , 'build/userDetails.html': 'views/userDetails.jade'
        , 'build/expenses.html': 'views/expenses.jade'
        , 'build/editExpense.html': 'views/editExpense.jade'
        , 'build/weeklyExpenses.html': 'views/weeklyExpenses.jade'
        }
      }
    }
  , ngtemplates: {
      expenseApp: {
        cwd: 'build'
      , src: '**.html'
      , dest: 'build/templates.js'
      , options: {
          prefix: 'views/'
        , url: function(url) { return url.replace('.html', '') }
        }
      }
    }
  , concat: {
      options: {
        separator: ';'
      }
    , dist: {
        src: [ 'src/libs/angular.js', 'src/libs/jquery.js', 'src/libs/*.js', 'src/app.js', 'src/*.js', 'build/templates.js', 'src/services/*.js', 'src/controllers/*.js' ]
      , dest: 'build/app.js'
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
        , 'angular-animate.js': 'angular-animate/angular-animate.js'
        , 'angular-local-storage.js': 'angular-local-storage/dist/angular-local-storage.js'
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
        src: 'build/app.js'
      , dest: 'public/app.min.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jade')
  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-contrib-uglify')
  grunt.loadNpmTasks('grunt-jscs')
  grunt.loadNpmTasks('grunt-bowercopy')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-angular-templates')

  // Default task(s).
  grunt.registerTask('default', [ 'jshint', 'jscs', 'bowercopy', 'jade', 'ngtemplates', 'concat', 'uglify' ])

}
