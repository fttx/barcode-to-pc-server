// this is a custom dictionary to make it easy to extend/override
// provide a name for an entry, it can be anything such as 'copyAssets' or 'copyFonts'
// then provide an object with a `src` array of globs and a `dest` string
module.exports = {
  copyDragula: {
    src: ['{{ROOT}}/node_modules/dragula/dist/dragula.min.css'],
    dest: '{{BUILD}}'
  },
  copyNgSelect: {
    src: ['{{ROOT}}/node_modules/@ng-select/ng-select/themes/default.theme.css'],
    dest: '{{BUILD}}'
  },
}
