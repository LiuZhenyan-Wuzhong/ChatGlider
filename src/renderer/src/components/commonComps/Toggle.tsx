import { AllHTMLAttributes, Dispatch, SetStateAction } from 'react'
import * as UIToggle from '@radix-ui/react-toggle'
import { clsx } from 'clsx'

interface ToggleProps extends AllHTMLAttributes<HTMLDivElement> {
  pressed: boolean
  onPressedChange: (val: boolean) => void
}

export default function Toggle({ className, children, ...props }: ToggleProps): JSX.Element {
  const { pressed, onPressedChange } = props
  return (
    <UIToggle.Root
      className={clsx(
        'w-8 h-8 z-30 rounded-lg p-1 flex items-center justify-center border border-gray-100',
        'hover:border hover:border-gray-300 hover:bg-gray-200 hover:shadow active:bg-gray-300',
        'transition-all ease-in-out duration-200',
        pressed ? 'bg-gray-200' : '',
        className
      )}
      pressed={pressed}
      onPressedChange={onPressedChange}
    >
      {children}
    </UIToggle.Root>
  )
}
