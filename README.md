# <center style="color: #FF4500;">Amber-dom</center>

**Amber-dom** is yet another virtual dom library, which lets you create and update your DOM easily. It is modularized in architecture, making it easy to extend with modules. Built-in modules are shipped with to cover some of the basic use cases. All of them are optional.

## Motivation

Amber-dom started as learning project. At the time I came across [an article](https://github.com/livoras/blog/issues/13) about the basic idea of virtual dom and a diffing algorithm walking two virtual trees in DFS order. I followed the code in that article and later on I decided to make something that can be used seriously, something scalable. Finally I did make something, but it was rather naive. After wandering through some great projects, I decided to rewrite the whole thing, and this is it.

Amber-dom implements an algorithm that *almost* works the same as [Snabbdom](https://github.com/snabbdom/snabbdom), which compares the children from both from both ways(from the start and end), and then update every child, layer by layer, and finally place them into correct positions. This is great. On top of that, Amber-dom adjusts this algorithm slightly, making it more fit to its implementation.

Another great idea inspired by Snabbdom is its modularity. Separating the core algorithm from its functionality modules makes it easy to extend, configure, or even replace those you don't like. Amber-dom implements a similar modularized architecure with slight difference, though, they both works by registering hooks into lifecycles of DOM nodes. See it below. 

Next important feature of Amber-dom is, instead of maintaining two virtual trees in memory, Amber-dom diffs against a real DOM tree directly, freeing you from manually keeping the latest created vtree. It works by keeping neccessary information on the DOM tree for next diffing. This idea was inspired by [Preact](https://preactjs.com/) and [morphdom](https://github.com/patrick-steele-idem/morphdom). However, Preact compares the children from only one way, and it uses a different algorithm which, as I'm concerned, might not be the most effective one; morphdom also uses a different diffing algorithm that walks two tree in DFS order, and it requires a rather complicated vnode implementation which is not what I wanted.

But I agree that accessing the DOM data structure is not slow because it's key part of browsers. The slow part is recalculating style, repaint and reflow. As long as we keep the updating of DOM as small as possible, we can avoid such uneccessary overhead. That means if we combine Snabbdom's fast algorithm with the idea of diffing against the real DOM tree, meanwhile keep the virtual node implementation small and simple, we might be able to improve it. And this is Amber-dom.

## Simple example

A counter example:

```js
import { h, init } from "amber-dom" // Import `h` for creating vnode, and a `init` function.
import events from "amber-dom/modules/events" // Import the `events` module creator function.


let count = 0
let root = document.createElement('div') // Create an initial element to patch with.
let { patch } = init([events()])         // Init with `events` module. Remember `events` is a function.

function render() {                      // Wire up a render logic.
  return h('div#app', [
    count,
    h('br'),
    h('button', {
      events: {
        click: [incrementCounter, root, 1]  // Add `incrementCounter` as listener,
                                            // and `root`, `1` as arguments to listener when listener is called.
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

Inside the param `attrs`, you can set any DOM attributes inside it. In fact, Amber-dom will set them as properties on the DOM node as long as possible. If you're confused about DOM properties and attributes, take a look at this [article](https://javascript.info/dom-attributes-and-properties) and you'll understand them.

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

Notice that `creating`, `updating` and `unmounting` are available for both single DOM nodes and modules. To use hooks on a single node, simply specify them inside the `hooks` inside `attrs`, when using `h` function to create a vnode:

```js
let vnode = h('div', {
  hooks: {
    init(vnode) { ... },
    creating(elem) { ... },
    mounted(elem) { ... },
    ...
  }
})
```

#### `init(vnode)` hook

The `init` hook lets you invoke some function right after a vnode is created(and all children of this vnode are created), and right before the real DOM node is created.

#### `creating(elem)` and `creating(elem, modAttrs)` hook

Invoked when an Element is being created. Available for both modules and single DOM nodes. When used on a single node, only the Element being created will be passed as argument to the hook, while both the Element being created and the corresponding module attributes(see [module documentation](#module-documentation)) will be passed to the hook for modules. Also note that, when this hook is invoked, the `childNodes` for `elem` have not been created yet.

#### `mounted(elem)` hook

Invoked when an Element is created from a vnode, and mounted to the real DOM. Available for single DOM nodes only. This is because in some case you might want to get some computed DOM properties after they're created and mounted.

#### `prepatch(elem, vnode)` hook

Invoked before the whole patching process begins. Available for modules only.

#### `updating(elem)` and `updating(elem, modAttrs)` hook

Invoked when an Element is being updating during the patching process. Available for both modules and single DOM nodes. The arguments passed to the hook are the same as `creating` hook. Also note that when this hook is invoked, the `childNodes` of `elem` have not been created yet.


#### `unmounting(elem)` hook

Invoked when an Element is being unmounted from its parent. Available for both modules and single DOM nodes. The params are the same for both. Note that only when an Element is removed from its parent, will this hook be invoked. The elements removed indirectly will not be invoked on this hook.

```js
let elem = createElement(h('div', h('p', h('span'))))
```
The `unmounting` hook will be invoked on element p, but not on element `span`. (However you can traverse the unmounted tree inside the callback to `unmounting`.)

#### `postpatch(elem, vnode)` hook

Invoked after the whole patching process finishes. Available for modules only.

## Modules documentation

Modules let you customize the functionality of Amber-dom. It works by hooking into different phazes of lifecycle of the **whole tree**. This is also the main difference compared to registering hooks on single nodes.

A module is simply an object with a `name` property. Yes, the `name` property is the only thing that required to be a module. The value of the `name` property is a **module attribute** name. The **module attribute** is set inside `attrs` param of the `h` function. And once you have defined a module, you can use it in `init` function.

Let's take an example to understand it. Say we'd like to make a `foo` module:

```js
// 1. define the `foo` module.
let fooMod = {
  name: 'foo',
  creating(elem, fooAttrs) { ... },
  updating(elem, fooAttrs) { ... }
}

// 2. use it in `init` function.
let { createElement, patch } = init([fooMod])
```

Then we'd be able to define our module attributes like this:

```js
let vnode = h('div', {
  // This is our **module attributes**
  foo: {
    ...
  }
}, h('p'))

let elem = createElement(vnode)
```

When `createElement` is creating `div` element, the `div` element and the value of `foo` module attribute will be passed to `fooMod.creating()` as arguments. You'll be deciding what to do with them inside `fooMod.creating()`. When `elem` is being patched with a new vnode, the second argument passed to `fooMod.updating()` is the new vnode's `foo` module attribute.

When the vnode doesn't have a module attribute(e.g. the `p` elem above), `undefined` will be passed in as the module attributes.

Now you understand what I mean by **module attribute**. One more important thing to be aware of is, **`createElement` and `patch` functions returned by `init` will not do anything with any module attributes**. This means you decide what to do with all these module attributes on `creating` and `updating`. And the rest attributes will be managed by `createElement` and `patch` functions.

Let's continue with the `foo` module example. 

```js
import { h, init } from "amber-dom"

let vnode = h('div', {
  // This is our **module attributes**.
  // You'll decide what to do with it.
  foo: {
    ...
  },

  // This is **not** a module attribute.
  // `createElement` and `patch` will help you deal with it.
  className: 'main content'   // set the CSS class.
}, h('p'))

let elem = createElement(vnode)
```

### Built-in modules

Built-in modules are provided to cover the basic use cases. In fact, they're module creators(a function returns a module).

#### `modules/events` creator

This creator creates an `events` module, which lets you add listeners on events.

```js
import { h, init } from "amber-dom"
import events from "amber-dom/modules/events"

let { createElement } = init([ events() ])
let vnode = h('div', {
  events: {
    click: (ev) => {}
  }
})
```

Sometimes you might want to pass some additional arguments to the event listeners, just pass an array with the first item as the listener, the rest as arguments. Note that the first argument to the listener will still be the `event` object.

```js
let vnode = h('div', {
  events: {
    click: [(ev, arg1, arg2) => {}, 'firts arg', 'second arg']
  }
})
```

#### `modules/style` creator

It lets you add inline style to an element easily.