import { h, init } from '../src/amber-dom'


let elem, vnode

describe('hooks', () => {
  const { createElement, patch } = init()

  describe('init', () => {
    it('a vnode with `init`', () => {
      let data = []
      vnode = h('div', {hooks: {init: () => {data.push(1)}}})
      expect(data).deep.equal([1])
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
  })

  describe('mounted', () => {
    it('correct order(dfs and inorder)', () => {
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
  })
})