import {
  AllHTMLAttributes,
  Context,
  forwardRef,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { ReactComponent as SwitchIcon } from '@renderer/assets/img/switch.svg'
import { ReactComponent as RollingIcon } from '@renderer/assets/img/rolling.svg'
import { ReactComponent as ArrowIcon } from '@renderer/assets/img/arrow.svg'
import { ReactComponent as MuteIcon } from '@renderer/assets/img/mute.svg'
import { ReactComponent as SpeakIcon } from '@renderer/assets/img/speak.svg'
import { ReactComponent as ScissorsIcon } from '@renderer/assets/img/scissors.svg'
import { ReactComponent as CopyIcon } from '@renderer/assets/img/copy.svg'
import { ReactComponent as ContactIcon } from '@renderer/assets/img/contact.svg'
import { ReactComponent as SettingIcon } from '@renderer/assets/img/setting.svg'
import { ReactComponent as SendIcon } from '@renderer/assets/img/send.svg'
import Button from '../../../commonComps/Button'
import { AppContext, AppContextI } from '@renderer/App'
import { AxiosError } from 'axios'
import { MainPanelContext, MainPanelContextI } from '../..'
import ChatAPI from '@renderer/api/openai/chatAPI'
import { ChatGPTModel } from '@renderer/api/openai/openaiAPI'
import BinaryButton from '@renderer/components/commonComps/BinaryButton'
import { githubLightInit } from '@uiw/codemirror-theme-github'
import { EditorView } from '@codemirror/view'
import CodeLangSelect from '@renderer/components/commonComps/Select'
import { v4 as uuidv4 } from 'uuid'
import clsx from 'clsx'
// import transcribe from '@renderer/api/alicloud'

enum Role {
  system = 'system',
  user = 'user',
  assistant = 'assistant'
}

type Message = {
  role: Role
  id: string
  parentId: string | null
  content: string
}

type ChatPostItem = {
  role: Role
  content: string
}

const createMessage = (role: Role, content: string, parentId: string | null): Message => {
  return {
    role,
    id: Date.now().toString(),
    content,
    parentId
  }
}

interface MessageBoxProps extends AllHTMLAttributes<HTMLDivElement> {
  message: Message
}

function MessageBox({ className, message }: MessageBoxProps): JSX.Element {
  const { role, id, parentId, content } = message
  return (
    <div
      id={id}
      className={clsx(
        'max-w-3/4 rounded-lg border p-3 mx-auto',
        role === Role.assistant ? 'bg-gray-200 font-medium ml-0' : '',
        role === Role.user ? 'bg-white mr-0' : '',
        className
      )}
    >
      <span className={clsx('font-semibold leading-6')}>{role}:</span>
      <br />
      <span className="text-sm">{content}</span>
    </div>
  )
}

interface ChatProps extends AllHTMLAttributes<HTMLDivElement> {}

function Chat({ className }: ChatProps, ref): JSX.Element {
  // context
  const { openAIAPIRef } = useContext(AppContext as Context<AppContextI>)

  const { inputFromClipBoard, stream } = useContext(MainPanelContext as Context<MainPanelContextI>)

  // state
  const [input, setInput] = useState<string>(``)

  const [model, setModel] = useState<ChatGPTModel>(ChatGPTModel.turbo_0301)

  const [output, setOutput] = useState<string>('')

  const [isAborting, setIsAborting] = useState<boolean>(false)

  const [isSending, setIsSending] = useState<boolean>(false)

  const [history, setHistory] = useState<Message[]>([])

  const [curOutputMessage, setCurOutputMessage] = useState<Message | null>(null)

  // ref
  const chatAPIRef = useRef(new ChatAPI(openAIAPIRef.current))

  const inputTextRef = useRef<HTMLTextAreaElement>(null)

  const sendingMessageIdRef = useRef<string | null>(null)

  const newestMessageIdRef = useRef<string | null>(null)

  const receivingMessageRef = useRef<Message | null>(null)

  const abortRef = useRef<boolean>(false)

  const chatHistoryRef = useRef<HTMLDivElement>(null)

  // callback
  const handleError = useCallback((err: unknown) => {
    if (err instanceof AxiosError && err.response) {
      console.error('status: ', err.response.status)

      console.error('data: ', err.message)
    } else {
      console.error('error: ', err)
    }
  }, [])

  const handleReceivingMesError = useCallback(
    (err: unknown, receivingMessageRef: MutableRefObject<Message>) => {
      if (err instanceof AxiosError && err.response) {
        console.error('status: ', err.response.status)

        console.error('data: ', err.message)

        receivingMessageRef.current.content = `Error: ${err.response.status} ${err.message}`
      } else {
        console.error('error: ', err)

        receivingMessageRef.current.content = `Error`
      }
    },
    []
  )

  const buildPrompt = async (messages: Message[]): Promise<string> => {
    return JSON.stringify(
      messages.map((msg) => {
        const { role, content } = msg
        return { role, content }
      })
    )
  }

  const handleSendMessage = useCallback(async () => {
    console.log('sending chat: ', input)

    setInput('')

    const newMsg = createMessage(Role.user, input, newestMessageIdRef.current)

    const messages = [...history, newMsg].filter((msg) => msg !== null)

    setHistory(messages)

    const prompt = await buildPrompt(messages)

    sendingMessageIdRef.current = newMsg.id

    const receivingMsg = createMessage(Role.assistant, '', sendingMessageIdRef.current)

    receivingMessageRef.current = receivingMsg

    setIsSending(true)

    try {
      if (stream) {
        await sendMessage(prompt, true, onMessage)
      } else {
        const text = await sendMessage(prompt)
        if (!abortRef.current) {
          receivingMessageRef.current.content = text

          setHistory((prev) => [...prev, receivingMessageRef.current!])
        }
      }
    } catch (err: unknown) {
      handleReceivingMesError(err, receivingMessageRef as MutableRefObject<Message>)
    } finally {
      setIsSending(false)
    }
  }, [input, sendingMessageIdRef, receivingMessageRef, stream])

  const onMessage = (data: string): void => {
    if (!receivingMessageRef.current) {
      console.log('receivingMessageRef.current is null')

      return
    }

    if (data === '[DONE]') {
      console.log('All data is receiveed.')

      console.log('Result is:', receivingMessageRef.current.content)

      setHistory((prevs) => [...prevs, receivingMessageRef.current!])

      setCurOutputMessage(null)

      // receivingMessageRef.current = null

      // sendingMessageIdRef.current = null

      // sendingMessageIdRef.current = null

      return
    }

    try {
      let _a2
      const response = JSON.parse(data)
      if ((_a2 = response == null ? void 0 : response.choices) == null ? void 0 : _a2.length) {
        const delta = response.choices[0].delta // chunk
        if (delta.content) {
          const receivingText = receivingMessageRef.current.content

          receivingMessageRef.current.content = receivingText + delta.content

          setCurOutputMessage(receivingMessageRef.current)
        } else {
          // console.error(delta)
        }
      } else {
        console.error(response)
      }
    } catch (err) {
      handleReceivingMesError(err, receivingMessageRef as MutableRefObject<Message>)
    }
  }

  const sendMessage = useCallback(
    async (text: string, stream?: boolean, onMessage?: (text: string) => void): Promise<string> => {
      return chatAPIRef.current.sendChatRequest(text, model, stream, onMessage).then((res) => {
        if (res instanceof Response) {
          console.log(res)
        } else {
          console.log(res)
          return res.data.choices[0].message.content
        }
      })
    },
    [model, chatAPIRef]
  )

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      setInput(e.currentTarget.value)
    },
    [setInput]
  )

  const handleAbort = useCallback(async () => {
    setIsAborting(false)
    try {
      console.log('abort')

      chatAPIRef.current.abort()
    } catch (err) {
      console.error(err)
    } finally {
      setIsAborting(true)
    }
  }, [chatAPIRef])

  const handleClickActive: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      await handleAbort()
      setIsSending(false)
    },
    [handleAbort, setIsSending]
  )

  const handleClickMute: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      setIsSending(true)
      console.log('active')

      handleSendMessage()
    },
    [handleSendMessage, setIsSending]
  )

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
    }
  }, [chatHistoryRef, history])

  return (
    <div id="panel-body" className="relative flex-grow w-full rounded-xl">
      <div className="absolute inset-0 p-4 flex flex-col gap-2">
        <div
          id="chat-history"
          className="flex flex-col z-10 p-3 flex-grow rounded-xl bg-white overflow-y-scroll gap-4"
          ref={chatHistoryRef}
        >
          {history.map((message) => message && <MessageBox message={message} key={message.id} />)}
          {curOutputMessage && <MessageBox message={curOutputMessage} />}
        </div>
        <div id="chat-editor" className="flex flex-col z-10 p-3 h-32 rounded-xl bg-white">
          <textarea
            id="inputText"
            ref={inputTextRef}
            className="w-full h-min-24 focus:outline-none flex-grow verflow-y-scroll overflow-x-hidden scroll-mr-2"
            placeholder="请输入您的问题或者聊天内容"
            value={input}
            onChange={handleChange}
            style={{ resize: 'none' }}
          />
          <div className="h-8 rounded-b-xl flex text-sm items-center bg-white justify-between">
            <div className="flex"></div>
            <Button disabled={isSending} onClick={handleClickMute}>
              <SendIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default forwardRef(Chat)
