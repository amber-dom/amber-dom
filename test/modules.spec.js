import h from '../src/h'
import { create as createElement } from '../src/dom-manager'
import patch from '../src/patch'

describe('modules', () => {
  describe('events', () => {
    it('can add a listener using "events"', () => {
      let isOn = false

      let elem = createElement(h('button', {
        events: {
          click: () => { isOn = !isOn }
        }
      }, 'Click me to toggle on/off'))
      elem.dispatchEvent(new Event('click'))
      expect(isOn).to.equal(true)
      elem.dispatchEvent(new Event('click'))
      expect(isOn).to.equal(false)
    })

    it('can remove listener by setting it undefined', () => {
      function renderButton(clickHandler) {
        return h('button', {
          events: {
            click: clickHandler
          }
        }, 'Click me to toggle on/off')
      }

      let isOn = false

      let elem = createElement(renderButton(() => { isOn = !isOn }))
      elem.dispatchEvent(new Event('click'))
      expect(isOn).to.equal(true)
      patch(elem, renderButton(void 0))

      // first time you can change me haha.
      elem.dispatchEvent(new Event('click'))
      expect(isOn).to.equal(true)
      // sec time!
      elem.dispatchEvent(new Event('click'))
      expect(isOn).to.equal(true)
    })
  })
})