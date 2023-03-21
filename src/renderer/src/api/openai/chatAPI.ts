import axios, { AxiosResponse } from 'axios'
import OpenAIAPI, { APIHandlerBase, ChatGPTModel } from './openaiAPI'

export default class ChatAPI extends APIHandlerBase {
  constructor(openaiAPI: OpenAIAPI) {
    super(openaiAPI)
  }

  protected getSystemPrompt = (): string => {
    const rootSystemPrompt = this.openaiAPI.rootSystemPrompt

    return `${rootSystemPrompt}, You are a chat engine that can talk with human and pay attention to keep scientific, what's more, say I don't know when you don't know the answer of user's question. You must only response the pure content without format. `
  }

  protected getUserPrompt = (text: string): string => {
    return `${text} {"role":"assistant","content": =>`
  }

  sendChatRequest(
    text: string,
    model: ChatGPTModel,
    stream?: boolean,
    onMessage?: (text: string) => void
  ): Promise<AxiosResponse | Response> {
    // url
    const path = '/v1/chat/completions'

    // data
    const data = this.getData(model, [], stream)

    data.messages.push({
      role: 'system',
      content: this.getSystemPrompt()
    })

    const userPrompt = this.getUserPrompt(text)

    data.messages.push({ role: 'user', content: userPrompt })

    return this._sendRequest(path, data, stream, onMessage)
  }
}
