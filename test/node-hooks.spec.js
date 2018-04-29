import { h, init } from '../src/amber-dom'


let elem, vnode

describe('node hooks', () => {
  const { createElement, patch } = init()

  describe('init', () => {
    it('invoked when a vnode is initialized', () => {
      let data = []
      vnode = h('div', {hooks: {init: () => {data.push(1)}}})
      expect(data).deep.equal([1])
    })

    it('invoked only on nodes that have "init" hook.', () => {
      let tagNames = []
      let init = (vnode) => {tagNames.push(vnode.tagName)}
      let attrs = {hooks: {init}}
      vnode = h('div', [
        h('span', attrs),
        h('i', [
          h('p', attrs)])
      ])
      expect(tagNames).deep.equal(['SPAN', 'P'])
    })
  })

  describe('creating', () => {
    it('invoked before children are created', () => {
      let beforeChildCreated = false
      vnode = h('div', {
        hooks: {
          creating(elem) {
            beforeChildCreated = elem.childNodes.length ? false : true
          }
        }
      })
      createElement(vnode)
      expect(beforeChildCreated).to.equal(true)
    })

    it('invoked only on nodes with a "creating" hook.', () => {
      let tagNames = []
      let creating = (elem) => {tagNames.push(elem.tagName)}
      vnode = h('div', {
        hooks: {creating}
      }, [
        h('span', [ h('i', {hooks: {creating}}) ]),
        h('a', {hooks: {creating}})
      ])
      expect(tagNames).deep.equal([])
      createElement(vnode)
      expect(tagNames).deep.equal(['DIV', 'I', 'A'])
    })
  })

  describe('mounted', () => {
    it('invoked in DFS and inorder', () => {
      let tagNames = []
      let mounted = (elem) => {tagNames.push(elem.tagName)}
      let attrs = {hooks: {mounted}}
      vnode = h('div', attrs, [
        h('span', attrs, [ h('a', attrs) ]),
        h('p', attrs, [ h('i', attrs) ])
      ])
      createElement(vnode)
      expect(tagNames).deep.equal(['DIV', 'SPAN', 'A', 'P', 'I'])
    })

    it('invoked only on nodes with "mounted" hooks', () => {
      let tagNames = []
      let mounted = (elem) => {tagNames.push(elem.tagName)}
      let attrs = {hooks: {mounted}}
      vnode = h('div', attrs, [
        h('span', h('a', attrs, [ h('span', attrs) ])),
        h('p', [ h('i', attrs) ])
      ])
      createElement(vnode)
      expect(tagNames).deep.equal(['DIV', 'A', 'SPAN', 'I'])
    })
  })

  describe('updating', () => {
    it('invoked before updating children.', () => {
      let data = []
      let render = (title) => h('div', {
        title,
        hooks: {
          updating(elem) {
            data.push(1)
          }
        }
      },
        [h('span', {
            hooks: {
              updating(elem) {
                data.push(2)
              }
          }})
        ])

      vnode = render('before update')
      elem = createElement(vnode)
      expect(data).deep.equal([])
      vnode = render('updating')
      patch(elem, vnode)
      expect(data).deep.equal([1, 2])
    })
  })

  describe('unmounting', () => {
    it('invoked when unmounting from parent', () => {
      let unmountedNodes = []
      let unmounting = (elem) => {
        unmountedNodes.push(elem.textContent)
      }

      let itemView = (item) => h('li', {
        hooks: {
          unmounting
        }
      }, item)
      let render = (list) => h('ul', list.map(itemView))

      vnode = render(['apple', 'pear', 'orange', 'banana'])
      elem = createElement(vnode)
      vnode = render(['apple', 'pear'])
      patch(elem, vnode)
      expect(unmountedNodes.length).to.equal(2)
      expect(unmountedNodes).include('orange')
      expect(unmountedNodes).include('banana')
    })

    it('invoked only on nodes that are unmounting from their PARENT', () => {
      let unmountedNodes = []
      let unmounting = (elem) => {
        unmountedNodes.push(elem.tagName)
      }

      vnode = h('div', [
        h('span', {hooks: {unmounting}}, [
          h('a', {hooks: {unmounting}}, [ h('span', {hooks: {unmounting}}) ]),
        ])
      ])
      elem = createElement(vnode)
      vnode = h('div', [
        h('span', {hooks: {unmounting}})
      ])
      patch(elem, vnode)
      expect(unmountedNodes.length).to.equal(1)
      expect(unmountedNodes[0]).to.equal('A')
    })
  })
})