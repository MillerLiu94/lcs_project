import axios from 'axios'

// 全站唯一的 axios instance。所有 service 都經此呼叫 /api/*，
// 由 mock adapter（開發／demo）或真後端攔截。
const http = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export default http
