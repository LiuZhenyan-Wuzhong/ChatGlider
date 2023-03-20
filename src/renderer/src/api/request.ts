// legacy

import axios from 'axios'

// const serverSideBaseURL = `${process.env.NEXT_PUBLIC_BASE_URL}/api`

const baseURL = `https://service-8w4ctcv6-1317242412.hk.apigw.tencentcs.com/v1`

const OPENAI_API_KEY = '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'

const apiAxios = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` }
})

export default apiAxios
