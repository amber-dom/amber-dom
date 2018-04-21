import { h, patch } from '../src/amber-dom'


function render(props) {
  return h('div', [
    h('span', props.message)
  ])
}

describe('patch DOM trees weren\'t created by createElement.', () => {
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
})