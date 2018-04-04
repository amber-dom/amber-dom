import babel from 'rollup-plugin-babel';

// Convert them to umd for easy testing.
export default [{
  input: 'src/diff/index.js',
  output: {
      file: 'test/diff/index.js',
      format: 'umd',
      name: 'diffModule'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}, {
  input: 'src/h/index.js',
  output: {
    file: 'test/h/index.js',
    format: 'umd',
    name: 'h'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}, {
  input: 'src/patch/index.js',
  output: {
    file: 'test/patch/index.js',
    format: 'umd',
    name: 'patch'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}, {
  input: 'src/vnode/index.js',
  output: {
    file: 'test/vnode/index.js',
    format: 'umd',
    name: 'VNode'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}]