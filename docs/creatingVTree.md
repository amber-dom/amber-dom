## Create a VTree using `amberdom.h`

`amberdom` provides an `h` function to create virtual dom trees, which is an instance of `VNode`:

### `h(tagName, props, ...children)`

Here's an example:

```js
var vtree = amberdom.h('a', { href: 'https://www.npmjs.com/package/amber-dom' }, 'amberdom');
```
One thing to note is, unlike [hyperscript](https://github.com/hyperhype/hyperscript), `props` must be placed as the 2nd parameter, if you provide one.

#### tagName

Type: `String|Function`

If it is a string, it can be a tag name followed by selectors. For example,

```js
var vtree = amberdom.h('div#app.content.main') // => <div id="app" class="content main"></div>
```

If it is a function, it should return an instance of `VNode`(an object returned by `h` function):

```js
// Notice the first param to any custom-defined node
// is `props`. You'll see later in this article.
function Hello(props, message) {
  return amberdom.h('h1', props, 'Hello ', message)
}

var vtree = amberdom.h(Hello, 'Allen')
var dtree = vtree.render()  // => <h1>Hello Allen</h1>
document.body.appendChild(dtree)
```

#### props(optional)

Type: `Object`

It is optional. You can specify element attributes in this object. For example:

```js
var vtree = amberdom.h('div.body-content', {
  'data-main': 'something',       // quote the key because it contains '-'.
   className: 'content main',     // class for element.
})
```

Here are some special props:

- **events**
    Specify an event hook using `ev-*`:

```js
var vtree = amberdom.h('button', {
  'ev-click': function handleClick() { console.log('clicked!') }
}, 'Click me!')
```
When the element is replaced by `amberdom.patch`, event listeners will be detached by `amberdom` automatically, such that you don't have to worry about memory leaking.

- **styles**
    Specify inline-style using either a object literal or a string:

```js
// object literal
var vtree = amberdom.h('div', {
  style: {
    color: 'red'
  }
}, 'I\'m red!')

// string
var vtree2 = amberdom.h('div', {
  style: 'color: black;'
}, 'I\'m black!')
```

- **class**
    An element's class can be set up using `className` prop. It is either an array or a string:

```js
// array
var vtree1 = amberdom.h('div', {
  className: ['main', 'content']
})

// string
var vtree2 = amberdom.h('div', {
  className: 'main content'
})
```

#### children

Type: `VNode|String`

A virtual dom element can have any number of children. There is no `VText` in `amberdom`. Thus if a child is a text node, simply provide a string.

Example:

```js
var content = 'Some hola'

var vtree1 = amberdom.h('div#app', 
  h('h1', h('span', 'Hello'), ' world!'),
  h('div', content)
)
```

## Create a VTree using `jsx`

`amber-dom` provides an `h` function that's compliant with transformed `react-jsx`(personally, I think that using `h` function directly will be more flexible).

Make sure you've install `babel-plugin-transform-react-jsx` & set up `.babelrc` properly:

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

const vElem = <Hello massage='Allen' />
const elem = vElem.render()   // render to a real dom element.

document.body.appendChild(elem)
```

And babel will transform it into:

```js
function Hello(props) {
  return h(
    "div",
    { id: "app", className: "content main" },
    h(
      "h1",
      null,
      h(
        "span",
        null,
        "Hello "
      ),
      props.message,
      "!"
    )
  );
}

var vElem = h(Hello, { massage: "Allen" });
var elem = vElem.render();

document.body.appendChild(elem);
```

## Rendering a VTree to a real dom tree

As you've seen on above examples, a `VNode` instance can call `render()` method to render itself to a real dom tree. It is also possible to overwrite the default behavior of `render()` by extending `VNode`:


```js
import { VNode } from 'amber-dom'

class Component extends VNode {
  // might set up internal states.
  constructor() {
    super(arguments)
  }

  // overwrite render with what every you want.
  render() {
    ...
  }
}
```