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

const initOpenAIApiKey = import.meta.env['RENDERER_VITE_OPENAI_API_KEY'] || ''

const initOpenAIUrl = import.meta.env['RENDERER_VITE_OPENAI_API_PROXY'] || 'https://api.openai.com'

export interface AppContextI {
  appMode: AppMode
  setAppMode: Dispatch<SetStateAction<AppMode>>
  openAIAPIKey: string
  setOpenAIAPIKey: Dispatch<SetStateAction<string>>
  openAIURL: string
  setOpenAIURL: Dispatch<SetStateAction<string>>
  openAIAPIRef: MutableRefObject<OpenAIAPI>
  stream: boolean
  setStream: Dispatch<SetStateAction<boolean>>
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

  const [openAIAPIKey, setOpenAIAPIKey] = useState<string>(initOpenAIApiKey)

  const [openAIURL, setOpenAIURL] = useState<string>(initOpenAIUrl)

  const [stream, setStream] = useState(true)

  // callback

  // effect
  useEffect(() => {
    openAIAPIRef.current.openAIAPIKey = openAIAPIKey
  }, [openAIAPIKey])

  useEffect(() => {
    openAIAPIRef.current.openaiURL = openAIURL
  }, [openAIURL])

  // effect
  useEffect(() => {
    window.electron.ipcRenderer.on('loadUserData', (event, storage) => {
      const { openAIAPIKey: _openAIAPIKey, openAIURL: _openAIURL, stream: _stream } = storage

      setOpenAIAPIKey(_openAIAPIKey || '')
      setOpenAIURL(_openAIURL || 'https://api.openai.com')
      setStream(_stream === undefined ? true : _stream)
    })
  }, [])

  // ref
  const openAIAPIRef = useRef(new OpenAIAPI())

  return (
    <AppContext.Provider
      value={{
        appMode,
        setAppMode,
        openAIAPIKey,
        setOpenAIAPIKey,
        openAIURL,
        setOpenAIURL,
        openAIAPIRef,
        stream,
        setStream
      }}
    >
      <div className="transition-all duration-300 ease-in-out">
        {appMode === AppMode.suspension ? <MainButton /> : <MainPanel />}
      </div>
    </AppContext.Provider>
  )
}
