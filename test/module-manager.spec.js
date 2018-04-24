import h from '../src/h'
import patch from '../src/patch'
import createElement from '../src/create-element'
import style from '../src/modules/style'
import { addModules, initModules, rmModules } from '../src/module-manager'

describe('module-manager', () => {
  describe('addModules', () => {
    it('add a module', () => {
      addModules({
        name: 'foo',
  
        creating: (elem, fooAttrs) => {
          // simply store some data in this DOM Node, if any.
          if (fooAttrs)
            elem.__foo__ = fooAttrs
        },
  
        updating: (elem, fooAttrs) => {
          // simply mark a DOM Node is updated.
          elem.__foo__ = 'updated'
        }
      })

      let elem = createElement(h('div', {foo: "I'm created!"}))
      expect(elem.__foo__).to.equal("I'm created!")
      patch(elem, h('div'))
      expect(elem.__foo__).to.equal("updated")
    })

    it('module must have "name", "creating" and "updating"', () => {
      // This module will not be added because not a name was
      // provided.
      addModules({  
        creating: (elem, fooAttrs) => {
          // simply store some data in this DOM Node, if any.
          if (fooAttrs)
            elem.__bar__ = fooAttrs
        },
  
        updating: (elem, fooAttrs) => {
          // simply mark a DOM Node is updated.
          elem.__bar__ = 'updated'
        }
      })

      let elem = createElement(h('div', {bar: "I'm created!"}))
      expect(elem.__bar__).to.equal(void 0)
      patch(elem, h('div'))
      expect(elem.__bar__).to.equal(void 0)
    })

    it('add multiple modules', () => {
      addModules([{
        name: 'x',
        creating: (elem, attrs) => {
          elem.__x__ = attrs
        },
        updating: (elem, attrs) => {
          elem.__x__ = attrs
        }
      }, {
        name: 'y',
        creating: (elem, attrs) => {
          elem.__y__ = attrs
        },
        updating: (elem, attrs) => {
          elem.__y__ = attrs
        }}
      ])

      let elem = createElement(h('div', {x: "This is x.", y: "This is y."}))
      expect(elem.__x__).to.equal("This is x.")
      expect(elem.__y__).to.equal("This is y.")

      patch(elem, h('div', { x: "x updated", y: "y updated" }))
      expect(elem.__x__).to.equal("x updated")
      expect(elem.__y__).to.equal("y updated")
    })
  })


  describe('rmModules', () => {
    it('remove a module', () => {
      rmModules('foo')

      let elem = createElement(h('div', {foo: "I'm removed"}))
      expect(elem.__foo__).to.equal(void 0)
      patch(elem, h('div'))
      expect(elem.__foo__).to.equal(void 0)
    })

    it('remove multiple modules', () => {
      rmModules(['x', 'y'])
      let elem = createElement(h('div', {x: "This is x.", y: "This is y."}))
      expect(elem.__x__).to.equal(void 0)
      expect(elem.__y__).to.equal(void 0)

      patch(elem, h('div', { x: "x updated", y: "y updated" }))
      expect(elem.__x__).to.equal(void 0)
      expect(elem.__y__).to.equal(void 0)
    })
  })

  describe('initModules', () => {
    it('init without any module', () => {
      initModules()
      // Now all modules were removed. setting any module attributes will
      // not work.
      let elem = createElement(h('div', {style: {color: 'red'}}))
      expect(elem.style.color).to.equal('')
    })

    it('init with a module', () => {
      initModules({
        name: 'foo',
  
        creating: (elem, fooAttrs) => {
          // simply store some data in this DOM Node, if any.
          if (fooAttrs)
            elem.__foo__ = fooAttrs
        },
  
        updating: (elem, fooAttrs) => {
          // simply mark a DOM Node is updated.
          elem.__foo__ = 'updated'
        }
      })

      let elem = createElement(h('div', {foo: "I'm created!"}))
      expect(elem.__foo__).to.equal("I'm created!")
      patch(elem, h('div'))
      expect(elem.__foo__).to.equal('updated')
    })

    it('init with multiple modules', () => {
      initModules([
        {
          name: 'x',
          creating: (elem, attrs) => {
            elem.__x__ = attrs
          },
          updating: (elem, attrs) => {
            elem.__x__ = attrs
          }
        },
        style
      ])

      let elem = createElement(h('div', {x: "x.creating was called", style: {color: 'red'}}))
      expect(elem.__x__).to.equal('x.creating was called')
      expect(elem.style.color).to.equal('red')

      patch(elem, h('div', {style: {color: 'black'}}))
      expect(elem.__x__).to.equal(void 0)
      expect(elem.style.color).to.equal('black')
    })
  })
})