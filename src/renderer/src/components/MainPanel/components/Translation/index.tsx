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
import { ReactComponent as SpeakIcon } from '@renderer/assets/img/speak.svg'
import { ReactComponent as CopyIcon } from '@renderer/assets/img/copy.svg'
import { ReactComponent as SendIcon } from '@renderer/assets/img/send.svg'
import Button from '../../../commonComps/Button'
import { AppContext, AppContextI } from '@renderer/App'
import { AxiosError } from 'axios'
import { MainPanelContext, MainPanelContextI } from '../..'
import LanguageSelect from '../../../commonComps/Select'
import TranslateAPI from '@renderer/api/openai/translateAPI'
import BinaryButton from '@renderer/components/commonComps/BinaryButton'
import { ChatGPTModel } from '@renderer/api/openai/openaiAPI'
// import transcribe from '@renderer/api/alicloud'

export enum Language {
  en = 'en',
  zh_Hans = 'zh-Hans',
  zh_Hant = 'zh-Hant'
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
  },
  [Language.zh_Hant]: {
    name: '汉语(繁)',
    value: Language.zh_Hant
  }
}

interface TranslationProps extends AllHTMLAttributes<HTMLDivElement> {}

function Translation({ className }: TranslationProps, ref): JSX.Element {
  // context
  const { apiKey, openAIAPIRef } = useContext(AppContext as Context<AppContextI>)

  const { inputFromClipBoard, stream } = useContext(MainPanelContext as Context<MainPanelContextI>)

  // state
  const [input, setInput] = useState<string>('')

  const [model, setModel] = useState<ChatGPTModel>(ChatGPTModel.turbo_0301)

  const [inputLanguage, setInputLanguage] = useState<Language>(Language.en)

  const [outputLanguage, setOutputLanguage] = useState<Language>(Language.zh_Hans)

  const [output, setOutput] = useState<string>('')

  const [autoTranslate, setAutoTranslate] = useState<boolean>(false)

  const [isAborting, setIsAborting] = useState<boolean>(false)

  const [isSending, setIsSending] = useState<boolean>(false)

  // ref
  const inputTextRef = useRef<HTMLTextAreaElement>(null)

  const translateAPIRef = useRef(new TranslateAPI(openAIAPIRef.current))

  const abortRef = useRef(false)

  // callback
  const onMessage = (data: string): void => {
    if (data === '[DONE]') {
      return
    }
    try {
      let _a2
      const response = JSON.parse(data)
      if ((_a2 = response == null ? void 0 : response.choices) == null ? void 0 : _a2.length) {
        const delta = response.choices[0].delta // chunk
        if (delta.content) {
          setOutput((prev) => prev + delta.content)
        }
      }
    } catch (err) {
      handleError(err)
    }
  }

  const handleTranslate = useCallback(async () => {
    setOutput('')
    setIsSending(true)

    console.log('translate words: ', input)

    try {
      if (stream) {
        await translate(input, true, onMessage)
      } else {
        const text = await translate(input)
        if (!abortRef.current) {
          setOutput(text)
        }
      }
    } catch (err: unknown) {
      handleError(err)
    } finally {
      abortRef.current = false

      setIsSending(false)
    }
  }, [input, setInput])

  const handleError = useCallback((err: unknown) => {
    if (err instanceof AxiosError && err.response) {
      console.error('status: ', err.response.status)
      console.error('data: ', err.message)
      setOutput(err.message)
    } else {
      console.error('error: ', err)

      setOutput('error')
    }
  }, [])

  const handleSwitch = useCallback(() => {
    const swap = inputLanguage
    setInputLanguage(outputLanguage)
    setOutputLanguage(swap)
  }, [inputLanguage, outputLanguage])

  const translate = useCallback(
    async (text: string, stream?: boolean, onMessage?: (text: string) => void): Promise<string> => {
      return translateAPIRef.current
        .sendTranslateRequest(text, model, inputLanguage, outputLanguage, stream, onMessage)
        .then((res) => {
          if (res instanceof Response) {
            console.log(res) // fetch stream response
          } else {
            console.log(res) // axios common response
            return res.data.choices[0].message.content
          }
        })
    },
    [model, inputLanguage, outputLanguage, translateAPIRef]
  )

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback((e) => {
    setInput(e.currentTarget.value)
  }, [])

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
    setIsAborting(true)

    abortRef.current = true

    translateAPIRef.current.abort()
    try {
      console.log('abort')
    } catch (err) {
      console.error(err)
    } finally {
      setIsAborting(false)
    }
  }, [])

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

      handleTranslate()
    },
    [handleTranslate, setIsSending]
  )

  // effect
  useEffect(() => {
    if (autoTranslate || inputFromClipBoard.current) {
      if (input.length > 0) {
        handleTranslate()
      }
    }
    inputFromClipBoard.current = false
  }, [autoTranslate, inputFromClipBoard])

  return (
    <div id="panel-body" className="relative p-4 flex flex-col flex-grow w-full rounded-xl gap-2">
      <div className="flex flex-col z-30">
        <textarea
          id="inputText"
          ref={inputTextRef}
          className="w-full h-24 p-3 rounded-t-xl focus:outline-none"
          placeholder="请输入要翻译的语段"
          value={input}
          onChange={handleChange}
        />
        <div className="h-12 rounded-b-2xl p-2 flex text-sm items-center bg-white justify-between">
          <div className="rounded-b-xl bg-white p-1 flex justify-evenly items-center gap-2">
            <LanguageSelect
              value={inputLanguage}
              onValueChange={(val: Language): void => setInputLanguage(val)}
              descMap={languageMap}
            />
            <Button className="border-white" onClick={handleSwitch}>
              <SwitchIcon className="border-white w-5 h-5" />
            </Button>
            <LanguageSelect
              // open
              value={outputLanguage}
              onValueChange={(val: Language): void => setOutputLanguage(val)}
              descMap={languageMap}
            />
          </div>
          <div className="flex">
            {/* <div className="p-1 px-3 bg-gray-200 flex gap-2 rounded-full items-center">
              <Detect languageMap={languageMap} input={input}/>
            </div> */}
          </div>
          {stream ? (
            <BinaryButton
              className="border-white"
              disabled={isAborting}
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

      <div className="w-full rounded-xl bg-white p-2 flex flex-col flex-grow z-30">
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

export default forwardRef(Translation)
