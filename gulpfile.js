const gulp = require('gulp')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')

gulp.task('build:es', () => {
  return rollup.rollup({
    //experimentalCodeSplitting: true,
    input:
      './src/amber-dom',
    plugins: [
      babel({
        presets: [
          ['env', {modules: false}]
        ],
        plugins: ["external-helpers"]
      })
    ]
  }).then(bundle => {
    return bundle.write({
      sourcemapFile: './dist/amber-dom.sourceMap.ejs',
      file: './dist/amber-dom.ejs',
      format: 'es'
    })
  })
})