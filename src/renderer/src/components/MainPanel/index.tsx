import {
  AllHTMLAttributes,
  Context,
  createContext,
  Dispatch,
  FC,
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useRef
} from 'react'
import React, { useEffect, useState } from 'react'
import { AppContext, AppContextI, AppMode } from '../../App'
import { clsx } from 'clsx'
import { ReactComponent as PinIcon } from '@renderer/assets/img/pin.svg'
import Translation from './components/Translation'
import { ReactComponent as CrossIcon } from '@renderer/assets/img/cross.svg'
import { ReactComponent as OpenAIIcon } from '@renderer/assets/img/openai.svg'
import { ReactComponent as PolishIcon } from '@renderer/assets/img/polish.svg'
import { ReactComponent as ChatIcon } from '@renderer/assets/img/chat.svg'
import { ReactComponent as SummaryIcon } from '@renderer/assets/img/summary.svg'
import { ReactComponent as TerminalIcon } from '@renderer/assets/img/terminal_line.svg'
import { ReactComponent as TranslationIcon } from '@renderer/assets/img/translation.svg'
import * as Tabs from '@radix-ui/react-tabs'
import Toggle from '../commonComps/Toggle'
import Settings from './components/Settings'
import Button from '../commonComps/Button'
import OpenAIAPI from '@renderer/api/openai/openaiAPI'

export interface MainPanelContextI {
  input: string
  setInput: Dispatch<SetStateAction<string>>
  inputFromClipBoard: React.MutableRefObject<boolean>
}

export const MainPanelContext = createContext<MainPanelContextI | null>(null)

export enum AppUsage {
  translation = 'AppUsage/translation',
  chat = 'AppUsage/chat',
  polishing = 'AppUsage/polishing',
  summarization = 'AppUsage/summarization',
  codeExplain = 'AppUsage/codeExplain'
}

const appUsageDescList: {
  name: string
  value: AppUsage
  icon: ReactNode
}[] = [
  { name: '翻译', value: AppUsage.translation, icon: <TranslationIcon /> },
  { name: '对话', value: AppUsage.chat, icon: <ChatIcon /> },
  { name: '代码', value: AppUsage.codeExplain, icon: <TerminalIcon /> },
  { name: '润色', value: AppUsage.polishing, icon: <PolishIcon /> }
]

interface MainPanelProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function MainPanel({ className }: MainPanelProps): JSX.Element {
  // context
  const { setAppMode, apiKey, setApiKey } = useContext(AppContext as Context<AppContextI>)

  // state
  const [input, setInput] = useState<string>('')

  const [appUsage, setAppUsage] = useState<AppUsage>(AppUsage.translation)

  const [isPin, setIsPin] = useState<boolean>(false)

  // ref
  const mainPanelRef = useRef<HTMLDivElement>(null)

  const inputFromClipBoard = useRef<boolean>(false)

  // callback
  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    // console.log('blur')
    // if (isPin) return
    // window.electron.ipcRenderer.invoke('suspension')
    // setAppMode(AppMode.suspension)
  }

  const handlePressPin: (val: boolean) => void = (e) => {
    window.electron.ipcRenderer.invoke('pin', !isPin)
    setIsPin((prev) => !prev)
  }

  const handleTabChange = (val: string): void => {
    setAppUsage(val as AppUsage)
  }

  const handleClose: MouseEventHandler<HTMLButtonElement> = (e) => {
    window.electron.ipcRenderer.invoke('suspension')
    setAppMode(AppMode.suspension)
  }

  // effect
  useEffect(() => {
    // auto focus
    if (mainPanelRef.current) {
      mainPanelRef.current.focus()
    }
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('sendCopiedText', (e, text) => {
      inputFromClipBoard.current = true

      setInput(text)
    })
    window.electron.ipcRenderer.on('suspension', (e) => {
      setAppMode(AppMode.suspension)
    })
  }, [])

  return (
    <div
      id="container"
      ref={mainPanelRef}
      className={clsx(
        'flex bg-gray-100 flex-col items-center justify-center overflow-hidden',
        'transition-all ease-in-out duration-300 delay-75 rounded-2xl',
        'border absolute inset-0'
      )}
      tabIndex={0}
      onBlur={handleBlur}
    >
      <div className="w-full h-full relative flex flex-col text-gray-900 flex-grow">
        <Tabs.Root
          value={appUsage}
          onValueChange={handleTabChange}
          className="flex flex-col flex-grow"
        >
          <div id="panel-header" className="drag-area relative w-full h-12 bg-gray-100 shrink-0">
            <div className="absolute inset-0 z-0 px-4 pt-4 flex items-center justify-between">
              <div className="w-40 flex justify-start items-center">
                <Tabs.List className="flex gap-1 p-1 bg-white rounded-lg">
                  {appUsageDescList.map(({ name, value, icon }, idx) => (
                    <Tabs.Trigger
                      key={idx}
                      value={value}
                      className={clsx(
                        'w-8 h-6 py-1 px-2 flex items-center justify-center rounded-md',
                        'data-[state=active]:bg-gray-200',
                        'hover:bg-gray-300',
                        'transition ease-in-out duration-200'
                      )}
                    >
                      {icon}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
              </div>

              <div className="w-8 h-8 flex items-center justify-center">
                <OpenAIIcon />
              </div>

              <div className="flex w-40 items-center justify-end gap-2">
                <Settings />
                <Toggle
                  className={clsx('text-gray-600', isPin ? 'bg-gray-200 border-gray-300' : '')}
                  pressed={isPin}
                  onPressedChange={handlePressPin}
                >
                  <PinIcon />
                </Toggle>
                <Button onClick={handleClose}>
                  <CrossIcon />
                </Button>
              </div>
            </div>
          </div>

          <MainPanelContext.Provider value={{ input, setInput, inputFromClipBoard }}>
            <Tabs.Content value={AppUsage.translation} asChild>
              <Translation />
            </Tabs.Content>
            <Tabs.Content value={AppUsage.chat}> </Tabs.Content>
            <Tabs.Content value={AppUsage.codeExplain}> </Tabs.Content>
            <Tabs.Content value={AppUsage.polishing}> </Tabs.Content>
          </MainPanelContext.Provider>
        </Tabs.Root>
      </div>
    </div>
  )
}
