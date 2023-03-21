import {
  AllHTMLAttributes,
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react'
import OpenAIAPI from './api/openai/openaiAPI'
import MainButton from './components/MainButton'
import MainPanel from './components/MainPanel'

const initOpenAIApiKey = import.meta.env['RENDERER_VITE_OPENAI_API_KEY']
  ? import.meta.env['RENDERER_VITE_OPENAI_API_KEY']
  : ''

const initOpenAIUrl = import.meta.env['RENDERER_VITE_OPENAI_API_PROXY']
  ? import.meta.env['RENDERER_VITE_OPENAI_API_PROXY']
  : 'https://api.openai.com'

export interface AppContextI {
  appMode: AppMode
  setAppMode: Dispatch<SetStateAction<AppMode>>
  apiKey: string
  setApiKey: Dispatch<SetStateAction<string>>
  OpenAI_URL: string
  setOpenAI_URL: Dispatch<SetStateAction<string>>
  openAIAPIRef: MutableRefObject<OpenAIAPI>
}

// context
export const AppContext = createContext<AppContextI | null>(null)

export enum AppMode {
  suspension = 'AppMode/suspension',
  expand = 'AppMode/expand',
  bigger = 'AppMode/bigger'
}

interface AppProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function App({ className }: AppProps): JSX.Element {
  // state
  const [appMode, setAppMode] = useState<AppMode>(AppMode.suspension)

  const [apiKey, setApiKey] = useState<string>(initOpenAIApiKey)

  const [OpenAI_URL, setOpenAI_URL] = useState<string>(initOpenAIUrl)

  // effect
  useEffect(() => {
    openAIAPIRef.current.apiKey = apiKey
  }, [apiKey])

  useEffect(() => {
    openAIAPIRef.current.openaiURL = OpenAI_URL
  }, [OpenAI_URL])

  // ref
  const openAIAPIRef = useRef(new OpenAIAPI())

  return (
    <AppContext.Provider
      value={{
        appMode,
        setAppMode,
        apiKey,
        setApiKey,
        OpenAI_URL,
        setOpenAI_URL,
        openAIAPIRef
      }}
    >
      <div className="transition-all duration-300 ease-in-out">
        {appMode === AppMode.suspension ? <MainButton /> : <MainPanel />}
      </div>
    </AppContext.Provider>
  )
}
