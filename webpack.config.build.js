var path = require('path')

var babelLoader = {
  test: /\.js$/,
  exclude: 'node_modules',
  loader: 'babel-loader'
}

var externalLibs = {
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
    root: 'ReactRedux',
    commonjs2: 'react-redux',
    commonjs: 'react-redux',
    amd: 'react-redux'
  }
};

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.umd.js',
    library: 'ReduxQuest',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [babelLoader]
  },
  externals: externalLibs
}
