import { h, patch, createElement } from '../src/amber-dom'

describe('event hooks', () => {
  it('can add a listener using "ev-*"', () => {
    let isOn = false

    let elem = createElement(h('button', {
      'ev-click': () => { isOn = !isOn }
    }, 'Click me to toggle on/off'))
    elem.dispatchEvent(new Event('click'))
    expect(isOn).to.equal(true)
    elem.dispatchEvent(new Event('click'))
    expect(isOn).to.equal(false)
  })
})