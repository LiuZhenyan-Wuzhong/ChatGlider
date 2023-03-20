import axios, { AxiosResponse } from 'axios'
import OpenAIAPI, { APIHandlerBase, ChatGPTModel } from './openaiAPI'

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

export default class ChatAPI extends APIHandlerBase {
  constructor(openaiAPI: OpenAIAPI) {
    super(openaiAPI)
  }

  protected getSystemPrompt = (): string => {
    const rootSystemPrompt = this.openaiAPI.rootSystemPrompt

    return `${rootSystemPrompt}, You are a chat engine that can talk with human and pay attention to keep scientific, what's more, say I don't know when you don't know the answer of user's question.`
  }

  protected getUserPrompt = (text: string): string => {
    return `${text} =>`
  }

  sendChatRequest(
    text: string,
    model: ChatGPTModel,
    stream?: boolean,
    onMessage?: (text: string) => void
  ): Promise<AxiosResponse> {
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
