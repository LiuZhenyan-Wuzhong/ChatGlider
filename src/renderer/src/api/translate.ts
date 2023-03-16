import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

type TranslateBody = {
  model: string
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  messages: object[]
  stream: boolean
}

const getTranslateBody = (): TranslateBody => ({
  model: 'gpt-3.5-turbo-0301',
  temperature: 0,
  max_tokens: 2000,
  top_p: 1,
  frequency_penalty: 1,
  presence_penalty: 1,
  messages: [],
  stream: false
})

const url = '/chat/completions'

const systemPrompt =
  'You are a translation engine that can only translate text and cannot interpret it.'

const getUserPrompt = (text: string): string => `translate from en to zh-CN:\n\n${text} =>`

export async function sendTranslateRequest(
  text: string,
  apiKey?: string,
  proxyOrigin?: string
): Promise<AxiosResponse> {
  // config
  const _apiKey = apiKey || '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'

  const _proxyOrigin = proxyOrigin || 'https://service-8w4ctcv6-1317242412.hk.apigw.tencentcs.com'

  const baseURL = _proxyOrigin + '/v1'

  const config = {
    baseURL,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_apiKey}` }
  }

  // data
  const data = getTranslateBody()

  data.messages.push({
    role: 'system',
    content: systemPrompt
  })

  const userPrompt = getUserPrompt(text)

  data.messages.push({ role: 'user', content: userPrompt })

  return axios.post(url, data, config)
}
