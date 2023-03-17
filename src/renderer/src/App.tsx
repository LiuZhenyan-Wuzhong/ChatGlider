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
  appMode: AppMode
  setAppMode: Dispatch<SetStateAction<AppMode>>
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

  const [appMode, setAppMode] = useState<AppMode>(AppMode.suspension)

  const [apiKey, setApiKey] = useState<string>(
    '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'
  )

  return (
    <AppContext.Provider
      value={{
        appMode,
        setAppMode,
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
