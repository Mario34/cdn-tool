export namespace CDNToolNS {
  export interface File {
    name: string
    size: string
    hash: string
  }
  export interface PkgConfig {
    name: string
    version: string
  }
  export interface PkgInfo {
    name: string
    type: string
    version: string
    default: string
    files: File[]
  }
}
