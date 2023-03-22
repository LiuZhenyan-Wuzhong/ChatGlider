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
import LanguageSelect from '../../../commonComps/Select'
import PolishAPI from '@renderer/api/openai/polishAPI'
import { ChatGPTModel } from '@renderer/api/openai/openaiAPI'
import BinaryButton from '@renderer/components/commonComps/BinaryButton'
import ReadButton from '@renderer/components/commonComps/ReadButton'
import Tooltip from '@renderer/components/commonComps/Tooltip'

export enum Language {
  en = 'en',
  zh_Hans = 'zh-Hans'
}

export interface LanguageDesc {
  name: string
  value: Language
}

export const languageMap: { [key: string]: LanguageDesc } = {
  [Language.en]: {
    name: '英语',
    value: Language.en
  },
  [Language.zh_Hans]: {
    name: '汉语(简)',
    value: Language.zh_Hans
  }
}

interface PolishProps extends AllHTMLAttributes<HTMLDivElement> {}

function Polish({ className }: PolishProps, ref): JSX.Element {
  // context
  const { openAIAPIRef } = useContext(AppContext as Context<AppContextI>)

  const { inputFromClipBoard, stream, mainInput } = useContext(
    MainPanelContext as Context<MainPanelContextI>
  )

  // state
  const [input, setInput] = useState<string>('')

  const [model, setModel] = useState<ChatGPTModel>(ChatGPTModel.turbo_0301)

  const [output, setOutput] = useState<string>('')

  const [isAborting, setIsAborting] = useState<boolean>(false)

  const [isSending, setIsSending] = useState<boolean>(false)

  const [language, setLanguage] = useState<Language>(Language.en)

  // ref
  const inputTextRef = useRef<HTMLTextAreaElement>(null)

  const polishAPIRef = useRef(new PolishAPI(openAIAPIRef.current))

  // callback
  const handlePolish = useCallback(async () => {
    setIsSending(true)

    console.log('polish: ', input)

    try {
      const text = await polish(input)

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

        setOutput((err as Error).message)
      }
    } finally {
      setIsSending(false)
    }
  }, [input])

  const handleSend: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      handlePolish()
    },
    [handlePolish]
  )

  const polish = useCallback(
    async (text: string): Promise<string> => {
      return polishAPIRef.current.sendPolishRequest(text, model).then((res) => {
        if (res instanceof Response) {
          console.log(res)
        } else {
          console.log(res)
          return res.data.choices[0].message.content
        }
      })
    },
    [model, polishAPIRef]
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

  const _onReceiveBuffer = useCallback((msg: Buffer): void => {
    console.log(msg)
  }, [])

  const handleAbort = useCallback(async () => {
    setIsAborting(false)
    try {
      console.log('abort')

      polishAPIRef.current.abort()
    } catch (err) {
      console.error(err)
    } finally {
      setIsAborting(true)
    }
  }, [polishAPIRef])

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

      handlePolish()
    },
    [handlePolish, setIsSending]
  )

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (e) => {
      if (e.code === 'Enter') {
        setIsSending(true)
        console.log('active')

        handlePolish()
      }
    },
    [handlePolish, setIsSending]
  )

  // effect
  useEffect(() => {
    if (inputFromClipBoard.current) {
      inputFromClipBoard.current = false
      handlePolish()
    }
  }, [input])

  useEffect(() => {
    if (inputFromClipBoard.current && mainInput.length > 0) {
      setInput(mainInput)
    }
  }, [mainInput, inputFromClipBoard])

  return (
    <div id="panel-body" className="relative flex-grow w-full rounded-xl">
      <div className="absolute inset-0 p-4 flex flex-col gap-2">
        <div className="flex flex-col z-10 p-3 h-1/2 flex-grow rounded-xl bg-white">
          <textarea
            id="inputText"
            ref={inputTextRef}
            className="w-full h-min-24 focus:outline-none flex-grow verflow-y-scroll overflow-x-hidden scroll-mr-2"
            placeholder="请输入要润色的语段"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            style={{ resize: 'none' }}
          />

          <div className="h-8 rounded-b-xl flex text-sm items-center bg-white justify-between">
            <div className="flex">
              {/* <div className="p-1 px-3 bg-gray-200 flex gap-2 rounded-full items-center">
              <Detect languageMap={languageMap} />
            </div> */}
            </div>
            {stream ? (
              <Tooltip content={isSending ? '暂停' : '发送'}>
                <BinaryButton
                  className="border-white"
                  disabled={isAborting || input.length === 0}
                  active={isSending}
                  onMuteClick={handleClickMute}
                  onActiveClick={handleClickActive}
                />
              </Tooltip>
            ) : (
              <Tooltip content={isSending ? '正在发送中' : '发送'}>
                <Button disabled={isSending || input.length === 0} onClick={handleClickMute}>
                  <SendIcon />
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="w-full rounded-xl bg-white p-2 flex flex-col h-1/2 flex-grow z-10">
          <div className="rounded-b-2xl flex justify-end gap-2 text-gray-800">
            {/* <ReadButton text={output} /> */}
            <Button className="border-white" onClick={handleCopy}>
              <CopyIcon className="border-white w-5 h-5" />
            </Button>
          </div>
          <div className="p-1 flex-grow overflow-y-scroll">
            <div className="h-full">{output}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default forwardRef(Polish)
