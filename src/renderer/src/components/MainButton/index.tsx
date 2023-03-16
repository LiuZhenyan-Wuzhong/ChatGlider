import React, { Context, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'
import { AllHTMLAttributes } from 'react'
import clsx from 'clsx'
import { AppContext, AppContextI, AppMode } from '../../App'
import { ReactComponent as OpenAIIcon } from '@renderer/assets/img/openai.svg'

interface MainButtonProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function MainButton({ className }: MainButtonProps): JSX.Element {
  // context
  const { setAppMode } = useContext(AppContext as Context<AppContextI>)

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    window.electron.ipcRenderer.invoke('expand')
    setAppMode(AppMode.expand)
  }

  return (
    <button
      id="MainButton"
      className={clsx(
        'w-8 h-8 flex flex-col bg-gray-100 items-center justify-center overflow-hidden',
        'transition-all ease-in-out duration-300 delay-75 rounded-full',
        'focus:outline-none',
        'hover:bg-gray-300 hover:shadow-md',
        'transition-color duration-300 ease-in-out'
      )}
      onClick={handleClick}
    >
      <OpenAIIcon />
    </button>
  )
}
