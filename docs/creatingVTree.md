## Create a VTree using `amberdom.h`

`amberdom` provides an `h` function to create virtual dom trees, which is an instance of `VNode`:

### `h(selector, props, ...children)`

Here's an example:

```js
var vtree = amberdom.h('a', { href: 'https://www.npmjs.com/package/amber-dom' }, 'amberdom');
```
One thing to note is, unlike [hyperscript](https://github.com/hyperhype/hyperscript), `props` must be placed as the 2nd parameter, if you provide one.

#### selector

Type: `String|Function`

If it is a string, it can be a tag name followed by CSS selectors. For example,

```js
import { h } from 'amber-dom'

var vtree = h('div#app.content.main') // => <div id="app" class="content main"></div>
```

However if multiple ids occur, the last one will be the id attribute of the rendered DOM node. For example, `h('div#one#two')` will create a vnode that will render a DOM node with 'two' as its id attribute value.

If `selector` is a function, then this function is considered to be a **custom-defined vnode**. `h` function will call the `selector` function with a `new` operator, and pass the rest of the parameters to it. That means you can write your **custon-defined vnode** in 2 ways:

* **Pure function** — like a virtual tree generator.
* **Class Constructor** — it is usually a class extended `VNode`. See [docs/VNode](VNode.md) for more.

Example for pure function:

```js
import { h } from 'amber-dom'


function Block(header, body, footer) {
  return (
    h('div#block-wrapper.box',
      h('div.header', header),
      h('div.content', body),
      h('div.footer', footer)
    ))
}

const tree = h(Block, 'Title', 'Article1', 'Footer')  // the same for 
                                                      // Block('Title', 'Article1', 'Footer').
const rootNode = tree.render()
```

The reason for this(`selector` as a function), is to stay compatible with [react-jsx](http://facebook.github.io/jsx/).

**WARNING**

If there's a newline between your return statement and your outermost h function, rememeber to add parentheses. Otherwise it wouldn't work because JavaScript engine will treat it as you return `undefined`:

```js
function DontDoThis() {
  return
    h('div', 'Completely wrong!')
}
```


#### props(optional)

Type: `Object`

It is optional. You can specify element attributes in this object. For example:

```js
import { h } from 'amber-dom'


const tree = h('div.body-content', {
  'data-main': 'something',       // quote the key because it contains '-'.
   className: 'content main',     // class for element.
})
```

If you don't want to specify any props on your vnode, you can either ignore/omit it or pass in a `null|undefined`:

```js
h('div', 'content') // ok
h('div', null, 'content') // ok
```

Here are some special props:

- **events**
    Specify an event hook using `ev-*`:

```js
const tree = h('button', {
  'ev-click': function handleClick() { console.log('clicked!') }
}, 'Click me!')
```
When a DOM node is replaced by `amberdom.patch`, the attached event listeners will be detached by `amberdom` automatically, freeing your concerns about memory leaking.

**WARNING**

There's one special case you might want to pay attention to. Assume you have an old virtual tree, say A, and it rendered a DOM tree & appended the DOM tree to `document`. At this time you generate another virtual tree, say B, which has the identical shape with A. Both tree A & B have listeners(handlers) listen to the same event on the same node, but listeners(handlers) are different. If you're diffing A against B, that is `diff(A, B)`, and patch the DOM tree rendered by A, then A's listeners will be detached.

- **styles**
    Specify inline-style using either a object literal or a string:

```js
// object literal
const tree = h('div', {
  style: {
    color: 'red'
  }
}, "I'm red!")

// string
const tree2 = h('div', {
  style: 'color: black;'
}, "I'm black!")
```

- **class**
    An element's class can be set up using `className` prop. It is either an array or a string:

```js
// array
var vtree1 = amberdom.h('div', {
  className: ['main', 'content']
})

// string. Recomanded.
var vtree2 = amberdom.h('div', {
  className: 'main content'
})
```

#### children(optional)

Type: `VNode|String`

A vnode can have any number of children. There is no `VText` in `amberdom`. Thus if a child is a text node, simply provide a string.

Example:

```js
var content = 'Some hola'

var vtree1 = h('div#app', 
  h('h1', h('span', 'Hello'), ' world!'),
  h('div', content)
)
```

## Create a VTree using `jsx`

`amber-dom` provides an `h` function that's compatible with transformed `react-jsx`. You consider it either good or bad.

Make sure you've installed `babel-plugin-transform-react-jsx` & set up `.babelrc` properly:

```json
// .babelrc
{
  "presets": [
      "env"
  ],
  "plugins": [
    ["transform-react-jsx", {
    "pragma": "h"
    }]
  ]
}
```

Then you'll be able to write a stateless **component** like you do in `React.js`:

```js
function Hello(props) {
  return (
    <div id="app" className="content main">
      <h1><span>Hello </span>{props.message}!</h1>
    </div>
  );
}

const elem = <Hello massage='Allen' />
const rootNode = vElem.render()   // render to a real dom element.

document.body.appendChild(elem)
```

For more infomation about how babel transforms jsx, try [babel repl](http://babeljs.io/repl/).

## Rendering a virtual tree to DOM tree

A `VNode` instance can call `.render()` function to render a DOM tree. Basic vnodes can be created by calling `h` function.

Sometimes, you might want to store some state inside a customed-defined vnode.

In rare cases, you might want to overwrite `VNode.render()`. In common cases, you will use composition rather than inheritance.

```js
class Container extends VNode {
  constructor(childVNodes) {
    super()
    this.children = childVNodes
  }

  render() {
    return h('div#wrapper.content', this.children).render()
  }
}
```

For more info about `VNode`, read [docs/VNode](VNode.md).