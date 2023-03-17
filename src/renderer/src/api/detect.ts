import axios, { AxiosResponse } from 'axios'

export async function sendDetectReq(
  text: string
  // proxyOrigin?: string
): Promise<AxiosResponse> {
  // url
  const _apiKey = process.env || ''

  const url = `/language/translate/v2/detect?key=${_apiKey}`

  // data
  const data = { text }

  // config
  const baseURL = '/api/google'

  const config = {
    baseURL,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_apiKey}` }
  }

  return axios.post(url, data, config)
}
