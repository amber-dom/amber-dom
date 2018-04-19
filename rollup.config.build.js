import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  input: 'src/amber-dom.js',
  output: {
    file: 'dist/amber-dom.min.js',
    format: 'umd',
    name: 'amberdom',
    sourcemap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    uglify()
  ]
}