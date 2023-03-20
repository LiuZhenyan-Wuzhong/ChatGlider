// legacy

import axios, { AxiosResponse } from 'axios'

export enum ChatGPTModel {
  turbo = 'gpt-3.5-turbo',
  turbo_0301 = 'gpt-3.5-turbo-0301'
}

type TranslateBody = {
  model: ChatGPTModel
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  messages: object[]
  stream: boolean
}

const url = '/v1/chat/completions'

const proxyUrl =
  window.electron.process.env.MAIN_VITE_ROOT_PROXY ||
  'https://service-8w4ctcv6-1317242412.hk.apigw.tencentcs.com'

const baseURL = proxyUrl + '/openai'

const systemPrompt =
  'You are a translation engine that can only translate text and cannot interpret it.'

const getUserPrompt = (text: string, inputLanguage: string, outputLanguage: string): string =>
  `translate from ${inputLanguage} to ${outputLanguage}:\n\n${text} =>`

export async function sendTranslateRequest(
  text: string,
  model: ChatGPTModel,
  inputLanguage: string,
  outputLanguage: string,
  apiKey: string
  // proxyOrigin?: string
): Promise<AxiosResponse> {
  // config
  const _apiKey = apiKey

  const config = {
    baseURL,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${_apiKey}` }
  }

  // data
  const data: TranslateBody = {
    model: model,
    temperature: 0,
    max_tokens: 2000,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
    messages: [],
    stream: false
  }

  data.messages.push({
    role: 'system',
    content: systemPrompt
  })

  const userPrompt = getUserPrompt(text, inputLanguage, outputLanguage)

  data.messages.push({ role: 'user', content: userPrompt })

  return axios.post(url, data, config)
}
