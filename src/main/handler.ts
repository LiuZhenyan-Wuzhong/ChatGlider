/* eslint-disable prettier/prettier */
import mouseEvents from 'global-mouse-events'

export type MouseCallback = () => void

export class MouseDragHandler {
  // endPosition: Position

  isMouseMoved = false

  _mouseUpUserCallback?: MouseCallback

  _mouseDownUserCallback?: MouseCallback

  constructor(mouseDownUserCallback?: MouseCallback, mouseUpUserCallback?: MouseCallback) {
    this._mouseUpUserCallback = mouseUpUserCallback
    this._mouseDownUserCallback = mouseDownUserCallback
  }

  listen(): void {
    mouseEvents.on('mousemove', (e) => this._mouseMoveHandler(e))

    mouseEvents.on('mousedown', (e) => this._mouseDownHandler(e))

    mouseEvents.on('mouseup', (e) => this._mouseUpHandler(e))
  }

  stop(): void {
    mouseEvents.pauseMouseEvents()
  }

  _mouseMoveHandler(event: MouseEvent): void {
    this.isMouseMoved = true
  }

  _mouseDownHandler(event: MouseEvent): void {
    this.isMouseMoved = false

    if (this._mouseDownUserCallback) {
      this._mouseDownUserCallback()
    }
  }

  _mouseUpHandler(event: MouseEvent): void {
    if (this._mouseUpUserCallback && this.isMouseMoved) {
      this._mouseUpUserCallback()
    }

    this.isMouseMoved = false
  }
}
