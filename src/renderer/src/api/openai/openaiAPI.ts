// import axios, { AxiosResponse, ResponseType } from 'axios';
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  GenericAbortSignal
} from 'axios'
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
  static fetchSSE = async (
    url: string,
    data: object,
    config: {
      method: string
      headers: Partial<AxiosHeaders> // web todo
    },
    signal: AbortSignal,
    onMessage: (data: string) => void
  ): Promise<Response> => {
    const { method, headers } = config

    const res = await fetch(url, { method, headers, body: JSON.stringify(data), signal })
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

    // const resData = await res.json()

    if (!res.body) {
      throw new Error('There is no body of response: ')
    }

    const parser = createParser((event) => {
      if (event.type === 'event') {
        onMessage(event.data)
      }
    })

    // if (!res.body.getReader) {
    //   const body = res.body;
    //   if (!body.on || !body.read) {
    //     throw new ChatGPTError('unsupported "fetch" implementation');
    //   }
    //   body.on("readable", () => {
    //     let chunk;
    //     while (null !== (chunk = body.read())) {
    //       parser.feed(chunk.toString());
    //     }
    //   });
    // } else {

    // }

    for await (const chunk of OpenAIAPI.streamAsyncIterable(res.body!)) {
      const str = new TextDecoder().decode(chunk)
      parser.feed(str)
    }

    return res
  }

  static streamAsyncIterable = async function* (
    stream: ReadableStream<Uint8Array>
  ): AsyncGenerator<Uint8Array, void, unknown> {
    const reader = stream.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          return
        }
        yield value
      }
    } finally {
      reader.releaseLock()
    }
  }

  openaiURL?: string

  openAIAPIKey?: string

  chatAbortController = new AbortController()

  rootSystemPrompt = `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.
  Knowledge cutoff: 2021-09-01
  Current date: ${new Date().toISOString().split('T')[0]}`

  constructor(openaiURL?: string, openAIAPIKey?: string) {
    this.openAIAPIKey = openAIAPIKey

    this.openaiURL = openaiURL
  }

  sendStreamRequest = (
    absoluteUrl: string,
    data: object,
    config: { headers: Partial<AxiosHeaders> },
    onMessage: (data: string) => void
  ): Promise<Response> => {
    // const fetchUrl = config.baseURL + url
    console.log(config.headers)

    return OpenAIAPI.fetchSSE(
      absoluteUrl,
      data,
      {
        method: 'POST',
        headers: config.headers
      },
      this.chatAbortController.signal, // web todo
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
    const { openAIAPIKey, openaiURL } = this._openaiAPI

    if (openAIAPIKey === undefined || openAIAPIKey.length === 0) {
      return { valid: false, msg: '缺少APIKey' }
    }

    if (openaiURL === undefined || openaiURL.length === 0) {
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
  ): Promise<AxiosResponse | Response> {
    // valid
    if (!this.openaiAPIValid.valid) {
      throw new Error(this.openaiAPIValid.msg)
    }

    const { openAIAPIKey, openaiURL } = this.openaiAPI

    // url
    const absoluteUrl = openaiURL + path

    // config
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIAPIKey}`
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

  abort(): void {
    this.openaiAPI.chatAbortController.abort()
  }
}
