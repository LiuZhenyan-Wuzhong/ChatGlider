/* eslint-disable prettier/prettier */

import { clsx } from 'clsx'
import { AllHTMLAttributes } from 'react'

interface PrimayButtonProps extends AllHTMLAttributes<HTMLButtonElement> {}

export default function PrimayButton({
  className,
  onClick,
  children,
  disabled,
  type
}: PrimayButtonProps): JSX.Element {
  return (
    <button
      type={type === 'submit' ? type : 'button'}
      id="ping"
      className={clsx(
        'z-30 rounded-lg p-1 flex items-center justify-center border text-white bg-blue-500',
        'transition-all ease-in-out duration-200',
        disabled ? 'bg-blue-300' : 'hover:border hover:bg-blue-600 hover:shadow active:bg-blue-700',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
