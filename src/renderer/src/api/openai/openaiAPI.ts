// import axios, { AxiosResponse, ResponseType } from 'axios';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, GenericAbortSignal } from 'axios'
import { createParser } from 'eventsource-parser'
import { v4 as uuidv4 } from 'uuid'

// const result = {
//   role: "assistant",
//   id: uuidv4(),
//   parentMessageId: messageId,
//   text: ""
// };

export enum ChatGPTModel {
  turbo = 'gpt-3.5-turbo',
  turbo_0301 = 'gpt-3.5-turbo-0301'
}

export type OpenAIReqBody = {
  model: ChatGPTModel
  temperature: number
  max_tokens: number
  top_p: number
  frequency_penalty: number
  presence_penalty: number
  messages: object[]
  stream: boolean
}

export default class OpenAIAPI {
  static axiosSSE = async (
    url: string,
    data: object,
    config: AxiosRequestConfig,
    onMessage: (data: string) => void
  ): Promise<AxiosResponse> => {
    config.responseType = 'stream'

    const res = await axios
      .post(url, data, config)
      .then((res) => res)
      .catch((err) => {
        if (err instanceof AxiosError && err.response) {
          const status = err.response.status

          const reason = err.response.data?.error?.message || err.request.statusText

          const msg = `ChatGPT error ${status}: ${reason}`
          throw new Error(msg)
        } else {
          throw new Error(err)
        }
      })

    if (!res.data) {
      throw new Error('There is no content of response: ', res.data)
    }

    const parser = createParser((event) => {
      if (event.type === 'event') {
        onMessage(event.data)
      }
    })

    res.data.on('readable', () => {
      let chunk
      while (null !== (chunk = res.data.read())) {
        parser.feed(chunk.toString())
      }
    })

    return res
  }

  openaiURL?: string

  apiKey?: string

  chatAbortController = new AbortController()

  rootSystemPrompt = `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.
  Knowledge cutoff: 2021-09-01
  Current date: ${new Date().toISOString().split('T')[0]}`

  constructor(openaiURL?: string, apiKey?: string) {
    this.apiKey = apiKey

    this.openaiURL = openaiURL
  }

  sendStreamRequest = (
    absoluteUrl: string,
    data: object,
    config: AxiosRequestConfig,
    onMessage: (data: string) => void
  ): Promise<AxiosResponse> => {
    // const fetchUrl = config.baseURL + url

    return OpenAIAPI.axiosSSE(
      absoluteUrl,
      data,
      {
        headers: config.headers,
        method: 'POST',
        signal: this.chatAbortController.signal // web todo
      },
      onMessage
    )
  }

  sendCommonRequest = (url: string, data: object, config: AxiosRequestConfig): Promise<void> => {
    return axios.post(url, data, config)
  }
}

export abstract class APIHandlerBase {
  _openaiAPI: OpenAIAPI
  get openaiAPI(): OpenAIAPI {
    return this._openaiAPI
  }

  protected get openaiAPIValid(): { valid: boolean; msg?: string } {
    const { apiKey, openaiURL } = this._openaiAPI

    if (apiKey === undefined) {
      return { valid: false, msg: '缺少APIKey' }
    }

    if (openaiURL === undefined) {
      return { valid: false, msg: '缺少openaiURL' }
    }

    return { valid: true }
  }

  constructor(openaiAPI: OpenAIAPI) {
    this._openaiAPI = openaiAPI
  }

  protected abstract getSystemPrompt: () => string

  protected abstract getUserPrompt: (...args: string[]) => string

  protected getData = (
    model: ChatGPTModel,
    messages: object[] = [],
    stream = false
  ): OpenAIReqBody => {
    return {
      model,
      temperature: 0,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 1,
      presence_penalty: 1,
      messages,
      stream
    }
  }

  protected _sendRequest(
    path: string,
    data: OpenAIReqBody,
    stream?: boolean,
    onMessage?: (text: string) => void
  ): Promise<AxiosResponse> {
    // valid
    if (!this.openaiAPIValid.valid) {
      throw new Error(this.openaiAPIValid.msg)
    }

    const { apiKey, openaiURL } = this.openaiAPI

    // url
    const absoluteUrl = openaiURL + path

    // config
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      }
    }

    if (stream) {
      if (onMessage === undefined) {
        throw Error('采用流式传递时必须指定onMessage函数')
      }

      return this.openaiAPI.sendStreamRequest(absoluteUrl, data, config, onMessage)
    } else {
      return axios.post(absoluteUrl, data, config)
    }
  }
}
