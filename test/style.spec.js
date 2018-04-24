import h from '../src/h'
import patch from '../src/patch'
import {create as createElement} from '../src/dom-manager'

describe('style', () => {
  it('add style using object literal', () => {
    let elem = createElement(h('div', {style: {fontSize: '12px'}}))
    expect(elem.style.fontSize).to.equal('12px')
  })
})