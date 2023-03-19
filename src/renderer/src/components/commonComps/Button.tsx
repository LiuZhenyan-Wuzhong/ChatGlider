/* eslint-disable prettier/prettier */

import { clsx } from 'clsx'
import { AllHTMLAttributes } from 'react'

interface ButtonProps extends AllHTMLAttributes<HTMLButtonElement> {}

export default function Button({
  className,
  onClick,
  children,
  disabled,
  type
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type === 'submit' ? type : 'button'}
      id="ping"
      className={clsx(
        'w-8 h-8 z-30 rounded-lg p-1 flex items-center justify-center border border-gray-100',
        'transition-all ease-in-out duration-200',
        disabled
          ? 'text-gray-300'
          : 'text-gray-600 hover:border hover:border-gray-300 hover:bg-gray-200 hover:shadow active:bg-gray-300',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
