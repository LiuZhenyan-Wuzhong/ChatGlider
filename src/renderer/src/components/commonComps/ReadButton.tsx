import { AllHTMLAttributes, useCallback } from 'react'
import Button from './Button'
import { ReactComponent as SpeakIcon } from '@renderer/assets/img/speak.svg'
import clsx from 'clsx'
import transcribe from '@renderer/api/alicloud'

interface ReadButtonProps extends AllHTMLAttributes<HTMLDivElement> {
  text: string
}

export default function ReadButton({ className, text }: ReadButtonProps): JSX.Element {
  const handleRead: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      console.log('read')

      transcribe(text, handleReceiveBuffer) // 阿里云API在esm规范下还有问题？
    },
    [text]
  )

  const handleReceiveBuffer = useCallback((msg: Buffer) => {
    // TODO
  }, [])

  return (
    <Button className={clsx('border-white', className)} onClick={handleRead}>
      <SpeakIcon className="border-white w-5 h-5" />
    </Button>
  )
}
