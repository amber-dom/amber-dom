const gulp = require('gulp')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

const moduleNames = ['style', 'events']

function bundle({ inp, outp, fm, outName }) {
  const writer = outName === void 0
    ? (bundle) => {
        return bundle.write({
          exports: 'named',
          file: outp,
          format: fm
        })
      }
    : (bundle) => {
        return bundle.write({
          exports: 'named',
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

gulp.task('build:es', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './amber-dom.esm.js',
    fm: 'es'
  })
})

gulp.task('build:cjs', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './amber-dom.common.js',
    fm: 'cjs'
  })
})

gulp.task('build:browser', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './amber-dom.js',
    fm: 'iife',
    outName: 'amberDOM'
  })
})

gulp.task('build:modules:es', () => {
  for (const name of moduleNames) {
    bundle({
      inp: `./src/modules/${name}.js`,
      outp: `./modules/${name}.js`,
      fm: 'es'
    })
  }
})

gulp.task('default', [
  'build:es',
  'build:cjs',
  'build:browser',
  'build:modules:es'
])