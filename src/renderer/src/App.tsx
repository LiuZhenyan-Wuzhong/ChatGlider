/* eslint-disable prettier/prettier */
import {
  AllHTMLAttributes,
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from 'react'
import MainButton from './components/MainButton'
import MainPanel from './components/MainPanel'

export interface AppContextI {
  input: string
  setInput: Dispatch<SetStateAction<string>>
  appMode: AppMode
  setAppMode: Dispatch<SetStateAction<AppMode>>
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

  useEffect(() => {
    window.electron.ipcRenderer.on('sendCopiedText', (e, text) => {
      setInput(text)
    })
  }, [])

  return (
    <AppContext.Provider value={{ input, setInput, appMode, setAppMode }}>
      <div className="transition-all duration-300 ease-in-out">
        {appMode === AppMode.suspension ? <MainButton /> : <MainPanel />}
      </div>
    </AppContext.Provider>
  )
}
