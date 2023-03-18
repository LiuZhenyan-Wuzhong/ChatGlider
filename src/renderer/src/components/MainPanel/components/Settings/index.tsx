import {
  AllHTMLAttributes,
  ChangeEventHandler,
  Context,
  MouseEventHandler,
  ReactNode,
  useContext,
  useState
} from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ReactComponent as CrossIcon } from '@renderer/assets/img/cross.svg'
import { ReactComponent as SettingIcon } from '@renderer/assets/img/setting.svg'
import Button from '@renderer/components/commonComps/Button'
import { clsx } from 'clsx'
import { AppContext, AppContextI } from '@renderer/App'

enum SettingType {
  input = 'SettingType/input',
  textarea = 'SettingType/textarea'
}

interface SettingItemProps extends AllHTMLAttributes<HTMLDivElement> {
  settingType: SettingType
  settingName: string
  settingElement: ReactNode
  placeholder: string
  value: string
  onChangeInput: (val: string) => void
}

function SettingItem({
  className,
  settingType,
  settingName,
  settingElement,
  placeholder,
  value,
  onChangeInput
}: SettingItemProps): JSX.Element {
  // callback
  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChangeInput(e.currentTarget.value)
  }

  const handleTextAreaChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    onChangeInput(e.currentTarget.value)
  }

  return (
    <fieldset className={clsx('flex flex-col gap-2 items-start', className)}>
      <label className="flex items-center text-sm font-medium cursor-pointer" htmlFor={settingName}>
        {settingElement}
      </label>
      {settingType === SettingType.input ? (
        <input
          value={value}
          className={clsx(
            'w-full flex items-center justify-center flex-1 rounded py-0.5 px-2.5 text-xs bg-white border',
            'text-gray-700',
            'focus:bg-white focus:shadow-sm focus:shadow-opacity-50 focus:outline-none'
          )}
          id={settingName}
          placeholder={placeholder}
          onChange={handleInputChange}
        />
      ) : null}
      {settingType === SettingType.textarea ? (
        <textarea
          value={value}
          className={clsx(
            'w-full flex items-center justify-center h-16 rounded py-1 px-2.5 text-xs bg-white border',
            'text-gray-700',
            'focus:bg-white focus:shadow-sm focus:shadow-opacity-50 focus:outline-none'
          )}
          style={{ resize: 'none' }}
          id={settingName}
          placeholder={placeholder}
          onChange={handleTextAreaChange}
        />
      ) : null}
    </fieldset>
  )
}

interface SettingsProps extends AllHTMLAttributes<HTMLDivElement> {}

export default function Settings({ className }: SettingsProps): JSX.Element {
  // context
  const { apiKey, setApiKey, OpenAI_URL, setOpenAI_URL } = useContext(
    AppContext as Context<AppContextI>
  )

  // state
  const [open, setOpen] = useState(false)

  // callback
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setOpen((prev) => !prev)
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          onClick={handleClick}
          className={clsx(
            'w-8 h-8 z-40 rounded-lg p-1 flex items-center justify-center border border-gray-100',
            'hover:border hover:border-gray-300 hover:bg-gray-200 hover:shadow',
            'transition-all ease-in-out duration-200',
            'data-[state=open]:bg-gray-300',
            className
          )}
        >
          <SettingIcon />
          <div
            className={clsx(
              'fixed z-30 inset-0 bg-gray-500 bg-opacity-25 cursor-default rounded-2xl',
              open ? '' : 'hidden'
            )}
          ></div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          className="z-40 w-96 h-full rounded-xl p-4 bg-white flex flex-col gap-2"
        >
          <Popover.Close
            className={clsx(
              'w-4 h-4 z-30 rounded-full flex items-center justify-center',
              'hover:bg-gray-200 hover:shadow absolute top-1.5 right-1.5 bg-white',
              'transition-all ease-in-out duration-200',
              'data-[state=open]:bg-gray-300',
              className
            )}
            aria-label="Close Settings"
            onClick={handleClick}
          >
            <CrossIcon />
          </Popover.Close>

          <div className="flex flex-col gap-3">
            <div className="text-gray-700 font-medium">设置</div>
            <SettingItem
              className="flex-grow"
              settingType={SettingType.textarea}
              settingName="OpenAI-ApiKey"
              settingElement={'OpenAI-ApiKey'}
              placeholder="Your OpenAI ApiKey."
              value={apiKey}
              onChangeInput={(val): void => setApiKey(val)}
            />
            <SettingItem
              className="flex-grow"
              settingType={SettingType.textarea}
              settingName="OpenAI-URL"
              settingElement={'OpenAI-URL'}
              placeholder="Your OpenAI ApiKey."
              value={OpenAI_URL}
              onChangeInput={(val): void => setOpenAI_URL(val)}
            />
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
