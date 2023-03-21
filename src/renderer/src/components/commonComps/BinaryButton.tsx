/* eslint-disable prettier/prettier */

import { clsx } from 'clsx'
import { AllHTMLAttributes, useState } from 'react'
import { ReactComponent as SendIcon } from '@renderer/assets/img/send.svg'
import { ReactComponent as StopIcon } from '@renderer/assets/img/stop.svg'

interface BinaryButtonProps extends AllHTMLAttributes<HTMLButtonElement> {
  active: boolean
  onMuteClick: React.MouseEventHandler<HTMLButtonElement>
  onActiveClick: React.MouseEventHandler<HTMLButtonElement>
}

export default function BinaryButton({
  className,
  active,
  onMuteClick,
  onActiveClick,
  disabled,
  type
}: BinaryButtonProps): JSX.Element {
  return (
    <button
      type={type === 'submit' ? type : 'button'}
      id="ping"
      disabled={disabled}
      className={clsx(
        'w-8 h-8 z-30 rounded-lg p-1 flex items-center justify-center border border-gray-100',
        'transition-all ease-in-out duration-200',
        disabled
          ? 'text-gray-300'
          : 'text-gray-600 hover:border hover:border-gray-300 hover:bg-gray-200 hover:shadow active:bg-gray-300',
        className
      )}
      onClick={(e): void => {
        if (active) {
          onActiveClick(e)
        } else {
          onMuteClick(e)
        }
      }}
    >
      {active ? <StopIcon /> : <SendIcon />}
    </button>
  )
}
