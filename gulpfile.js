const gulp = require('gulp')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

function bundle({ inp, outp, fm, outName }) {
  const writer = outName === void 0
    ? (bundle) => {
        return bundle.write({
          file: outp,
          format: fm
        })
      }
    : (bundle) => {
        return bundle.write({
          file: outp,
          format: fm,
          name: outName
        })
      }

  return rollup.rollup({
    input: inp,
    plugins: [
      babel({
        presets: [
          ['env', {modules: false}]
        ],
        plugins: ["external-helpers"]
      })
    ]
  }).then(writer)
}

gulp.task('build:core:es', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './amber-dom.esm.js',
    fm: 'es'
  })
})

gulp.task('build:modules:es', () => {
  return bundle({
    inp: './src/modules/modules.js',
    outp: './modules/modules.esm.js',
    fm: 'es'
  })
})

gulp.task('build:core:cjs', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './amber-dom.common.js',
    fm: 'cjs'
  })
})

gulp.task('build:modules:cjs', () => {
  return bundle({
    inp: './src/modules/modules.js',
    outp: './modules/modules.common.js',
    fm: 'cjs'
  })
})

gulp.task('build:core:browser', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './amber-dom.js',
    fm: 'iife',
    outName: 'amberDOM'
  })
})

gulp.task('build:modules:browser', () => {
  return bundle({
    inp: './src/modules/modules.js',
    outp: './modules/modules.js',
    fm: 'iife',
    outName: 'modules'
  })
})

gulp.task('default', [
  'build:core:es',
  'build:modules:es',
  'build:core:cjs',
  'build:modules:cjs',
  'build:core:browser',
  'build:modules:browser'
])