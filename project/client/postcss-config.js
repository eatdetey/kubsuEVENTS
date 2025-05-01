module.exports = {
    plugins: [
      require('postcss-normalize')({
        allowDuplicates: false,
        forceImport: true
      })
    ]
  }