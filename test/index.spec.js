// import './amber-dom.spec'
// import './events.spec'
// import './style.spec'
// import './module-manager.spec'

import { h, patch, createElement } from "../src/amber-dom"

let count = 0

function render() {
  return h('div#app', [
    count,
    h('br'),
    h('button', {
      events: {
        click: [incrementCounter, 1]
      }
    }, '+')
  ])
}

function incrementCounter(ev, step) {
  count += step
  patch(document.getElementById('app'), render())
}
document.addEventListener('DOMContentLoaded', () => {
  let elem = createElement(render())

  document.body.appendChild(elem)
})