import h from '../src/h'
import { create as createElement } from '../src/dom-manager'
import patch from '../src/patch'

describe('modules', () => {
  describe('events', () => {
    it('without params', () => {
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

    it('with params', () => {
      let myObj = {
        data1: null,
        data2: null,
        data3: null
      }

      function renderButton() {
        return h('button', {
          events: {
            click: [(ev, obj, data1, data2, data3) => {
              obj.data1 = data1;
              obj.data2 = data2;
              obj.data3 = data3;
            }, myObj, 'Hi', 'This is a message', 'This is another']
          }
        })
      }

      let elem = createElement(renderButton())
      elem.dispatchEvent(new Event('click'))
      expect(myObj).to.deep.equal({
        data1: 'Hi',
        data2: 'This is a message',
        data3: 'This is another'
      })
    })

    it('can listen to multiple events', () => {
      let wasClicked = false
      let mouseovered = false

      function render() {
        return h('button', {
          events: {
            click: () => { wasClicked = true },
            mouseover: () => { mouseovered = true }
          }
        })
      }

      let elem = createElement(render())
      elem.dispatchEvent(new Event('click'))
      elem.dispatchEvent(new Event('mouseover'))
      expect(wasClicked).to.equal(true)
      expect(mouseovered).to.equal(true)
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