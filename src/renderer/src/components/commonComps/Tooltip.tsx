import * as TooltipUI from '@radix-ui/react-tooltip'
import { AllHTMLAttributes, forwardRef } from 'react'

type TooltipUIProperty = AllHTMLAttributes<HTMLDivElement> & Parameters<typeof TooltipUI.Root>[0]

const Tooltip = ({ className, content, children }: TooltipUIProperty): JSX.Element => {
  return (
    <TooltipUI.Provider delayDuration={300}>
      <TooltipUI.Root>
        <TooltipUI.Trigger>{children}</TooltipUI.Trigger>
        <TooltipUI.Portal>
          <TooltipUI.Content
            className="z-50 flex max-w-[480px] select-none rounded-lg bg-[var(--bg-base)] px-3 py-2 text-xs font-normal leading-5 text-[var(--label-muted)] shadow-md transition-all duration-300 ease-out bg-white border"
            sideOffset={5}
            side="top"
            align="center"
          >
            {content}
            <TooltipUI.Arrow className="fill-white" />
          </TooltipUI.Content>
        </TooltipUI.Portal>
      </TooltipUI.Root>
    </TooltipUI.Provider>
  )
}

export default Tooltip
