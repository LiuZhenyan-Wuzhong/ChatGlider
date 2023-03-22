import * as TooltipUI from '@radix-ui/react-tooltip'
import { ReactComponent as OpenAIIcon } from '@renderer/assets/img/openai.svg'
import { ReactComponent as WuzhongIcon } from '@renderer/assets/img/wuzhong.svg'
import Button from '@renderer/components/commonComps/Button'
import clsx from 'clsx'

const OpenAIIntro = (): JSX.Element => (
  <TooltipUI.Provider>
    <TooltipUI.Root>
      <TooltipUI.Trigger disabled>
        <OpenAIIcon />
      </TooltipUI.Trigger>
      <TooltipUI.Portal>
        <TooltipUI.Content
          className={clsx(
            'data-[side=bottom]:animate-slideUpAndFade data-[side=right]:animate-slideLeftAndFade data-[side=left]:animate-slideRightAndFade data-[side=top]:animate-slideDownAndFade data-[state=open]:transition-all',
            'w-[300px] rounded-md bg-white p-5 shadow-lg border',
            'flex flex-col gap-[12px] z-30'
          )}
          sideOffset={5}
        >
          <div className="flex flex-col gap-[7px]">
            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <OpenAIIcon />
              </div>
              <div>
                <div className="m-0 text-[15px] font-medium leading-0">OpenAI</div>
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <div className="m-0 text-[12px] leading-0">
                OpenAI开放的chatgpt-API为本项目助力，更多信息请参考openai官网：
              </div>
              <a className="m-0 text-[12px] leading-[1.5]" href="https://openai.com/">
                https://openai.com/
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-[7px]">
            <div className="flex gap-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <WuzhongIcon />
                </div>
              </div>
              <div className="flex-shrink">
                <div className="m-0 text-[15px] font-medium leading-0">Wuzhong</div>
                <div className="m-0 text-[12px] text-gray-600 leading-0 select-all">
                  @wuzhong110110@gmail.com
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <div className="m-0 text-[12px] leading-[1.5]">
                本项目(ChatGlider)的开发者是独立开发者、在读建筑学硕士Wuzhong(ID)，欢迎访问它的github官网，针对项目提出修改建议，或是做出代码贡献，欢迎有闲的产品经理一起合作。github主页：
              </div>
              <a
                className="m-0 text-[12px] leading-[1.5]"
                href="https://github.com/LiuZhenyan-Wuzhong"
              >
                https://github.com/LiuZhenyan-Wuzhong
              </a>
            </div>
          </div>

          <TooltipUI.Arrow className="fill-white" />
        </TooltipUI.Content>
      </TooltipUI.Portal>
    </TooltipUI.Root>
  </TooltipUI.Provider>
)

export default OpenAIIntro
