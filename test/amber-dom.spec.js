import { h, createElement, patch } from '../src/amber-dom'


/**
 * This file tests the basic usage of amber-dom.
 */
describe('amber-dom', () => {
  describe('hyperscript', () => {
    it('can create vnode with element tag', () => {
      expect(h('div').tagName).to.equal('DIV')
      expect(h('span').tagName).to.equal('SPAN')
      expect(h('a').tagName).to.equal('A')
    })

    it('can create vnode with CSS selector', () => {
      const vnode = h('div#hello.content.main')
      expect(vnode.tagName).to.equal('DIV')
      expect(vnode.props.id).to.equal('hello')
      expect(vnode.props.className).to.equal('content main')
    })

    it('can create a vnode with props & a child', () => {
      const vnode = h('div', {
        style: {
          'color': 'red',
          'text-align': 'center'
        },
        id: 'myDiv',
        className: ['content', 'main']
      }, h('span#hello'))

      // test props.
      expect(vnode.tagName).to.equal('DIV')
      expect(vnode.props.style['color']).to.equal('red')
      expect(vnode.props.style['text-align']).to.equal('center')

      // test children
      expect(vnode.children[0].tagName).to.equal('SPAN')
      expect(vnode.children[0].props.id).equal('hello')
    })

    it('can create a vnode with props.className as a string or as an array', () => {
      const vnode1 = h('div', {
        className: 'content main'
      })

      const vnode2 = h('div', {
        className: ['content', 'main']
      })

      expect(vnode1.props.className).to.equal('content main')
      expect(vnode2.props.className).to.equal('content main')
    })

    it('can create a vnode with props & children', () => {
      const vnode = h('div', { id: 'stuff' },
        h('h1', 'Hello amber-dom!'))

      expect(vnode.children[0].tagName).to.equal('H1')
      expect(vnode.children[0].children[0]).to.equal('Hello amber-dom!')
    })

    it('can create a vnode with no props but children', () => {
      const vnode = h('div',
        h('span'),
        h('span'))

      expect(vnode.children[0].tagName).to.equal('SPAN')
      expect(vnode.children[1].tagName).to.equal('SPAN')
    })

    it('can create a vnode with no props but nested children', () => {
      const vnode = h('div', [h('span'), h('span')])

      expect(vnode.children[0].tagName).to.equal('SPAN')
      expect(vnode.children[1].tagName).to.equal('SPAN')
    })

    it('can create a vnode with string as children', () => {
      const vnode = h('div', 'amber-dom', ' is awesome')

      expect(vnode.children[0]).to.equal('amber-dom')
      expect(vnode.children[1]).to.equal(' is awesome')
    })

    it('can create a vnode with props & array nested children', () => {
      const vnode = h('div', {
        id: 'div-with-nested-children'
      },
      [
        h('h1', 'Child 1.'),
        h('h2', 'Child 2'),
        h('h3', 'Child 3'),

        [
          h('span', 'Nested child 4')
        ]
      ])

      let i = 0
      expect(vnode.children[i++].tagName).to.equal('H1')
      expect(vnode.children[i++].tagName).to.equal('H2')
      expect(vnode.children[i++].tagName).to.equal('H3')
      expect(vnode.children[i++].tagName).to.equal('SPAN')
    })

    it('can accept a custom function as first argument', () => {
      function CustomGenerator(props) {
        return h('div', {
          style: props.style
        }, props.text)
      }

      const vnode = h(CustomGenerator, {
        text: 'Awesome!',
        style: {
          'text-align': 'center'
        }
      })

      expect(vnode.tagName).to.equal('DIV')
      expect(vnode.props.style['text-align']).to.equal('center')
      expect(vnode.children[0]).to.equal('Awesome!')
    })

    it('can accept "text" as selector, & returns a concat string', () => {
      const vnode = h('text', 'amber-dom', 'is awesome')

      expect(vnode).to.equal('amber-dom is awesome')
    })
  })


  describe('createElement', () => {
    it('create an empty element', () => {
      const elem = createElement(h('div'))

      expect(elem instanceof Element)
      expect(elem.tagName).to.equal('DIV')
    })

    it('create an element with id & classes in selector', () => {
      const elem = createElement(h('div#app.content.main'))

      expect(elem instanceof Element)
      expect(elem.tagName).to.equal('DIV')
      expect(elem.id).to.equal('app')
      expect(elem.className).to.equal('content main')
    })

    it('create an element with id & classes in props', () => {
      const elem = createElement(h('i', {className: 'someclass secondclass'}))

      assert.isOk(elem.classList.contains('someclass'))
      assert.isOk(elem.classList.contains('secondclass'))
    })

    it('create elements with correct namespace', () => {
      const SVG_NS = 'http://www.w3.org/2000/svg'

      let elem = createElement(h('svg', h('text', {
        'font-size': "12"
      }, h('tspan', { x: "0", y: "10" }, 'something'))))

      expect(elem.namespaceURI).to.equal(SVG_NS)
      elem = createElement(h('svg#some-id'))
      expect(elem.namespaceURI).to.equal(SVG_NS)
    })

    it('create elements with text content', () => {
      let elem = createElement(h('div', ['I am a string']))

      expect(elem.textContent).to.equal('I am a string')
      elem = createElement(h('span', ['Another one', ' with multiple strings']))
      expect(elem.textContent).to.equal('Another one with multiple strings')
    })

    it('create elements with span and text content', () => {
      let elem = createElement(h('a', [h('span'), 'I am a string']))

      expect(elem.childNodes[0].tagName).to.equal('SPAN')
      expect(elem.childNodes[1].textContent).to.equal('I am a string')
    })

    it('create elements with props', () => {
      let elem = createElement(h('a', { src: 'http://example.com' }))

      expect(elem.getAttribute('src')).to.equal('http://example.com')
    })

    it('create a text node from text vnode', () => {
      let elem = createElement(h('text', 'I am a text node'))

      expect(elem.nodeType).to.equal(Node.TEXT_NODE)
    })
  })
})
