import {
  AllHTMLAttributes,
  Context,
  forwardRef,
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
import Button from '../../../commonComps/Button'
import { AppContext, AppContextI } from '@renderer/App'
import { AxiosError } from 'axios'
import { MainPanelContext, MainPanelContextI } from '../..'
import CodeExplainAPI from '@renderer/api/openai/codeExplainAPI'
import { ChatGPTModel } from '@renderer/api/openai/openaiAPI'
import BinaryButton from '@renderer/components/commonComps/BinaryButton'
import CodeMirror from '@uiw/react-codemirror'
import { javascript as cm_javascript } from '@codemirror/lang-javascript'
import { css as cm_css } from '@codemirror/lang-css'
import { html as cm_html } from '@codemirror/lang-html'
import { java as cm_java } from '@codemirror/lang-java'
import { json as cm_json } from '@codemirror/lang-json'
import { lezer as cm_lezer } from '@codemirror/lang-lezer'
import { markdown as cm_markdown } from '@codemirror/lang-markdown'
import { php as cm_php } from '@codemirror/lang-php'
import { python as cm_python } from '@codemirror/lang-python'
import { rust as cm_rust } from '@codemirror/lang-rust'
import { sql as cm_sql } from '@codemirror/lang-sql'
import { xml as cm_xml } from '@codemirror/lang-xml'
import { wast as cm_wast } from '@codemirror/lang-wast'

import { githubLight, githubLightInit } from '@uiw/codemirror-theme-github'
import { EditorView } from '@codemirror/view'
import CodeLangSelect from '@renderer/components/commonComps/Select'
import { LanguageSupport } from '@codemirror/language'
import ReadButton from '@renderer/components/commonComps/ReadButton'
// import transcribe from '@renderer/api/alicloud'

enum CodeLang {
  js = 'CodeLang/javascript',
  css = 'CodeLang/css',
  html = 'CodeLang/html',
  java = 'CodeLang/java',
  json = 'CodeLang/json',
  lezer = 'CodeLang/lezer',
  markdown = 'CodeLang/markdown',
  php = 'CodeLang/php',
  python = 'CodeLang/python',
  rust = 'CodeLang/rust',
  sql = 'CodeLang/sql',
  xml = 'CodeLang/xml',
  wast = 'CodeLang/wast'
}

export interface CodeLangDesc {
  name: string
  value: CodeLang
}

type CodeLangExtensionMap = {
  [K in CodeLang]: (config?) => LanguageSupport
}

const codeLangExtensionMap: CodeLangExtensionMap = {
  [CodeLang.js]: cm_javascript,
  [CodeLang.css]: cm_css,
  [CodeLang.html]: cm_html,
  [CodeLang.java]: cm_java,
  [CodeLang.json]: cm_json,
  [CodeLang.lezer]: cm_lezer,
  [CodeLang.markdown]: cm_markdown,
  [CodeLang.php]: cm_php,
  [CodeLang.python]: cm_python,
  [CodeLang.rust]: cm_rust,
  [CodeLang.sql]: cm_sql,
  [CodeLang.xml]: cm_xml,
  [CodeLang.wast]: cm_wast
}

const codeLangMap = { ...CodeLang }

const codeLangDescMap: { [key in CodeLang]?: CodeLangDesc } = {}

Object.entries(codeLangMap).map(([key, val], idx) => {
  codeLangDescMap[val] = { name: key, value: val }
})

const styleTheme = EditorView.baseTheme({
  '&.cm-editor.cm-focused': {
    outline: '0px'
  }
})

interface CodeExplainProps extends AllHTMLAttributes<HTMLDivElement> {}

function CodeExplain({ className }: CodeExplainProps, ref): JSX.Element {
  // context
  const { openAIAPIRef } = useContext(AppContext as Context<AppContextI>)

  const { inputFromClipBoard, stream } = useContext(MainPanelContext as Context<MainPanelContextI>)

  // state
  const [input, setInput] = useState<string>(`function hello(who = "world") {
  console.log(\`Hello, \${who}!\`)
}

`)

  const [model, setModel] = useState<ChatGPTModel>(ChatGPTModel.turbo_0301)

  const [output, setOutput] = useState<string>('')

  const [autoCodeExplain, setAutoCodeExplain] = useState<boolean>(false)

  const [inputCodeLang, setInputCodeLang] = useState<CodeLang>(CodeLang.js)

  const [isAborting, setIsAborting] = useState<boolean>(false)

  const [isSending, setIsSending] = useState<boolean>(false)

  // ref
  const inputTextRef = useRef<HTMLTextAreaElement>(null)

  const codeExplainAPIRef = useRef(new CodeExplainAPI(openAIAPIRef.current))

  // callback
  const handleCodeExplain = useCallback(async () => {
    setIsSending(true)

    console.log('codeExplain: ')

    // console.log('codeExplain: ', input)

    try {
      const text = await codeExplain(input)

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
      setIsSending(false)
    }
  }, [input])

  const handleSend: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      handleCodeExplain()
    },
    [handleCodeExplain]
  )

  const codeExplain = useCallback(
    async (text: string): Promise<string> => {
      return codeExplainAPIRef.current.sendCodeExplainRequest(text, model).then((res) => {
        if (res instanceof Response) {
          console.log(res)
        } else {
          console.log(res)
          return res.data.choices[0].message.content
        }
      })
    },
    [model, codeExplainAPIRef]
  )

  const handleChange = useCallback(
    (value: string, ...args) => {
      setInput(value)

      console.log(input)
    },
    [input]
  )

  const handleCopy: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      window.electron.ipcRenderer.invoke('copy', output)
    },
    [output]
  )

  const handleRead: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      console.log('read')

      // transcribe(output, _onReceiveBuffer)
    },
    [output]
  )

  const _onReceiveBuffer = useCallback((msg: Buffer): void => {
    console.log(msg)
  }, [])

  const handleAbort = useCallback(async () => {
    setIsAborting(false)
    try {
      console.log('abort')

      codeExplainAPIRef.current.abort()
    } catch (err) {
      console.error(err)
    } finally {
      setIsAborting(true)
    }
  }, [codeExplainAPIRef])

  const handleClickActive: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      await handleAbort()
      setIsSending(false)
    },
    [handleAbort, setIsSending]
  )

  const handleClickMute: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (e) => {
      setIsSending(true)
      console.log('active')

      handleCodeExplain()
    },
    [handleCodeExplain, setIsSending]
  )

  // effect
  useEffect(() => {
    if (autoCodeExplain || inputFromClipBoard.current) {
      handleCodeExplain()

      inputFromClipBoard.current = false
    }
  }, [input, autoCodeExplain])

  return (
    <div id="panel-body" className="relative flex-grow w-full rounded-xl">
      <div className="absolute inset-0 p-4 flex flex-col gap-2">
        <div className="flex flex-col h-1/2">
          <div className="w-full rounded-xl flex flex-col p-3 h-full bg-white overflow-auto">
            <CodeMirror
              className="overflow-y-scroll overflow-x-hidden scroll-mr-2 min-h-min h-full"
              value={input}
              onChange={handleChange}
              placeholder="请输入要解释的代码片段"
              indentWithTab
              theme={githubLightInit({
                settings: { caret: '#c6c6c6', fontFamily: 'monospace' }
              })}
              extensions={[
                styleTheme,
                codeLangExtensionMap[inputCodeLang]({ jsx: true }),
                EditorView.lineWrapping
              ]}
            />
            <div className="h-8 rounded-b-xl flex text-sm items-center bg-white justify-between">
              <div className="flex">
                {/* <div className="p-1 px-3 bg-gray-200 flex gap-2 rounded-full items-center">
              <Detect languageMap={languageMap} />
            </div> */}
                <CodeLangSelect
                  // open
                  value={inputCodeLang}
                  onValueChange={(val: CodeLang): void => setInputCodeLang(val)}
                  descMap={codeLangDescMap}
                />
              </div>
              {stream ? (
                <BinaryButton
                  className="border-white"
                  disabled={!isAborting}
                  active={isSending}
                  onMuteClick={handleClickMute}
                  onActiveClick={handleClickActive}
                />
              ) : (
                <Button disabled={isSending}>
                  <SendIcon />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full rounded-xl bg-white p-2 flex flex-col flex-grow h-1/2">
          <div className="rounded-b-2xl flex justify-end gap-2 text-gray-800">
            <ReadButton text={output} />
            <Button className="border-white" onClick={handleCopy}>
              <CopyIcon className="border-white w-5 h-5" />
            </Button>
          </div>
          <div className="p-1 flex-grow">{output}</div>
        </div>
      </div>
    </div>
  )
}

export default forwardRef(CodeExplain)
