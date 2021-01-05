const appRoot = require('app-root-path')
const dependencyTree = require('dependency-tree')

const getDependencyTree = path => {
  const tree = dependencyTree({
    filename: path,
    directory: `${appRoot}/src/html`,
    nodeModulesConfig: {
      entry: 'module'
    },
    filter: path => path.indexOf('node_modules') === -1,
    nonExistent: []
  })
  // ツリー構造になっているので並列に変換
  const str = JSON.stringify(tree).toString()
  return str.match(/(?<="\/).*?(?=")/g).filter((value, index, self) => self.indexOf(value) === index)
}
process.once('message', files => {
  let cache = {}
  for (let i = 0; i < files.length; i++) {
    const target = `${appRoot}/src/html/template/${files[i]}`
    cache[target] = getDependencyTree(target)
  }
  process.send(cache)
})
