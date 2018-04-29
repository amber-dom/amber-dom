import { h, init } from '../src/amber-dom'


let vnode, elem
describe('module hooks', () => {
  describe('creating', () => {
    it('invoked on every newly created element.', () => {
      const res = []
      const { createElement } = init({
        name: 'foo',
        creating(elem, fooAttrs) {
          res.push({tagName: elem.tagName, attrs: fooAttrs})
        }
      })
      vnode = h('div', {foo: 'something'}, [
        h('span', 'Even without a "foo" attribute.'),
        h('div', {foo: 'another foo'})
      ])
      createElement(vnode)
      expect(res).deep.equal([
        { tagName: 'DIV', attrs: 'something' },
        { tagName: 'SPAN', attrs: void 0 },
        { tagName: 'DIV', attrs: 'another foo' }
      ])
    })

    it('invoked before "creating" of node hooks', () => {
      const res = []
      const { createElement } = init({
        name: 'foo',
        creating(elem, fooAttrs) {
          res.push('From "foo" module.')
        }
      })
      vnode = h('div', {hooks: {creating() {res.push('From node hooks.')}}})
      elem = createElement(vnode)
      expect(res).deep.equal(['From "foo" module.', 'From node hooks.'])
    })

    it('will not be invoked on Text Node', () => {
      const res = []
      const { createElement } = init({
        name: 'foo',
        creating(elem, fooAttrs) {
          res.push(elem)
        }
      })
      vnode = h('text', 'some ', 'text node')
      elem = createElement(vnode)
      expect(res).deep.equal([])
    })
  })

  describe('prepatch/postpatch', () => {
    it('invoked properly', () => {
      const res = []
      const {createElement, patch} = init({
        name: 'foo',
        prepatch() {
          res.push('foo: before patching begins.')
        },

        postpatch() {
          res.push('foo: after patching ends.')
        }
      })
      vnode = h('div', h('p', 'some text'))
      elem = createElement(vnode)
      vnode = h('div', h('p', 'another text'))
      expect(res).deep.equal([])
      patch(elem, vnode)
      console.log(res)
      expect(res).deep.equal(['foo: before patching begins.', 'foo: after patching ends.'])
    })
  })

  describe('updating', () => {
    it('invoked when updating an element', () => {
      const res = []
      const {createElement, patch} = init({
        name: 'foo',
        creating(elem, fooAttrs) {
          res.push(fooAttrs)
        },

        updating(elem, fooAttrs) {
          res.push(fooAttrs)
        }
      })
      vnode = h('div')
      elem = createElement(vnode)
      expect(res).deep.equal([void 0])
      vnode = h('div', {foo: 'bar'})
      patch(elem, vnode)
      expect(res).deep.equal([void 0, 'bar'])
    })

    it('invoked before children are updated', () => {
      const res = []
      const {createElement, patch} = init({
        name: 'foo',
        updating(elem, fooAttrs) {
          res.push(fooAttrs)
        }
      })
      vnode = h('div', [h('span')])
      elem  = createElement(vnode)
      expect(res).deep.equal([])
      vnode = h('div', {foo: 'parent'}, [h('span', {foo: 'child'})])
      patch(elem, vnode)
      expect(res).deep.equal(['parent', 'child'])
    })

    it('invoked before "updating" node hook', () => {
      const res = []
      const {createElement, patch} = init({
        name: 'foo',
        updating(elem, fooAttrs) {
          res.push('From module')
        }
      })
      vnode = h('div', {hooks: {updating() {res.push('From node')}}})
      elem = createElement(vnode)
      patch(elem, vnode)
      expect(res).deep.equal(['From module', 'From node'])
    })

    it('will not be invoked on Text Node', () => {
      const res = []
      const {createElement, patch} = init({
        name: 'foo',
        updating(elem) {
          res.push(1)
        }
      })
      vnode = h('text', 'some ', 'text')
      elem = createElement(vnode)
      patch(elem, h('any stuff', 'another stuff'))
      expect(res).deep.equal([])
    })
  })

  describe('unmounting', () => {
    it('invoked when an element is unmounting from its parent', () => {
      const res = []
      const {createElement, patch} = init({
        name: 'foo',
        unmounting(elem) {
          res.push(elem.tagName)
        }
      })

      vnode = h('div', [h('span', h('a'))])
      elem = createElement(vnode)
      expect(res).deep.equal([])
      vnode = h('div')
      patch(elem, vnode)
      expect(res).deep.equal(['SPAN'])
    })

    it('invoked before "unmounting" node hook', () => {
      const res = []
      const {createElement, patch} = init({
        name: 'foo',
        unmounting(elem) {
          res.push('unmounting module hook.')
        }
      })

      vnode = h('div', [h('span', {
        hooks: {unmounting() {res.push('unmounting node hook.')}}
      }, h('a'))])
      elem = createElement(vnode)
      vnode = h('div')
      patch(elem, vnode)
      expect(res).deep.equal(['unmounting module hook.', 'unmounting node hook.'])
    })
  })
})