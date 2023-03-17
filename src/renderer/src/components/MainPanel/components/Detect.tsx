import { sendDetectReq } from '@renderer/api/detect'
import { AxiosError } from 'axios'
import { AllHTMLAttributes, Context, useCallback, useContext, useEffect, useState } from 'react'
import { MainPanelContext, MainPanelContextI } from '..'
import { Language, languageDesc } from './Translation'

interface DetectProps extends AllHTMLAttributes<HTMLDivElement> {
  languageMap: { [key: string]: languageDesc }
}

export default function Detect({ className, languageMap }: DetectProps): JSX.Element {
  // context
  const { input, setInput } = useContext(MainPanelContext as Context<MainPanelContextI>)

  // state
  const [detectLanguage, setDetectLanguage] = useState<Language | null>(null)

  const [isDetecting, setIsDetecting] = useState<boolean>(false)

  // callback
  const getLanguage = useCallback((data) => data, [])

  const handleDetect = useCallback(async (input: string) => {
    try {
      const res = await sendDetectReq(input)

      const data = res.data

      setDetectLanguage(getLanguage(data))
    } catch (err) {
      console.error(err)

      setDetectLanguage(null)
    }
  }, [])

  useEffect(() => {
    handleDetect(input)
  }, [input])

  return isDetecting ? (
    <div>正在识别语种</div>
  ) : detectLanguage ? (
    <>
      <div>识别为</div>
      <div className="text-blue-500">{languageMap[detectLanguage].name}</div>
    </>
  ) : (
    <div>未识别出语种</div>
  )
}
