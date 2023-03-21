import axios, { AxiosResponse } from 'axios'
import OpenAIAPI, { APIHandlerBase, ChatGPTModel, OpenAIReqBody } from './openaiAPI'

export default class TranslateAPI extends APIHandlerBase {
  constructor(openaiAPI: OpenAIAPI) {
    super(openaiAPI)
  }

  protected getSystemPrompt = (): string => {
    const rootSystemPrompt = this.openaiAPI.rootSystemPrompt

    return `${rootSystemPrompt}, You are a translation engine that can only translate text and cannot interpret it.`
  }

  protected getUserPrompt = (
    text: string,
    inputLanguage: string,
    outputLanguage: string
  ): string => {
    return `translate from ${inputLanguage} to ${outputLanguage}:\n\n${text} =>`
  }

  sendTranslateRequest(
    text: string,
    model: ChatGPTModel,
    inputLanguage: string,
    outputLanguage: string,
    stream?: boolean,
    onMessage?: (text: string) => void
  ): Promise<AxiosResponse | Response> {
    // path
    const path = '/v1/chat/completions'

    // data
    const data = this.getData(model, [], stream)

    data.messages.push({
      role: 'system',
      content: this.getSystemPrompt()
    })

    const userPrompt = this.getUserPrompt(text, inputLanguage, outputLanguage)

    data.messages.push({ role: 'user', content: userPrompt })

    return this._sendRequest(path, data, stream, onMessage)
  }
}
