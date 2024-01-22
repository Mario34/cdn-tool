import got from 'got'
import ora from 'ora'

import type { CDNToolNS } from './types'

const spinner = ora('download...')

const defaultOption: GetPkgsFileOption = {
  pkgList: [],
  fileReady: () => Promise.resolve(),
  getPkgUrl,
}

export interface GetPkgsFileOption {
  pkgList: CDNToolNS.PkgConfig[]
  fileReady?: (fileBuffer: Buffer, pkg: CDNToolNS.PkgConfig) => Promise<void>
  getPkgUrl?: (pkgConfig: CDNToolNS.PkgConfig) => string
}

function getPkgUrl({ name, version }: CDNToolNS.PkgConfig) {
  const [,name_] = name.split('/')
  return `https://registry.npmmirror.com/${name}/-/${name_ || name}-${version}.tgz`
}

export async function getPkgFile(option: GetPkgsFileOption) {
  const {
    pkgList,
    fileReady,
    getPkgUrl,
  } = Object.assign(defaultOption, option)
  spinner.start()
  for (let i = 0; i < pkgList.length; i++) {
    const pkgConfig = pkgList[i]
    const tgzUrl = getPkgUrl(pkgConfig)
    console.log(tgzUrl)
    spinner.text = `download ${pkgConfig.name}@${pkgConfig.version} ${tgzUrl}`
    spinner.text = `download [${i + 1}/${pkgList.length}] ${pkgConfig.name}@${pkgConfig.version} ${tgzUrl}`
    const fileBuffer = await got(tgzUrl).buffer()
    await fileReady(fileBuffer, pkgConfig)
  }
  spinner.stop()
}
