# cdn-tool

cdn文件工具

## 示例

```js
import { getPkgFile } from '@mario34/cdn-tool'

getPkgFile({
  pkgList,
  async fileReady(fileBuffer, filePath) {
    // 处理文件
  },
})
```
