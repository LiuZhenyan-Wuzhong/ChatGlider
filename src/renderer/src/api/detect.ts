// legacy
import axios, { AxiosResponse } from 'axios'

export async function sendDetectReq(
  text: string,
  apiKey: string
  // proxyOrigin?: string
): Promise<AxiosResponse> {
  // url
  const _apiKey = ''

  const url = `/language/translate/v2/detect?key=${_apiKey}`

  const proxyUrl =
    window.electron.process.env.MAIN_VITE_ROOT_PROXY ||
    'https://service-8w4ctcv6-1317242412.hk.apigw.tencentcs.com'

  const baseURL = proxyUrl + '/googleapis'

  // data
  const data = { text }

  // config
  const config = {
    baseURL,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_apiKey}` }
  }

  return axios.post(url, data, config)
}
