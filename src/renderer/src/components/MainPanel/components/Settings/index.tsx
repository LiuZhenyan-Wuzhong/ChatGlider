import {
  AllHTMLAttributes,
  ChangeEventHandler,
  Context,
  Dispatch,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState
} from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ReactComponent as CrossIcon } from '@renderer/assets/img/cross.svg'
import { ReactComponent as SettingIcon } from '@renderer/assets/img/setting.svg'
import { clsx } from 'clsx'
import { AppContext, AppContextI } from '@renderer/App'
import { MainPanelContext, MainPanelContextI } from '../..'
import Switch from '@renderer/components/commonComps/Switch'
import Tooltip from '@renderer/components/commonComps/Tooltip'
import Info from '@renderer/components/commonComps/Info'
import Button from '@renderer/components/commonComps/Button'
import PrimayButton from '@renderer/components/commonComps/PrimaryButton'

enum SettingType {
  input = 'SettingType/input',
  textarea = 'SettingType/textarea'
}

interface SettingItemProps extends AllHTMLAttributes<HTMLDivElement> {
  settingType: SettingType
  settingName: string
  settingElement: ReactNode
  placeholder: string
  description: string
  value: string
  onChangeInput: (val: string) => void
}

function SettingItem({
  className,
  settingType,
  settingName,
  settingElement,
  placeholder,
  description,
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
    <fieldset className={clsx('flex flex-col gap-1 items-start', className)}>
      <div className="flex items-center gap-2">
        <label
          className="flex items-center text-sm font-medium cursor-pointer"
          htmlFor={settingName}
        >
          {settingElement}
        </label>
        <Tooltip content={description}>
          <Info />
        </Tooltip>
      </div>

      {settingType === SettingType.input ? (
        <input
          value={value}
          className={clsx(
            'w-full flex items-center justify-center flex-1 rounded py-0.5 px-2.5 text-xs bg-white border',
            'text-gray-700',
            'focus:bg-white focus:shadow-sm focus:shadow-opacity-50 focus:outline-none',
            value.length === 0 ? 'ring-2 ring-red-500 bg-red-100 text-red-600' : ''
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
            'w-full flex items-center justify-center leading-sm rounded py-1 px-2.5 text-xs bg-white border',
            'text-gray-700',
            'focus:bg-white focus:shadow-sm focus:shadow-opacity-50 focus:outline-none',
            value.length === 0 ? 'ring-2 ring-red-500 bg-red-100 text-red-600' : ''
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

interface SettingsProps extends AllHTMLAttributes<HTMLDivElement> {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export default function Settings({ className, open, setOpen }: SettingsProps): JSX.Element {
  // context
  const {
    openAIAPIKey,
    setOpenAIAPIKey,
    openAIURL,
    setOpenAIURL,
    openAIAPIRef,
    stream,
    setStream
  } = useContext(AppContext as Context<AppContextI>)

  // state
  const [saveDisabled, setSaveDisabled] = useState(false)

  // callback
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    setOpen((prev) => !prev)
  }

  const handleSave: MouseEventHandler<HTMLButtonElement> = async (e) => {
    setSaveDisabled(true)
    const success = await window.electron.ipcRenderer.invoke('saveUserData', {
      openAIAPIKey,
      openAIURL,
      stream
    })
    setSaveDisabled(false)
  }

  // effect
  useEffect(() => {
    window.electron.ipcRenderer.invoke('queryUserData')
  }, [])

  return (
    <Popover.Root open={open}>
      <Popover.Trigger asChild>
        <button
          onClick={handleClick}
          disabled={saveDisabled}
          className={clsx(
            'w-8 h-8 z-40 rounded-lg p-1 flex items-center justify-center border border-gray-100',
            'hover:border hover:border-gray-300 hover:bg-gray-200 hover:shadow',
            'transition-all ease-in-out duration-200',
            'data-[state=open]:bg-gray-300',
            className
          )}
        >
          <SettingIcon />
          {/* <div
            id="overlay"
            className={clsx(
              'fixed z-40 inset-0 bg-gray-500 cursor-default rounded-2xl',
              'data-[state=close]:hidden'
              // open ? '' : 'hidden'
            )}
            style={{ zIndex: 999 }}
          ></div> */}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          className="z-40 w-[400px] h-full rounded-xl p-4 bg-white flex flex-col gap-2 border shadow-sm"
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
              className={clsx('flex-grow')}
              settingType={SettingType.textarea}
              settingName="OpenAI-ApiKey"
              settingElement={'OpenAI-ApiKey'}
              placeholder="Your OpenAI ApiKey."
              description="请设置您的OpenAI APIKey，作者承诺将不会保存和使用您的任何数据。"
              value={openAIAPIKey}
              onChangeInput={(val): void => setOpenAIAPIKey(val)}
            />
            <SettingItem
              className="flex-grow"
              settingType={SettingType.textarea}
              settingName="OpenAI-URL"
              settingElement={'OpenAI-URL'}
              placeholder="Your OpenAI URL."
              description="如果您拥有可以帮您转发请求的url，请设置您的OpenAI URL，此处设置的是openai的默认api url。"
              value={openAIURL}
              onChangeInput={(val): void => setOpenAIURL(val)}
            />
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-[15px] leading-none" htmlFor="check-if-stream">
                  开启流式传输
                </label>
                <Tooltip content="像ChatGPT原版应用中一样的逐步将内容显示出来">
                  <Info />
                </Tooltip>
              </div>

              <Switch
                id="check-if-stream"
                checked={stream}
                onCheckedChange={(e): void => {
                  setStream((prev) => !prev)
                }}
              />
            </div>

            <PrimayButton onClick={handleSave}>Save</PrimayButton>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
