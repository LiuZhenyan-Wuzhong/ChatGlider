import RPCClient from '@alicloud/pop-core'

import { SpeechSynthesizer } from 'alibabacloud-nls'

const client = new RPCClient({
  accessKeyId: 'LTAI5t7W2MKMyqi91C94Dn4r',
  accessKeySecret: 'wXLWo1bhe35uh4E5NTvmzTceudf6dq',
  endpoint: 'http://nls-meta.cn-shanghai.aliyuncs.com',
  apiVersion: '2019-02-28'
})

const getToken = async (): Promise<string> => {
  const res = await client.request<{ Token: { Id: string } }>('CreateToken', {})

  // console.log(res.Token);
  // console.log('get token = ' + res.Token.Id);
  // console.log('expireTime = ' + res.Token.ExpireTime);

  return res.Token.Id
}

const sendSynthesizeReq = async (
  text: string,
  token: string,
  onMessage: (msg: Buffer) => void = (msg: Buffer): void => {}
): Promise<void> => {
  const url = 'wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1'

  const appkey = 'YTllUlYKz43Wpypv'

  const format = 'MP3'

  const tts = new SpeechSynthesizer({
    url,
    appkey,
    token,
    format
  })

  tts.on('meta', (msg: string) => {
    console.log('Client recv metainfo:', msg)
  })

  tts.on('data', (msg: Buffer) => {
    console.log(`recv size: ${msg.length}`)

    onMessage(msg)
  })

  tts.on('completed', (msg: string) => {
    console.log('Client recv completed:', msg)
  })

  tts.on('closed', () => {
    console.log('Client recv closed')
  })

  tts.on('failed', (msg: string) => {
    console.log('Client recv failed:', msg)
  })

  const param = tts.defaultStartParams()
  param.text = text

  try {
    await tts.start(param)
  } catch (error) {
    console.error('error on start:', error)
  }

  console.log('synthesis done')
}

export default async function transcribe(
  text: string,
  onMessage: (msg: Buffer) => void
): Promise<void> {
  const token = await getToken()

  sendSynthesizeReq(text, token, onMessage)
}
