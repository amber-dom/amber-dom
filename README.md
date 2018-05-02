# <center style="color: #FF4500;">Amber-dom</center>

**Amber-dom** is yet another virtual dom library, which lets you create and update your DOM easily. It is modularized in architecture, making it easy to extend with modules. Built-in modules are shipped with to cover some of the basic use cases. All of them are optional.

## Motivation

Amber-dom started as learning project. At the time I came across [an article](https://github.com/livoras/blog/issues/13) about the basic idea of virtual dom and a diffing algorithm walking two virtual trees in DFS order. I followed the code in that article and later on I decided to make something that can be used seriously, something scalable. Finally I did make something, but it was rather naive. After wandering through some great projects, I decided to rewrite the whole thing, and this is it.

Amber-dom implements an algorithm that *almost* works the same as [Snabbdom](https://github.com/snabbdom/snabbdom), which compares the children from both from both ways(from the start and end), and then update every child, layer by layer, and finally place them into correct positions. This is great. On top of that, Amber-dom adjusts this algorithm slightly, making it more fit to its implementation. Another great idea inspired by Snabbdom is its modularity. Separating the core algorithm from its functionality modules makes it easy to extend, configure, or even replace those you don't like. Amber-dom implements a similar modularized architecure with slight difference, though, they both works by registering hooks into lifecycles of DOM nodes. Sometimes you don't want to registering hooks into every DOM node's lifecycle, a set of hooks are also available for individual nodes, too. See it below. 

Next important feature of Amber-dom is, instead of maintaining two virtual trees in memory, Amber-dom diffs against a real DOM tree directly, freeing you from manually keeping the latest created vtree. It works by keeping neccessary information on the DOM tree for next diffing. This idea was inspired by [Preact](https://preactjs.com/) and [morphdom](https://github.com/patrick-steele-idem/morphdom). However, Preact compares the children from only one way, and it uses a different algorithm which, as I'm concerned, might not be the most effective one; morphdom also uses a different diffing algorithm that walks two tree in DFS order, and it requires a rather complicated vnode implementation which is not what I wanted. But I agree that accessing the DOM data structure is not slow because it's key part of browsers. The slow part is recalculating style, repaint and reflow. As long as we keep the updating of DOM as small as possible, we can avoid such uneccessary overhead. That means if we combine Snabbdom's fast algorithm with the idea of diffing against the real DOM tree, meanwhile keep the virtual node implementation small and simple, we might be able to improve it. And this is Amber-dom.

## Simple example

A counter example:

```js
import { h, init } from "amber-dom" // Import `h` for creating vnode, and a `init` function.
import events from "amber-dom/modules/events" // Import the `events` module generator function.


let count = 0
let root = document.createElement('div') // Create an initial element to patch with.
let { patch } = init([events()])         // Init with `events` module. Remember `events` is a function.

function render() {                      // Wire up a render logic.
  return h('div#app', [
    count,
    h('br'),
    h('button', {
      events: {
        click: [incrementCounter, root, 1]  // Add event listener `incrementCounter` and params to it.
      }
    }, '+')
  ])
}

function incrementCounter(ev, elem, step) { // Event listener
  count += step
  patch(elem, render())
}

document.addEventListener('DOMContentLoaded', () => { // When DOM is loaded
  document.body.appendChild(root)
  patch(root, render()) // Render our logic.
})
```

## API documentation

### `h(selector, attrs, children)`

The h function is provided to let you create a vnode easily. 
- **selector** can either be a simple CSS selector string(e.g. `div#app.content`), or a function that returns a vnode.
- **attrs** is an optional object describing attributes/properties of the DOM node.
- **children** is an array of children vnodes. It is optional, and can be any nested.

```js
let vnode = h('div#app.content', {style: {color: '#ff4500'}}, [
  h('h1', 'Heading 1'), h('h2', 'Heading 2')
])

// You can skip the `attrs` if it is null
let vnode1 = h('div', 'Some Text')
```

If you pass multiple strings as children, Amber-dom will concat them into a single string, eventually a single `TextNode`.

### `init(modules)`

The `init` function takes a list of modules and return an object containing a `.patch()` and a `.createElement()` methods used for patching an element and creating an element from a vnode.
- **modules** is an array of modules. It is optional.

```js
import { h, init } from 'amber-dom'
import events from 'amber-dom/modules/events'
import style from 'amber-dom/modules/style'
import dataset from 'amber-dom/modules/dataset'

let { patch, createElement } = init([
  events(),
  style(),
  dataset()
])
```

### `patch(elem, vnode)`

The `patch` function returned by `init` function lets you diff and patch any existing DOM with a vtree efficiently. This frees you from manually keep the last generated vtree in memory, since Amber-dom stores information of the real DOM tree, but keeps it small.

- **elem** can be any existing DOM nodes.
- **vnode** is a virtual tree rooted at vnode.

### `createElement(vnode)`

Even if `patch` function can be used to patch any existing DOM trees, it would still be helpful to expose a function to build a DOM tree from a vtree. `createElement` lets you do that.

```js
let { createElement } = init()
let vnode = h('div', [
  h('h1', 'Hello from ', 'Amber-dom!'),
  h('h2', 'Welcome!')
])
let elem = createElement(vnode) // => <div>
                                //      <h1>Hello from Amber-dom!</h1>
                                //      <h2>Welcom!</h2>
                                //    </div>
```

### Hooks

Lifecycle hooks are powerful because they let you take control of different phazes of Nodes. Modules also work by hooking into the lifecycles of nodes. All hooks are listed as below:

| hook   | invoke time | available for | params |
|--------|-------------|------------|---------|
| init | when a vnode is created. | node | `init(vnode)` |
| creating | when creating the DOM element, before creating any of its children. | node, module| `creating(elem)` for node, `creating(elem, modAttrs)` for module |
| mounted | when the element is created and mounted to DOM. | node | `mounted(elem)` |
| prepatch | before the whole patching begins. | module | `prepatch(elem, vnode)` |
| updating | when updating the DOM element, before updating any of its children. | node, module| `updating(elem)` for node, `updating(elem, modAttrs)` for module |
| unmounting | when unmounting the DOM element from its parent. | node, module | `unmounting(elem)` |
| postpatch | after the whole patching ends | module | `postpatch(elem, vnode)` |