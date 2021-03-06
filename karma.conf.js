

// Karma configuration
// Generated on Fri Apr 13 2018 14:27:58 GMT+0800 (CST)
const babel = require('rollup-plugin-babel');


module.exports = function(config) {
  config.set({

    client: {
      captureConsole: false
    },

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    plugins: ['@metahub/karma-rollup-preprocessor', 'karma-*'],


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      'test/index.spec.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/index.spec.js': ['rollup']
    },

    rollupPreprocessor: {
      options: {
        output: {
          // To include inlined sourcemaps as data URIs
          sourcemap: true,
          format: 'iife'
        },
        // To compile with babel using es2015 preset
        plugins: [
          babel({
            presets: [
              ['env', {modules: false}]],
            plugins: ["external-helpers"]
          })
        ]
      }
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'Chrome',
      'ChromeHeadless',
      'ChromeHeadlessNoSandbox',
      'Firefox',
      'FirefoxHeadless',
      'FirefoxDeveloper',
      'FirefoxAurora',
      'FirefoxNightly'],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--disable-translate', '--disable-extensions', '--no-sandbox']
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: [ '-headless' ],
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: process.env.NODE_ENV === 'production' ? true : false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
