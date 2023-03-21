import { sendDetectReq } from '@renderer/api/google/detect'
import { AllHTMLAttributes, Context, useCallback, useContext, useEffect, useState } from 'react'
import { MainPanelContext, MainPanelContextI } from '../../..'
import { Language, languageDesc } from '..'

const googleApiKey = ''
interface DetectProps extends AllHTMLAttributes<HTMLDivElement> {
  languageMap: { [key: string]: languageDesc }
  input: string
}

export default function Detect({ className, languageMap, input }: DetectProps): JSX.Element {
  // state
  const [detectLanguage, setDetectLanguage] = useState<Language | null>(null)

  const [isDetecting, setIsDetecting] = useState<boolean>(false)

  // callback
  const getLanguage = useCallback((data) => data, [])

  const handleDetect = useCallback(
    async (input: string) => {
      try {
        const res = await sendDetectReq(input, googleApiKey)

        const data = res.data

        setDetectLanguage(getLanguage(data))
      } catch (err) {
        console.error(err)

        setDetectLanguage(null)
      }
    },
    [googleApiKey]
  )

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
