import {
  AllHTMLAttributes,
  Context,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useRef
} from 'react'
import React, { useEffect, useState } from 'react'
import { AppContext, AppContextI, AppMode } from '../../App'
import { clsx } from 'clsx'
import { ReactComponent as PinIcon } from '@renderer/assets/img/pin.svg'
import Button from './components/Button'
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
import api from '@renderer/api'
import { AxiosError } from 'axios'
import { ChatGPTModel } from '@renderer/api/translate'

interface MainPanelProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function MainPanel({ className }: MainPanelProps): JSX.Element {
  // context
  const { setAppMode, setInput, input, apiKey, setApiKey } = useContext(
    AppContext as Context<AppContextI>
  )

  // state

  const [model, setModel] = useState<ChatGPTModel>(ChatGPTModel.turbo_0301)

  const [inputLanguage, setInputLanguage] = useState<string>('en')

  const [outputLanguage, setOutputLanguage] = useState<string>('zh-Hans')

  const [output, setOutput] = useState<string>('')

  // ref
  const mainPanelRef = useRef<HTMLDivElement>(null)

  const inputTextRef = useRef<HTMLTextAreaElement>(null)

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setInput(e.currentTarget.value)
  }

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    // window.electron.ipcRenderer.invoke('suspension')
    // setAppMode(AppMode.suspension)
  }

  const handleSend: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    try {
      const text = await translate(input)
      setOutput(text)
    } catch (err) {
      console.error(err)
    }
  }

  // callback
  const translate = useCallback(
    async (text: string): Promise<string> => {
      return api
        .sendTranslateRequest(text, model, inputLanguage, outputLanguage, apiKey)
        .then((res) => res.data.choices[0].message.content)
        .catch((err) => {
          if (err.response) {
            console.error('status: ', err.response.status)
            console.error('data: ', err.response.data)
          } else if (err.request) {
            console.log('message: ', err.mess)
          } else {
            console.log('error: ', err)
          }
          return ''
        })
    },
    [model, inputLanguage, outputLanguage, apiKey]
  )

  // effect
  useEffect(() => {
    // auto focus
    if (mainPanelRef.current) {
      mainPanelRef.current.focus()
    }
  }, [])

  return (
    <div
      id="container"
      ref={mainPanelRef}
      className={clsx(
        'flex bg-gray-100 flex-col items-center justify-center overflow-hidden',
        'transition-all ease-in-out duration-300 delay-75 rounded-2xl',
        'border shadow-lg',
        'absolute inset-0'
      )}
      tabIndex={0}
      onBlur={handleBlur}
    >
      <div className="w-full h-full relative flex flex-col text-gray-900">
        <div id="panel-header" className="drag-area relative w-full h-12 bg-gray-100 shrink-0">
          <div className="absolute inset-0 z-0 px-4 pt-4 flex items-center justify-between">
            <Button className="text-gray-600">
              <PinIcon />
            </Button>
          </div>
        </div>
        <div id="panel-body" className="p-4 flex flex-col gap-2 flex-grow">
          <div className="flex flex-col w-full rounded-2xl bg-white focus-within:ring-1 focus-within:ring-gray-200 focus-within:shadow">
            <textarea
              style={{ resize: 'none' }}
              id="inputText"
              ref={inputTextRef}
              className="w-full h-24 p-3 rounded-t-2xl focus:outline-none"
              placeholder="请输入要翻译的语段"
              value={input}
              onChange={handleChange}
            />
            <div className="h-12 rounded-b-2xl p-2 flex text-sm items-center justify-between">
              <div className="p-1 px-3 bg-gray-200 flex gap-2 rounded-full items-center">
                <div>识别为</div>
                <div className="text-blue-500">英语</div>
              </div>
              <Button className="border-white" onClick={handleSend}>
                <SendIcon />
              </Button>
            </div>
          </div>
          <div className="w-full rounded-2xl bg-white p-3 flex justify-evenly">
            <div className="flex items-center gap-1">
              自动检测
              <div className="w-4 h-4">
                <ArrowIcon />
              </div>
            </div>
            <div className="w-6 h-6 text-gray-600">
              <SwitchIcon />
            </div>
            <div className="flex items-center gap-1">
              自动选择
              <div className="w-4 h-4">
                <ArrowIcon />
              </div>
            </div>
          </div>
          <div className="w-full rounded-2xl bg-white p-2 flex flex-col flex-grow">
            <div className="rounded-b-2xl flex gap-2 text-gray-00">
              <Button className="border-white">
                <SpeakIcon className="border-white w-5 h-5" />
              </Button>
              <Button className="border-white">
                <CopyIcon className="border-white w-5 h-5" />
              </Button>
            </div>
            <div className="p-1">{output}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
