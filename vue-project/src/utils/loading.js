import { ElLoading } from "element-plus"

// style
const loadingStyle = {
  lock: true,
  text: 'Loading',
  background: 'rgba(0, 0, 0, 0.7)',
}
let load = null
const loading = {
  loading: () => {
    !load && (load = ElLoading.service(loadingStyle))
  },
  close: () => {
    load && load.close()
  }
}

export default loading;