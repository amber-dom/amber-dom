import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

// Convert them to umd for easy testing.
export default [{
  input: 'src/index.js',
  output: {
    file: 'test/amberdom.js',
    format: 'umd',
    name: 'amberdom',
    sourcemap: true
  },
  watch: {
    include: 'src/**/*.js'
  }
  ,
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),

    serve({
      open: true,
      verbose: true,
      contentBase: 'test',
      host: 'localhost',
      port: 8080,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    }),

    livereload()
  ],
}];