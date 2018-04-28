import { h, init } from '../src/amber-dom'
import dataset from '../src/modules/dataset'

let vnode, elem;

describe('dataset', () => {
  const { patch, createElement } = init([dataset()])

  beforeEach(() => {
    vnode = h('div', {dataset: {id: '1234567'}}, 'some text child')
    elem = createElement(vnode)
  })

  it('can set on initial creation', () => {
    expect(elem.dataset.id).to.equal('1234567')
  })

  it('update dataset', () => {
    vnode = h('div', {dataset: {id: 'some other stuff'}}, 'some text child')
    patch(elem, vnode)
    expect(elem.dataset.id).to.equal('some other stuff')
  })

  it('remove explicitly', () => {
    vnode = h('div', {dataset: {id: void 0}}, 'some text child')
    patch(elem, vnode)
    expect(elem.dataset.id).to.equal(void 0)
  })

  it('remove implicitly', () => {
    vnode = h('div', 'some text child')
    patch(elem, vnode)
    expect(elem.dataset.id).to.equal(void 0)
  })

  it('add dataset', () => {
    vnode = h('div', {dataset: {id: '1234567', someData: 'myData'}}, 'some text child')
    patch(elem, vnode)
    expect(elem.dataset.id).to.equal('1234567')
    expect(elem.dataset.someData).to.equal('myData')
  })

  it('convert to string', () => {
    vnode = h('div', {dataset: {someData: 123}}, 'some text child')
    patch(elem, vnode)
    expect(elem.dataset.someData).to.equal('123')
  })
})