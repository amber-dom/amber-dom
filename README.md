# <center>amber-dom</center>

[![Build Status](https://www.travis-ci.org/Alieeeeen/amber-dom.svg?branch=master)](https://www.travis-ci.org/Alieeeeen/amber-dom) [![npm version](https://badge.fury.io/js/amber-dom.svg)](https://badge.fury.io/js/amber-dom)

**amber-dom** is yet another lightweight virtual-dom library.

## Features

- Lightweight & simple
- Build dom trees using **hyperscript** or **jsx**

## Why Another Virtual Dom Library?

`amber-dom` started as a study project. In fact, I've been exploring related projects and improving **amber-dom** continuously. I hope that it can enlighten you in some way.

Existing virtual dom libraries might be much more sophisticated and flexible. You might get frustrated when reading their source code. `amber-dom` provides another option.

Due to its simplicity, you'll use `amber-dom` easily if you're already familiar with [hyperscript](https://github.com/hyperhype/hyperscript). It doesn't matter if you're unfamiliar with it, you can either continue reading this README, or take a glance at [docs/creatingVTree](docs/creatingVTree).

## Installation

Install it with npm

```bash
npm i amber-dom
```

Then you can use it with a bundler, like webpack or rollup.

```js
import { h, diff, patch } from 'amber-dom'

```

If you don't want any set-up, you can download `amber-dom` from [unpkg.com](https://unpkg.com/amber-dom/dist/amberdom.min.js). Then `window.amberdom` is globally available.

```html
<script src="https://unpkg.com/amber-dom/dist/amberdom.min.js"></script>
```


## Get Started

`amber-dom` provides 4 basic interfaces:

- **VNode** — a vnode constructor, corresponds to a DOM node. You can call `.render()` on an instance of `VNode` to render a DOM node.
- **h** — a DSL for creating virtual trees, returning a `VNode` instance representing the root of that virtual tree.
- **diff** — diffs 2 virtual tree.
- **patch** — patches a DOM tree with provided patches.

Our hello-world example:

```js
// 1. set up a render logic. Let's call it a custom node.
function render(className, message) {
  return h('h1#app', {
    className: className
  }, message)
}

// 2. set up init UI state.
let vtree = render('hello', 'Hello world!')  // create a virtual tree.
const domTree = vtree.render()     // render it to a DOM tree.
document.body.appendChild(domTree)

// 3. set up a UI logic.
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const newVTree = render('content', 'This is your first amber-dom app.')
    const patches = diff(vtree, newVTree) // diff
    patch(domTree, patches) // patch
    vtree = newVTree
  }, 1000)
})
```

Meanwhile let's add some transition:

```html
<style>
  .hello {
    text-align: center;
  }

  .content {
    text-align: center;
    animation: fade-in 1.5s;
  }

  @keyframes fade-in {
    0% {opacity: 0;}
    40% {opacity: 0;}
    100% {opacity: 1;}
  }

  @-webkit-keyframes fade-in {
    0% {opacity: 0;}
    40% {opacity: 0;}
    100% {opacity: 1;}
  }
</style>
```

## Example

An example of a ticking clock is below. Just copy and save it to `index.html` on your current root directory, and then open it in your browser.

```html
<html>
  <body>
    <script src="https://unpkg.com/amber-dom/dist/amberdom.min.js"></script>
    <script>
      const { h, diff, patch } = amberdom
      const state = { // set up some UI state.
        time: new Date().toLocaleTimeString()
      }

      const Clock = function(time) { // define a custom node.
        return h('div#app',          // h function returns a vtree.
          h('h1', 'Hello amber-dom!'),
          h('h2', 'It is ', time)
        )
      }

      const clockComponent = {   // define a singleton component.
        tree: Clock(state.time), // current virtual tree
        rootNode: null,          // root of rendered DOM tree
        parentNode: null,        // parent of the rendered DOM tree
        _timer: null,

        mount: function(parentNode) {        // once mount is called, UI state updates itself.
          this.rootNode = this.tree.render() // render to dom vtree
          this.parentNode = parentNode
          parentNode.appendChild(this.rootNode)

          const updater = () => {
            clearTimeout(this._timer)
            state.time = new Date().toLocaleTimeString()

            const tree = Clock(state.time)        // a new vtree
            const patches = diff(this.tree, tree) // diff

            patch(this.rootNode, patches)         // patch
            this.tree = tree
            this._timer = setTimeout(updater, 1000)
          }
          updater()
        },

        unmount: function() {
          clearTimeout(this._timer)
          this.parentNode.removeChild(this.rootNode)
          return this.tree
        }
      }

      window.onload = () => { clockComponent.mount(document.body) }
    </script>
  </body>
</html>
```

Press `F12`, you should see `amber-dom` updates only what's necessary.

You can umount the `clockComponent` on console by doing:

```js
clockComponent.unmount()
```

Click [here](ticking-example.gif) to see the demo.

## Test

```bash
git clone git@github.com:Alieeeeen/amber-dom.git

cd amber-dom

npm install

npm test
```

## Documentation

It is recommanded to read the docs in the following order.

1. For details of creating a virtual tree, see [docs/creatingVTree](docs/creatingVTree.md).
2. For details of `diff`, see [docs/diff](docs/diff.md).
3. For details of `patch`, see [docs/patch](docs/patch.md).

## License
MIT