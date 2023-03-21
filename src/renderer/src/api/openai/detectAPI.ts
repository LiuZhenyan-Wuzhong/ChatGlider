import axios, { AxiosResponse } from 'axios'
import OpenAIAPI, { APIHandlerBase, ChatGPTModel } from './openaiAPI'

export default class DetectAPI extends APIHandlerBase {
  constructor(openaiAPI: OpenAIAPI) {
    super(openaiAPI)
  }

  protected getSystemPrompt = (): string => {
    const rootSystemPrompt = this.openaiAPI.rootSystemPrompt

    return `${rootSystemPrompt}, You are a translation engine that can only detect the language of my words, don't explain anything.`
  }

  protected getUserPrompt = (text: string): string => {
    return `detect the language of following sentences :\n\n${text} =>`
  }

  sendDetectRequest(text: string, model: ChatGPTModel): Promise<AxiosResponse | Response> {
    // path
    const path = '/v1/chat/completions'

    // data
    const data = this.getData(model, [])

    data.messages.push({
      role: 'system',
      content: this.getSystemPrompt()
    })

    const userPrompt = this.getUserPrompt(text)

    data.messages.push({ role: 'user', content: userPrompt })

    return this._sendRequest(path, data)
  }
}
