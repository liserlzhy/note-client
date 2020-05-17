const { override, fixBabelImports, addLessLoader } = require('customize-cra')

module.exports = override(
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      '@brand-primary': '#ffac40',
      '@brand-primary-tap': '#a65e00'
    }
  }),
  fixBabelImports('import', {
    libraryName: 'antd-mobile',
    style: true
  })
)