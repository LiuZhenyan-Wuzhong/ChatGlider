import { AllHTMLAttributes, useRef, useState } from 'react'
import * as Select from '@radix-ui/react-select'
import { ReactComponent as ArrowIcon } from '@renderer/assets/img/arrow.svg'
import { ReactComponent as CheckIcon } from '@renderer/assets/img/check.svg'
import { clsx } from 'clsx'
import React from 'react'
import { Language, languageDesc } from './Translation'

// interface SelectItemProps extends AllHTMLAttributes<HTMLDivElement> {}

const SelectItem = ({
  children,
  className,
  ...props
}: Parameters<typeof Select.Item>[0]): JSX.Element => {
  return (
    <Select.Item
      className={clsx(
        'w-28 p-1 text-gray-700 flex gap-2 items-center relative select-none',
        'hover:bg-gray-100 hover:rounded-lg active:bg-gray-200',
        'transition ease-in-out duration-200',
        className
      )}
      {...props}
    >
      <div className="w-4 h-full inline-flex items-center justify-center">
        <Select.ItemIndicator className="w-full">
          <CheckIcon />
        </Select.ItemIndicator>
      </div>

      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  )
}

export default function LanguageSelect({
  children,
  languageMap,
  ...props
}: Parameters<typeof Select.Root>[0] & {
  languageMap: { [key: string]: languageDesc }
}): JSX.Element {
  // props
  const { value, open } = props

  // ref
  const portalRef = useRef<HTMLDivElement>(null)

  return (
    <Select.Root {...props}>
      <Select.Trigger
        asChild
        className={clsx(
          'flex items-center justify-center gap-1 w-40 p-1 hover:bg-gray-100 rounded-lg',
          'transition-all ease-in-out duration-200',
          'hover:shadow-sm hover:border-gray-200',
          'border border-white'
        )}
      >
        <div className="flex items-center gap-1">
          {languageMap[value as Language].name}
          <div className="w-4 h-4">
            <ArrowIcon className={clsx(open ? 'rotate-180' : '')} />
          </div>
        </div>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          align="end"
          side="bottom"
          className={clsx(
            'p-2 overflow-hidden bg-white rounded-lg shadow-lg',
            'transition ease-in-out duration-300'
          )}
        >
          <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
            <ArrowIcon />
          </Select.ScrollUpButton>
          <Select.Viewport>
            <Select.Group className="flex flex-col gap-1">
              {Object.values(languageMap).map((val, idx) => (
                <SelectItem key={idx} value={val.value}>
                  {val.name}
                </SelectItem>
              ))}
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
            {/* <Select.Arrow /> */}
            <ArrowIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
