import {
  AllHTMLAttributes,
  Context,
  forwardRef,
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
// import transcribe from '@renderer/api/alicloud'

enum Role {
  system = 'Role/system',
  user = 'Role/user',
  assistant = 'Role/assistant'
}

type Message = {
  role: Role
  id: string
  parentMessageId: string
  text: string
}

interface ChatProps extends AllHTMLAttributes<HTMLDivElement> {}

function Chat({ className }: ChatProps, ref): JSX.Element {
  // context
  const { openAIAPIRef } = useContext(AppContext as Context<AppContextI>)

  const { inputFromClipBoard, stream } = useContext(MainPanelContext as Context<MainPanelContextI>)

  // state
  const [input, setInput] = useState<string>(`function hello(who = "world") {
    console.log(\`Hello, \${who}!\`)
  }`)

  const [model, setModel] = useState<ChatGPTModel>(ChatGPTModel.turbo_0301)

  const [output, setOutput] = useState<string>('')

  const [isAborting, setIsAborting] = useState<boolean>(false)

  const [isSending, setIsSending] = useState<boolean>(false)

  const [history, setHistory] = useState<Message[]>([])

  const [curOutputMessage, setCurOutputMessage] = useState<Message | null>(null)

  // ref
  const chatAPIRef = useRef(new ChatAPI(openAIAPIRef.current))

  const inputTextRef = useRef<HTMLTextAreaElement>(null)

  // callback
  const handleSendMessage = useCallback(async () => {
    setIsSending(true)

    console.log('codeExplain: ')

    // console.log('codeExplain: ', input)

    try {
      const text = await codeExplain(input)

      setOutput(text)
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response) {
          console.error('status: ', err.response.status)
          console.error('data: ', err.message)
          setOutput(err.message)
        } else if (err.request) {
          console.error('message: ', err.message)

          setOutput(err.message.toString())
        }
      } else {
        console.error('error: ', err)

        setOutput('error')
      }
    } finally {
      setIsSending(false)
    }
  }, [input])

  const handleSend: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      handleSendMessage()
    },
    [handleSendMessage]
  )

  const codeExplain = useCallback(
    async (text: string): Promise<string> => {
      return chatAPIRef.current.sendChatRequest(text, model).then((res) => {
        console.log(res)
        return res.data.choices[0].message.content
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

  const handleCopy: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      window.electron.ipcRenderer.invoke('copy', output)
    },
    [output]
  )

  const handleRead: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      console.log('read')

      // transcribe(output, _onReceiveBuffer)
    },
    [output]
  )

  const _onReceiveBuffer = useCallback((msg: Buffer): void => {
    console.log(msg)
  }, [])

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

  // effect
  useEffect(() => {
    if (inputFromClipBoard.current) {
      handleSendMessage()
    }
    inputFromClipBoard.current = false
  }, [inputFromClipBoard])

  return (
    <div id="panel-body" className="relative p-4 flex flex-col flex-grow w-full rounded-xl gap-2">
      <div className="flex flex-col">
        <div
          className="w-full rounded-t-xl flex flex-col p-3 h-24 bg-white overflow-auto"
          style={{ resize: 'vertical' }}
        >
          <textarea
            id="inputText"
            ref={inputTextRef}
            className="w-full h-24 p-3 rounded-t-xl focus:outline-none"
            placeholder="请输入要润色的语段"
            value={input}
            onChange={handleChange}
          />
        </div>

        <div className="h-12 rounded-b-2xl p-2 flex text-sm items-center bg-white justify-between">
          {stream ? (
            <BinaryButton
              className="border-white"
              disabled={!isAborting}
              active={isSending}
              onMuteClick={handleClickMute}
              onActiveClick={handleClickActive}
            />
          ) : (
            <Button disabled={isSending}>
              <SendIcon />
            </Button>
          )}
        </div>
      </div>

      <div className="w-full rounded-xl bg-white p-2 flex flex-col flex-grow">
        <div className="rounded-b-2xl flex justify-end gap-2 text-gray-800">
          <Button className="border-white" onClick={handleRead}>
            <SpeakIcon className="border-white w-5 h-5" />
          </Button>
          <Button className="border-white" onClick={handleCopy}>
            <CopyIcon className="border-white w-5 h-5" />
          </Button>
        </div>
        <div className="p-1 flex-grow">{output}</div>
      </div>
    </div>
  )
}

export default forwardRef(Chat)
