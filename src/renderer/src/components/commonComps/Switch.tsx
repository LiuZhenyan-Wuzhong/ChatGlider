import * as SwitchUI from '@radix-ui/react-switch'
import clsx from 'clsx'

const Switch = ({ className, id, checked, onCheckedChange }: SwitchUI.SwitchProps): JSX.Element => {
  return (
    <SwitchUI.Root
      className={clsx(
        'w-[42px] h-[23px] bg-gray-200 rounded-full relative shadow-inner outline-none',
        'data-[state=checked]:bg-blue-500 cursor-default',
        className
      )}
      checked={checked}
      onCheckedChange={onCheckedChange}
      id={id}
    >
      <SwitchUI.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
    </SwitchUI.Root>
  )
}

export default Switch
