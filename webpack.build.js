var path = require('path')

var babelLoader = {
  test: /\.js$/,
  exclude: 'node_modules',
  loader: 'babel-loader'
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.umd.js',
    library: 'redux-remote-data',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [babelLoader]
  },
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    redux: {
      root: 'redux',
      commonjs2: 'redux',
      commonjs: 'redux',
      amd: 'redux'
    },
    'react-redux': {
      root: 'reactRedux',
      commonjs2: 'reactRedux',
      commonjs: 'reactRedux',
      amd: 'redux'
    }
  }
}
