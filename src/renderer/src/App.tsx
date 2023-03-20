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
  expand = 'AppMode/expand'
}

interface AppProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function App({ className }: AppProps): JSX.Element {
  // state
  const [appMode, setAppMode] = useState<AppMode>(AppMode.suspension)

  const [apiKey, setApiKey] = useState<string>(
    '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'
  )

  const [OpenAI_URL, setOpenAI_URL] = useState<string>(
    'https://service-8w4ctcv6-1317242412.hk.apigw.tencentcs.com/openai'
  )

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
