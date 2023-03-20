import axios, { AxiosResponse } from 'axios'
import OpenAIAPI, { APIHandlerBase, ChatGPTModel, OpenAIReqBody } from './openaiAPI'

// const result = {
//   role: "assistant",
//   id: uuidv4(),
//   parentMessageId: messageId,
//   text: ""
// };

// (data) => {
// const resultText = ''

//     const resultDelta = ''
//   let _a2
//   if (data === '[DONE]') {
//     resultText = resultText.trim()
//     return resolve(resultText)
//   }
//   try {
//     const response = JSON.parse(data)
//     if (response.id) {
//       // result.id = response.id;
//     }
//     if (
//       (_a2 = response == null ? void 0 : response.choices) == null ? void 0 : _a2.length
//     ) {
//       const delta = response.choices[0].delta // chunk
//       resultDelta = delta.content
//       if (delta == null ? void 0 : resultDelta) {
//         resultText += resultDelta
//         console.log(resultText)
//         if (delta.role) {
//           // result.role = delta.role;
//         }
//       }

//       // onProgress == null ? void 0 : onProgress(result);
//     }
//   } catch (err) {
//     console.warn('OpenAI stream SEE event unexpected error', err)
//     return reject(err)
//   }
// }

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
  ): Promise<AxiosResponse> {
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
