import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    name: 'amberDom',
    file: 'dist/amber-dom.js',
    format: 'umd'
  },
  plugins: [
    babel({
      execlude: 'node_modules/**'
    })
  ],
  watch: {
    include: 'src/**'
  }
}