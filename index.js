import got from 'got'
import OSS from 'ali-oss'
import path from 'path'
import { cdnModules } from './modules.js'

/**
 * 命令行参数
 * OSS_KEY: 对应OSS accessKeyId
 * OSS_SECRET: 对应OSS accessKeySecret
 * OSS_SECRET: 对应OSS accessKeySecret
 */
// const client = new OSS({
//   region: 'oss-cn-hangzhou',
//   accessKeyId: argv.OSS_KEY,
//   accessKeySecret: argv.OSS_SECRET,
//   bucket: 'beicai-dev',
// })

/**
 * 模块配置
 * @typedef {Object} Modules
 * @property {string} name
 * @property {string} version
 */

/**
 * 文件信息
 * @typedef {Object} File
 * @property {string} name
 * @property {string} version
 * @property {string} hash
 * @property {string} size
 * @property {File} files
 */

/**
 * jsdelivr返回的包信息
 * @typedef {Object} PackageInfo
 * @property {string} name
 * @property {string} type
 * @property {string} version
 * @property {string} default
 * @property {File[]} files
 * @property {{ status: string, entrypoints: string }} links
 */

/**
 * 处理后的文件
 * @typedef {Object} FileItem
 * @property {string} name
 * @property {string} hash
 * @property {string} size
 * @property {string} path
 */

/**
 * 下载外部cdn源文件
 * @param {Modules[]} modules
 */
async function downloadFileFormExternal(modules) {
  for(let i = 0; i < modules.length; i++) {
    const { name, version } = modules[i]
    /**
     * @type {PackageInfo}
     */
    const pkgInfo = await got(getPackageApi(`${name}@${version}`)).json()
    console.log({
      ...pkgInfo,
      files: getFilesInfo(pkgInfo.files, '/'),
    })
  }
}

/**
 * @param {File} file
 * @param {string} root
 * @returns {FileItem[]}
 */
function getFileInfo(file, root) {
  const results = []
  if (file.type === 'directory' && file.files?.length) {
    results.push(...getFilesInfo(file.files, path.join(root, file.name)))

  } else {
    results.push({
      name: file.name,
      size: file.size,
      hash: file.hash,
      path: path.join(root, file.name)
    })
  }
  return results
}

/**
 * @param {File[]} files
 * @param {string} root
 * @returns {FileItem[]}
 */
function getFilesInfo(files, root) {
  const results = []
  files.forEach((item) => {
    results.push(...getFileInfo(item, root))
  }) 
  return results
}

function getPackageApi(packageName){
  return `https://data-jsdelivr-com-preview.onrender.com/v1/packages/npm/${packageName}`
}

async function main() {
  downloadFileFormExternal(cdnModules)
}

main()