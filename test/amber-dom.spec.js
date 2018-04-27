import mg, { h } from '../src/amber-dom';


/** Use for testing patching. Assume no dupplicate item. */
function renderWithKeys(list) {
  return h('ul', [ list.map(item => h('li', { key: item }, item)) ])
}

function renderWithoutKeys(list) {
  return h('ul', [ list.map(item => h('li', item)) ])
}

function renderWithCustomKey(list) {
  return h('ul', [ list.map(item => h('li', { key: item.key }, item.value)) ])
}

/**
 * This file tests the basic usage of amber-dom.
 */
describe('amber-dom', () => {

  const { patch, createElement } = mg.init(mg.modules.all())

  describe('hyperscript', () => {
    it('can create vnode with element tag', () => {
      expect(h('div').tagName).to.equal('DIV')
      expect(h('span').tagName).to.equal('SPAN')
      expect(h('a').tagName).to.equal('A')
    })

    it('can create vnode with CSS selector', () => {
      const vnode = h('div#hello.content.main')
      expect(vnode.tagName).to.equal('DIV')
      expect(vnode.attrs.id).to.equal('hello')
      expect(vnode.attrs._className).to.equal('content main')
    })

    it('can create a vnode with attrs & a child', () => {
      const vnode = h('div', {
        id: 'myDiv',
        className: ['content', 'main']
      }, h('span#hello'))

      // test attrs.
      expect(vnode.tagName).to.equal('DIV')
      expect(vnode.attrs.id).to.equal('myDiv')
      expect(vnode.attrs.className).deep.equal(['content', 'main'])

      // test children
      expect(vnode.children[0].tagName).to.equal('SPAN')
      expect(vnode.children[0].attrs.id).equal('hello')
    })

    it('can create a vnode with attrs.className as a string or as an array', () => {
      const vnode1 = h('div', {
        className: 'content main'
      })

      const vnode2 = h('div', {
        className: ['content', 'main']
      })

      expect(vnode1.attrs.className).to.equal('content main')
      expect(vnode2.attrs.className).deep.equal(['content', 'main'])
    })

    it('can create a vnode with attrs & children', () => {
      const vnode = h('div', { id: 'stuff' },
        h('h1', 'Hello amber-dom!'))

      expect(vnode.children[0].tagName).to.equal('H1')
      expect(vnode.children[0].children[0]).to.equal('Hello amber-dom!')
    })

    it('can create a vnode with no attrs but children', () => {
      const vnode = h('div',
        h('span'),
        h('span'))

      expect(vnode.children[0].tagName).to.equal('SPAN')
      expect(vnode.children[1].tagName).to.equal('SPAN')
    })

    it('can create a vnode with no attrs but nested children', () => {
      const vnode = h('div', [h('span'), h('span')])

      expect(vnode.children[0].tagName).to.equal('SPAN')
      expect(vnode.children[1].tagName).to.equal('SPAN')
    })

    it('can create a vnode with strings as children', () => {
      const vnode = h('div', 'amber-dom', ' is awesome')

      expect(vnode.children.length).to.equal(1)
      expect(vnode.children[0]).to.equal('amber-dom is awesome')
    })

    it('can create a vnode with attrs & array nested children', () => {
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
      function render(props) {
        return h('div', props.text)
      }

      const vnode = h(render, {
        text: 'Awesome!'
      })

      expect(vnode.tagName).to.equal('DIV')
      expect(vnode.children[0]).to.equal('Awesome!')
    })

    it('can accept "text" as selector', () => {
      const vnode = h('text', 'amber-dom', ' is awesome')

      expect(typeof vnode).to.equal('string')
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

    it('create an element with id & classes in attrs', () => {
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

    it('create elements with attrs', () => {
      let elem = createElement(h('a', { src: 'http://example.com' }))

      expect(elem.getAttribute('src')).to.equal('http://example.com')
    })

    it('create a text node from text vnode', () => {
      let elem = createElement(h('text', 'I am a text node'))

      expect(elem.nodeType).to.equal(Node.TEXT_NODE)
    })

    it('"innerHTML" provided in attrs will not work.', () => {
      let elem = createElement(h('div', {innerHTML: '<h1>Hello</h1>'}))

      expect(elem.textContent).to.equal('')
    })

    it('"children" provided in attrs will not work.', () => {
      let elem = createElement(h('div', {children: h('h1', 'Hello')}))

      expect(elem.childNodes.length).to.equal(0)
    })

    it('"on*" properties can still be used to set up listeners.', () => {
      let res = []
      let elem = createElement(h('div', { onclick: () => {res.push(1)} }))

      elem.click()
      expect(res).deep.equal([1])
    })

    it('type of children is restricted.', () => {
      let elem = createElement(h('div', [{text: "I'm not a child"}, "I'm a child"]))

      expect(elem.childNodes.length).to.equal(1)
      expect(elem.firstChild.textContent).to.equal("I'm a child")
    })
  })

  describe('patch', () => {

    describe('patch text children', () => {
      it('patch simple texts', () => {
        function render(props) {
          return h('div', 'Hello', props.message1, props.message2)
        }

        const elem = createElement(render({ message1: ' amber-dom', message2: '!' }))
        expect(elem.textContent).to.equal('Hello amber-dom!')
        patch(elem, render({ message1: ' virtual dom', message2: ' amber-dom' }))

        expect(elem.textContent).to.equal('Hello virtual dom amber-dom')
      })

      it('patch texts with insertions', () => {
        function render(props) {
          return h('div', props.m1, props.m2, props.m3)
        }

        const elem = createElement(render({ m1: 'Hello ', m2: 'amber', m3: '' }))
        patch(elem, render({ m1: 'Hello ', m2: 'amber', m3: '-dom' }))
        expect(elem.textContent).to.equal('Hello amber-dom')
      })

      it('patch texts with removals', () => {
        function render(props) {
          return h('div', props.m1, props.m2, props.m3)
        }

        const elem = createElement(render({ m1: 'Hello ', m2: 'amber', m3: '-dom' }))
        patch(elem, render({ m1: 'Hello ', m2: 'amber', m3: '' }))
        expect(elem.textContent).to.equal('Hello amber')
      })
    })


    describe('patch element children with and without keys', () => {

      it('patch different child elements', () => {
        let vnode = h('div', [h('span')])
        let elem = createElement(vnode)

        vnode = h('div', [h('p')])
        patch(elem, vnode)
        expect(elem.childNodes[0].tagName).to.equal('P')
      })

      it('patch child elements with prepends', () => {
        let vnode = renderWithKeys(['JavaScript', 'HTML', 'CSS'])
        let elem = createElement(vnode)

        // with keys.
        patch(elem, renderWithKeys(['amber-dom', 'JavaScript', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(4)
        expect(elem.firstChild.textContent).to.equal('amber-dom')
        expect(elem.childNodes[1].textContent).to.equal('JavaScript')
        expect(elem.childNodes[2].textContent).to.equal('HTML')
        expect(elem.childNodes[3].textContent).to.equal('CSS')

        
        // Without keys.
        vnode = renderWithoutKeys(['JavaScript', 'HTML', 'CSS'])
        elem = createElement(vnode)

        patch(elem, renderWithoutKeys(['amber-dom', 'JavaScript', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(4)
        expect(elem.firstChild.textContent).to.equal('amber-dom')
        expect(elem.childNodes[1].textContent).to.equal('JavaScript')
        expect(elem.childNodes[2].textContent).to.equal('HTML')
        expect(elem.childNodes[3].textContent).to.equal('CSS')
      })

      it('patch child elements with appends', () => {
        let vnode = renderWithKeys(['JavaScript', 'HTML', 'CSS'])
        let elem = createElement(vnode)

        // With keys
        patch(elem, renderWithKeys(['JavaScript', 'HTML', 'CSS', 'amber-dom', 'virtual dom']))
        expect(elem.childNodes.length).to.equal(5)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.childNodes[2].textContent).to.equal('CSS')
        expect(elem.childNodes[3].textContent).to.equal('amber-dom')
        expect(elem.lastChild.textContent).to.equal('virtual dom')

        // Without keys
        vnode = renderWithoutKeys(['JavaScript', 'HTML', 'CSS'])
        elem = createElement(vnode)
        patch(elem, renderWithoutKeys(['JavaScript', 'HTML', 'CSS', 'amber-dom', 'virtual dom']))
        expect(elem.childNodes.length).to.equal(5)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.childNodes[2].textContent).to.equal('CSS')
        expect(elem.childNodes[3].textContent).to.equal('amber-dom')
        expect(elem.lastChild.textContent).to.equal('virtual dom')
      })

      it('patch child elements with insertions', () => {
        let elem = createElement(renderWithKeys(['JavaScript', 'HTML', 'CSS']))

        // With keys
        patch(elem, renderWithKeys(['JavaScript', 'amber-dom', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(4)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('amber-dom')
        expect(elem.childNodes[2].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('CSS')

        patch(elem, renderWithKeys(['JavaScript', 'amber-dom', 'React', 'HTML', 'Preact', 'CSS']))
        expect(elem.childNodes.length).to.equal(6)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('amber-dom')
        expect(elem.childNodes[2].textContent).to.equal('React')
        expect(elem.childNodes[3].textContent).to.equal('HTML')
        expect(elem.childNodes[4].textContent).to.equal('Preact')
        expect(elem.lastChild.textContent).to.equal('CSS')

        // Without keys.
        elem = createElement(renderWithoutKeys(['JavaScript', 'HTML', 'CSS']))
        patch(elem, renderWithoutKeys(['JavaScript', 'amber-dom', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(4)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('amber-dom')
        expect(elem.childNodes[2].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('CSS')

        patch(elem, renderWithoutKeys(['JavaScript', 'amber-dom', 'React', 'HTML', 'Preact', 'CSS']))
        expect(elem.childNodes.length).to.equal(6)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('amber-dom')
        expect(elem.childNodes[2].textContent).to.equal('React')
        expect(elem.childNodes[3].textContent).to.equal('HTML')
        expect(elem.childNodes[4].textContent).to.equal('Preact')
        expect(elem.lastChild.textContent).to.equal('CSS')
      })

      it('patch child elements with removals', () => {
        /**************
         * With keys
         ***************/
        // Remove from the middle.
        let elem = createElement(renderWithKeys(['JavaScript', 'amber-dom', 'React', 'Preact', 'HTML', 'CSS']))
        patch(elem, renderWithKeys(['JavaScript', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('CSS')

        // Remove from the back.
        patch(elem, renderWithKeys(['JavaScript', 'HTML']))
        expect(elem.childNodes.length).to.equal(2)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.lastChild.textContent).to.equal('HTML')

        // Remove from the front.
        patch(elem, renderWithKeys(['HTML']))
        expect(elem.childNodes.length).to.equal(1)
        expect(elem.firstChild.textContent).to.equal('HTML')

        // Test corner case.
        patch(elem, renderWithKeys([]))
        expect(elem.childNodes.length).to.equal(0)


        /*********************
         * Without keys
         **********************/
        elem = createElement(renderWithoutKeys(['JavaScript', 'amber-dom', 'React', 'Preact', 'HTML', 'CSS']))
        patch(elem, renderWithoutKeys(['JavaScript', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('CSS')

        // Remove from the back.
        patch(elem, renderWithoutKeys(['JavaScript', 'HTML']))
        expect(elem.childNodes.length).to.equal(2)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.lastChild.textContent).to.equal('HTML')

        // Remove from the front.
        patch(elem, renderWithoutKeys(['HTML']))
        expect(elem.childNodes.length).to.equal(1)
        expect(elem.firstChild.textContent).to.equal('HTML')

        // Test corner case.
        patch(elem, renderWithoutKeys([]))
        expect(elem.childNodes.length).to.equal(0)
      })

      it ('patch child elements with reorder', () => {
        
        /**********************
         * With keys
         ***********************/
        let vnode = renderWithKeys(['JavaScript', 'HTML', 'CSS'])
        let elem = createElement(vnode)
        patch(elem, renderWithKeys(['JavaScript', 'CSS', 'HTML']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('CSS')
        expect(elem.lastChild.textContent).to.equal('HTML')

        patch(elem, renderWithKeys(['CSS', 'HTML', 'JavaScript']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('CSS')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('JavaScript')

        /**********************
         * Without keys.
         ***********************/
        vnode = renderWithoutKeys(['JavaScript', 'HTML', 'CSS'])
        elem = createElement(vnode)
        patch(elem, renderWithoutKeys(['JavaScript', 'CSS', 'HTML']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('CSS')
        expect(elem.lastChild.textContent).to.equal('HTML')

        patch(elem, renderWithoutKeys(['CSS', 'HTML', 'JavaScript']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('CSS')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('JavaScript')
      })

      it('patch child elements with insertions & removals', () => {
        /*********************
         * With keys
         **********************/
        let vnode = renderWithKeys(['JavaScript', 'HTML', 'CSS'])
        let elem = createElement(vnode)

        patch(elem, renderWithKeys(['HTML', 'amber-dom', 'CSS']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('HTML')
        expect(elem.childNodes[1].textContent).to.equal('amber-dom')
        expect(elem.lastChild.textContent).to.equal('CSS')
        
        patch(elem, renderWithKeys(['JavaScript', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('CSS')

        /***********************
         * Without keys
         ************************/
        vnode = renderWithoutKeys(['JavaScript', 'HTML', 'CSS'])
        elem = createElement(vnode)

        patch(elem, renderWithoutKeys(['HTML', 'amber-dom', 'CSS']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('HTML')
        expect(elem.childNodes[1].textContent).to.equal('amber-dom')
        expect(elem.lastChild.textContent).to.equal('CSS')
        
        patch(elem, renderWithoutKeys(['JavaScript', 'HTML', 'CSS']))
        expect(elem.childNodes.length).to.equal(3)
        expect(elem.firstChild.textContent).to.equal('JavaScript')
        expect(elem.childNodes[1].textContent).to.equal('HTML')
        expect(elem.lastChild.textContent).to.equal('CSS')
      })

      it('patch child elements with reorders, insertions, & removals', () => {

        /**********************
         * With keys
         ************************/
        let elem = createElement(renderWithKeys(['Some stuff', 'Another stuff', 'Yet another stuff']))
        patch(elem, renderWithKeys(['Another stuff', 'Real stuff', 'OK stuff', 'Yet another stuff']))

        expect(elem.childNodes.length).to.equal(4)
        expect(elem.firstChild.textContent).to.equal('Another stuff')
        expect(elem.childNodes[1].textContent).to.equal('Real stuff')
        expect(elem.childNodes[2].textContent).to.equal('OK stuff')
        expect(elem.lastChild.textContent).to.to.equal('Yet another stuff')

        /**********************
         * Without keys
         ***********************/
        elem = createElement(renderWithoutKeys(['Some stuff', 'Another stuff', 'Yet another stuff']))
        patch(elem, renderWithoutKeys(['Another stuff', 'Real stuff', 'OK stuff', 'Yet another stuff']))

        expect(elem.childNodes.length).to.equal(4)
        expect(elem.firstChild.textContent).to.equal('Another stuff')
        expect(elem.childNodes[1].textContent).to.equal('Real stuff')
        expect(elem.childNodes[2].textContent).to.equal('OK stuff')
        expect(elem.lastChild.textContent).to.to.equal('Yet another stuff')
      })
    })


    describe('patch element with randomly keyed children', () => {
      it('can deal with randomly set up data', () => {
        const data1 = [
          { key: 'appl', value: 'Apple'},
          { key: 'pear', value: 'Pear' },
          { value: 'Pineaple' }
        ]

        const data2 = [
          { key: 'orange', value: 'Orange' },
          { value: 'Peach' },
          { key: 'something complex', value: 'Pineaple' },
          { key: 'foo', value: 'bar' }
        ]

        let elem = createElement(renderWithCustomKey(data1))
        patch(elem, renderWithCustomKey(data2))
        expect(elem.childNodes.length).to.equal(4)

        for (let i = 0; i < 4; i++) {
          expect(elem.childNodes[i].textContent).to.equal(data2[i].value)
        }
      })
    })

    
    describe('patch DOM trees weren\'t created by createElement.', () => {
      function render(props) {
        return h('div', [
          h('span', props.message)
        ])
      }
    
      it('patch an empty DOM tree with the same root.', () => {
        const dom = document.createElement('div')
        
        patch(dom, render({ message: 'hello' }))
        expect(dom.childNodes.length).to.equal(1)
        expect(dom.firstChild.tagName).to.equal('SPAN')
        expect(dom.firstChild.firstChild.textContent).to.equal('hello')
      })
    
      it('patch an empty, unmounted DOM tree with different roots', () => {
        let dom = document.createElement('span')
    
        // since it is not mounted on the real dom, you must
        // take the returned new dom tree.
        dom = patch(dom, render({ message: 'hello' }))
        expect(dom.childNodes.length).to.equal(1)
        expect(dom.firstChild.tagName).to.equal('SPAN')
        expect(dom.firstChild.firstChild.textContent).to.equal('hello')
      })
    
      it('patch an empty, mounted DOM tree with different roots', () => {
        let dom = document.createElement('span')
    
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(dom)
          patch(dom, render({ message: 'hello' }))
          expect(dom.childNodes.length).to.equal(1)
          expect(dom.firstChild.tagName).to.equal('SPAN')
          expect(dom.firstChild.firstChild.textContent).to.equal('hello')
        })
      })

      it('patch a non-empty DOM tree', () => {
        let dom = document.createElement('div')

        dom.appendChild(document.createElement('span'))
        dom.appendChild(document.createElement('p'))
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(dom)
          patch(dom, render({ message: 'hello' }))
          expect(dom.childNodes.length).to.equal(1)
          expect(dom.firstChild.tagName).to.equal('SPAN')
          expect(dom.firstChild.firstChild.textContent).to.equal('hello')
        })
      })
    })
  })
})
