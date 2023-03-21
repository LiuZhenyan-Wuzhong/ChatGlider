import axios, { AxiosResponse } from 'axios'
import OpenAIAPI, { APIHandlerBase, ChatGPTModel } from './openaiAPI'

export default class PolishAPI extends APIHandlerBase {
  constructor(openaiAPI: OpenAIAPI) {
    super(openaiAPI)
  }

  protected getSystemPrompt = (): string => {
    const rootSystemPrompt = this.openaiAPI.rootSystemPrompt

    return `${rootSystemPrompt}, You are a linguistic master and literary figure. I will provide you with a text that needs to be polished and optimized to make it of higher quality. Please keep the original language and do not provide any explanations other than that.`
  }

  protected getUserPrompt = (code: string): string => {
    return `Polish following sentences :\n\n${code}`
  }

  sendPolishRequest(
    code: string,
    model: ChatGPTModel,
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

    const userPrompt = this.getUserPrompt(code)

    data.messages.push({ role: 'user', content: userPrompt })

    return this._sendRequest(path, data, stream, onMessage)
  }
}
