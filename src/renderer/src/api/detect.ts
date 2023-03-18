import axios, { AxiosResponse } from 'axios'

export async function sendDetectReq(
  text: string,
  apiKey: string
  // proxyOrigin?: string
): Promise<AxiosResponse> {
  // url
  const _apiKey = ''

  const url = `/language/translate/v2/detect?key=${_apiKey}`

  // data
  const data = { text }

  // config
  const baseURL = '/api/googleapis'

  const config = {
    baseURL,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_apiKey}` }
  }

  return axios.post(url, data, config)
}
