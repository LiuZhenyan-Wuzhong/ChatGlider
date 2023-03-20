import {
  AllHTMLAttributes,
  Context,
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
import { ChatGPTModel } from '@renderer/api/translate'
import Button from '../../../commonComps/Button'
import { AppContext, AppContextI } from '@renderer/App'
import { AxiosError } from 'axios'
import { MainPanelContext, MainPanelContextI } from '../..'
import LanguageSelect from './components/LanguageSelect'
import TranslateAPI from '@renderer/api/openai/translateAPI'

export enum Language {
  en = 'en',
  zh_Hans = 'zh-Hans',
  zh_Hant = 'zh-Hant'
}

export interface languageDesc {
  name: string
  value: Language
}

export const initLanguageMap: { [key: string]: languageDesc } = {
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

// const translateAPI = new TranslateAPI()

interface TranslationProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function Translation({ className }: TranslationProps): JSX.Element {
  // context
  const { apiKey, openAIAPIRef } = useContext(AppContext as Context<AppContextI>)

  const { input, setInput, inputFromClipBoard } = useContext(
    MainPanelContext as Context<MainPanelContextI>
  )

  // state
  const [model, setModel] = useState<ChatGPTModel>(ChatGPTModel.turbo_0301)

  const [inputLanguage, setInputLanguage] = useState<Language>(Language.en)

  const [outputLanguage, setOutputLanguage] = useState<Language>(Language.zh_Hans)

  const [output, setOutput] = useState<string>('')

  const [autoTranslate, setAutoTranslate] = useState<boolean>(false)

  const [sendButtonEnabled, setSendButtonEnabled] = useState<boolean>(true)

  const [languageMap, setLanguageMap] = useState<{ [key: string]: languageDesc }>(initLanguageMap)

  // ref
  const inputTextRef = useRef<HTMLTextAreaElement>(null)

  // const testRef = useRef<HTMLDivElement>(null)

  const translateAPIRef = useRef(new TranslateAPI(openAIAPIRef.current))

  // callback
  const handleTranslate = useCallback(async () => {
    setSendButtonEnabled(false)

    console.log('translate words: ', input)

    try {
      const text = await translate(input)
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
      setSendButtonEnabled(true)
    }
  }, [input])

  const handleSend: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      handleTranslate()
    },
    [handleTranslate]
  )

  const handleSwitch = useCallback(() => {
    const swap = inputLanguage
    setInputLanguage(outputLanguage)
    setOutputLanguage(swap)
  }, [inputLanguage, outputLanguage])

  const translate = useCallback(
    async (text: string): Promise<string> => {
      return translateAPIRef.current
        .sendTranslateRequest(text, model, inputLanguage, outputLanguage)
        .then((res) => {
          console.log(res)
          return res.data.choices[0].message.content
        })
    },
    [model, inputLanguage, outputLanguage, translateAPIRef]
  )

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback((e) => {
    setInput(e.currentTarget.value)
  }, [])

  const handleResize: React.ReactEventHandler<HTMLDivElement> = useCallback((e) => {
    console.log(111)
  }, [])

  // effect
  useEffect(() => {
    if (autoTranslate || inputFromClipBoard.current) {
      handleTranslate()

      inputFromClipBoard.current = false
    }
  }, [input, autoTranslate])

  return (
    <div id="panel-body" className="p-4 flex flex-col flex-grow w-full rounded-xl gap-2">
      <div className="flex flex-col">
        <textarea
          id="inputText"
          ref={inputTextRef}
          className="w-full h-24 p-3 rounded-t-xl focus:outline-none"
          placeholder="请输入要翻译的语段"
          value={input}
          onChange={handleChange}
        />
        <div className="h-12 rounded-b-2xl p-2 flex text-sm items-center bg-white justify-between">
          <div className="flex">
            {/* <div className="p-1 px-3 bg-gray-200 flex gap-2 rounded-full items-center">
              <Detect languageMap={languageMap} />
            </div> */}
          </div>
          <Button className="border-white" onClick={handleSend} disabled={!sendButtonEnabled}>
            <SendIcon />
          </Button>
        </div>
      </div>

      <div className="w-full rounded-xl bg-white p-2 flex justify-evenly items-center">
        <LanguageSelect
          value={inputLanguage}
          onValueChange={(val: Language): void => setInputLanguage(val)}
          languageMap={languageMap}
        />
        <Button className="border-white" onClick={handleSwitch}>
          <SwitchIcon className="border-white w-5 h-5" />
        </Button>
        <LanguageSelect
          // open={true}
          value={outputLanguage}
          onValueChange={(val: Language): void => setOutputLanguage(val)}
          languageMap={languageMap}
        />
      </div>

      <div className="w-full rounded-xl bg-white p-2 flex flex-col flex-grow">
        <div className="rounded-b-2xl flex justify-end gap-2 text-gray-800">
          <Button className="border-white">
            <SpeakIcon className="border-white w-5 h-5" />
          </Button>
          <Button className="border-white">
            <CopyIcon className="border-white w-5 h-5" />
          </Button>
        </div>
        <div className="p-1 flex-grow">{output}</div>
      </div>
    </div>
  )
}
