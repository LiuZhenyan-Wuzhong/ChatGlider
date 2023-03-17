import {
  AllHTMLAttributes,
  Context,
  createContext,
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
import Translation from './components/Translation'

export interface MainPanelContextI {
  input: string
  setInput: Dispatch<SetStateAction<string>>
  inputFromClipBoard: React.MutableRefObject<boolean>
}

export const MainPanelContext = createContext<MainPanelContextI | null>(null)

export enum AppUsage {
  translation = 'AppUsage/translation'
}

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

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
    // console.log('blur')
    // if (isPin) return
    // window.electron.ipcRenderer.invoke('suspension')
    // setAppMode(AppMode.suspension)
  }

  const handlePin: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    window.electron.ipcRenderer.invoke('pin', !isPin)
    setIsPin((prev) => !prev)
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
        'border shadow-lg',
        'absolute inset-0'
      )}
      tabIndex={0}
      onBlur={handleBlur}
    >
      <div className="w-full h-full relative flex flex-col text-gray-900">
        <div id="panel-header" className="drag-area relative w-full h-12 bg-gray-100 shrink-0">
          <div className="absolute inset-0 z-0 px-4 pt-4 flex items-center justify-between">
            <Button
              className={clsx('text-gray-600', isPin ? 'bg-gray-200 border-gray-300' : '')}
              onClick={handlePin}
            >
              <PinIcon />
            </Button>
          </div>
        </div>
        <MainPanelContext.Provider value={{ input, setInput, inputFromClipBoard }}>
          <Translation />
        </MainPanelContext.Provider>
      </div>
    </div>
  )
}
