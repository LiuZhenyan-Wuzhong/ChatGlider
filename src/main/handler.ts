import ioHook from 'iohook-forglider'
import { throttle, debounce } from 'lodash'

export type MouseCallback = () => void

export class MouseDragHandler {
  // endPosition: Position

  clickCount = 0

  isMouseDragging = false

  _mouseUpUserCallback?: MouseCallback

  _mouseDownUserCallback?: MouseCallback

  constructor(mouseDownUserCallback?: MouseCallback, mouseUpUserCallback?: MouseCallback) {
    this._mouseUpUserCallback = mouseUpUserCallback
    this._mouseDownUserCallback = mouseDownUserCallback
  }

  listen: () => void = () => {
    console.log('开始监听鼠标事件。')

    ioHook.on('mousedrag', throttle(this._mouseDragHandler, 200))
    ioHook.on('mousedown', this._mouseDownHandler)
    ioHook.on('mouseup', () => {
      this.clickCount++

      debounce(this._mouseUpHandler, 300)()
    })

    ioHook.start()
  }

  stop: () => void = () => {
    ioHook.start(false)
  }

  _mouseDragHandler: () => void = () => {
    this.isMouseDragging = true
  }

  _mouseDownHandler: () => void = () => {
    // this.isMouseDragging = false

    // console.log('down')

    if (this._mouseDownUserCallback) {
      this._mouseDownUserCallback()
    }
  }

  _mouseUpHandler: () => void = () => {
    // console.log('up')

    if (this._mouseUpUserCallback) {
      if (this.clickCount >= 2) {
        // console.log('double click')

        this._mouseUpUserCallback()
      } else if (this.isMouseDragging) {
        this._mouseUpUserCallback()
      }
    }
    this.clickCount = 0
    this.isMouseDragging = false
  }
}
