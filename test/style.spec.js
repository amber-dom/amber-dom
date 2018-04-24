import h from '../src/h'
import patch from '../src/patch'
import createElement from '../src/create-element'

describe('style', () => {
  it('add style using object literal', () => {
    let elem = createElement(h('div', {style: {fontSize: '12px'}}))
    expect(elem.style.fontSize).to.equal('12px')
  })

  it('add style using string literal', () => {
    let elem = createElement(h('div', {style: 'color: red;'}))
    expect(elem.style.color).to.equal('red')
  })

  it('update style', () => {
    let elem = createElement(h('div', {style: {color: 'red'}}))
    patch(elem, h('div', {style: {color: 'black'}}))
    expect(elem.style.color).to.equal('black')
    patch(elem, h('div', {style: {color: 'green'}}))
    expect(elem.style.color).to.equal('green')
  })

  it('remove style by setting it to falsy', () => {
    let elem = createElement(h('div', {style: {color: 'red', textAlign: 'center'}}))
    expect(elem.style.color).to.equal('red')
    expect(elem.style.textAlign).to.equal('center')
    
    patch(elem, h('div', {style: void 0}))
    expect(elem.style.color).to.equal('')
    expect(elem.style.textAlign).to.equal('')
  })

  it('remove style by setting it an empty string', () => {
    let elem = createElement(h('div', {style: {color: 'red', textAlign: 'center'}}))
    expect(elem.style.color).to.equal('red')
    expect(elem.style.textAlign).to.equal('center')
    
    patch(elem, h('div', {style: {color: 'red', textAlign: ''}}))
    expect(elem.style.color).to.equal('red')
    expect(elem.style.textAlign).to.equal('')
  })

  it('implicitly remove style', () => {
    let elem = createElement(h('div', {style: {color: 'red'}}))
    expect(elem.style.color).to.equal('red')

    patch(elem, h('div'))
    expect(elem.style.color).to.equal('')
  })
})