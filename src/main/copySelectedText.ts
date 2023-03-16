/* eslint-disable prettier/prettier */
import robot from 'robotjs'
import { clipboard } from 'electron'
// import clipboard from 'clipboard'
// const clipboard = (await import("clipboard")).default

// TODO 鼠标未移动不进行复制。
const copySelectedText = async (): Promise<string> => {
  // const now = Date.now()

  const buffer = clipboard.readText()

  return new Promise((resolve, reject) => {
    robot.keyToggle('control', 'down')

    robot.keyTap('c')

    robot.keyToggle('control', 'up')

    setTimeout(() => {
      const text = clipboard.readText().replace('\r', '').replace('\n', '').trim()

      clipboard.writeText(buffer)

      resolve(text)
    }, 50)
  })
}

export default copySelectedText
