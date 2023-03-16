/* eslint-disable prettier/prettier */
import {
  AllHTMLAttributes,
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from 'react'
import { ChatGPTModel } from './api/translate'
import MainButton from './components/MainButton'
import MainPanel from './components/MainPanel'

export enum AppUsage {
  translation = 'AppUsage/translation'
}
export interface AppContextI {
  input: string
  setInput: Dispatch<SetStateAction<string>>
  appMode: AppMode
  setAppMode: Dispatch<SetStateAction<AppMode>>
  appUsage: AppUsage
  setAppUsage: Dispatch<SetStateAction<AppUsage>>
  apiKey: string
  setApiKey: Dispatch<SetStateAction<string>>
}

// context
export const AppContext = createContext<AppContextI | null>(null)

export enum AppMode {
  suspension = 'AppMode/suspension',
  expand = 'AppMode/expand'
}

interface AppProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function App({ className }: AppProps): JSX.Element {
  // state
  const [input, setInput] = useState<string>('')

  const [appMode, setAppMode] = useState<AppMode>(AppMode.suspension)

  const [appUsage, setAppUsage] = useState<AppUsage>(AppUsage.translation)

  const [apiKey, setApiKey] = useState<string>(
    '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'
  )

  useEffect(() => {
    window.electron.ipcRenderer.on('sendCopiedText', (e, text) => {
      setInput(text)
    })
  }, [])

  return (
    <AppContext.Provider
      value={{
        input,
        setInput,
        appMode,
        setAppMode,
        appUsage,
        setAppUsage,
        apiKey,
        setApiKey
      }}
    >
      <div className="transition-all duration-300 ease-in-out">
        {appMode === AppMode.suspension ? <MainButton /> : <MainPanel />}
      </div>
    </AppContext.Provider>
  )
}
