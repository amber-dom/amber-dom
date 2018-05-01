# <center>Amber-dom</center>

**Amber-dom** is yet another virtual dom library, which lets you create and update your DOM easily. It is modularized in architecture, making it easy to extend with modules. It is also shipped with built-in modules that cover some of the basic use cases. But all of them are optional.

## Motivation

It started as learning project at the very first beginning. I came across [an article](https://github.com/livoras/blog/issues/13) about virtual dom and followed it. Later on I decided to make something that can be used seriously, something scalable, and I did make it work. But it was rather naive. After wandering through some great projects, I decided to rewrite the whole thing, and this is it.

`Amber-dom` implements an algorithm that **almost** works the same as [Snabbdom](https://github.com/snabbdom/snabbdom), which compares the children from both head and tail, and then update every child, layer by layer, and finally place them into correct positions. This is a great. On top of that, Amber-dom adjusts this algorithm slightly, making it more fit to its implementation. Another great idea inspired by Snabbdom is its modularity. Separating the core algorithm from its functionality modules makes it easy to extend, configure, or even replace those you don't like. Amber-dom implements a similar modularized architecure with slight difference. It works by hooking into lifecycles of DOM nodes. With the goals to provide a scalable virtual dom library, Amber-dom also provides a set of hooks available for individual DOM nodes, too. See it below. 

Instead of maintaining two virtual trees in memory, Amber-dom diffs against a real DOM tree directly, freeing you from manually assign and keep the latest vtree. This idea was inspired by [Preact](https://preactjs.com/) and [morphdom](https://github.com/patrick-steele-idem/morphdom). But Preact compares the children from only one way, and it uses a different algorithm; morphdom, on the other hand, requires a rather complicated virtual node implementation which is not what I wanted. But I also agree that accessing the DOM data structure is not slow because it's key part of browsers. The slow part is recalculating style, repaint and reflow. As long as we keep the updating of DOM as small as possible, we can avoid such uneccessary overhead. That means if we combine Snabbdom's fast algorithm with the idea of diffing against the real DOM tree, meanwhile keep the virtual node implementation small and simple, we might be able to improve a little bit. And this is Amber-dom.

## Simple example

```js
import { h, init } from "amber-dom"
import events from "amber-dom/modules/events"


let count = 0
let root = document.createElement('div') // Create an initial element to patch with.
let { patch } = init([events()])         // Init with `events` module.

function render() {                      // Wire up a render logic.
  return h('div#app', [
    count,
    h('br'),
    h('button', {
      events: {
        click: [incrementCounter, root, 1]  // Add event listener and params to it.
      }
    }, '+')
  ])
}

function incrementCounter(ev, elem, step) { // Event listener
  count += step
  patch(elem, render())
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.appendChild(root)
  patch(root, render())
})
```