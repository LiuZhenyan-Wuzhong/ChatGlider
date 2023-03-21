import axios, { AxiosResponse } from 'axios'
import OpenAIAPI, { APIHandlerBase, ChatGPTModel } from './openaiAPI'

export default class CodeExplainAPI extends APIHandlerBase {
  constructor(openaiAPI: OpenAIAPI) {
    super(openaiAPI)
  }

  protected getSystemPrompt = (): string => {
    const rootSystemPrompt = this.openaiAPI.rootSystemPrompt

    return `${rootSystemPrompt}, You are a code explanation engine, you can only explain the code, do not interpret or translate it. What's more, you can only add some explanation but can't remove or change any current code. Also, please report any bugs you find in the code to the author of the code. Finally, you should always return Chinese. Like this:
    user: Explain following codes :\n\nconsole.log('apple');

    assistant:// You provide javascript codes. \n console.log('apple'); \n  // This program means print the word 'apple' in console.
    `
  }

  protected getUserPrompt = (code: string): string => {
    return `Explain following codes :\n\n${code}`
  }

  sendCodeExplainRequest(
    code: string,
    model: ChatGPTModel,
    stream?: boolean,
    onMessage?: (text: string) => void
  ): Promise<AxiosResponse> {
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
