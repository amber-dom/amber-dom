const gulp = require('gulp')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')

const moduleNames = ['style', 'events', 'dataset']

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
    outp: './amber-dom.js',
    fm: 'es'
  })
})

gulp.task('build:cjs', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './commonjs/amber-dom.common.js',
    fm: 'cjs'
  })
})

gulp.task('build:browser', () => {
  return bundle({
    inp: './src/amber-dom.js',
    outp: './browser/amber-dom.js',
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

gulp.task('build:modules:browser', () => {
  for (const name of moduleNames) {
    bundle({
      inp: `./src/modules/${name}.js`,
      outp: `./browser/modules/${name}.browser.js`,
      fm: 'iife',
      outName: `${name}`
    })
  }
})

gulp.task('build:modules:cjs', () => {
  for(const name of moduleNames) {
    bundle({
      inp: `./src/modules/${name}.js`,
      outp: `./commonjs/modules/${name}.common.js`,
      fm: 'cjs'
    })
  }
})

gulp.task('default', [
  'build:es',
  'build:cjs',
  'build:browser',
  'build:modules:es',
  'build:modules:browser',
  'build:modules:cjs'
])