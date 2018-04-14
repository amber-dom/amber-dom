## amber-dom/VNode

VNode is pretty simple. It provides a `.render()` method for you to render a vnode into a DOM node.

In common cases, instead of using `VNode` constructor directly, you should use `h` function to create a vnode/vtree. `VNode` is less flexible than `h` function.

### VNode(tagName, props, children)

Every parameter is optional.

#### tagName(optional)

Type: `String`

- A tag name can be a string only.
- If no tagName is provided, the `.render()` method will not work. 
- If you pass in a tag name attached by some selectors, it will not work.

#### props(optional)

Type: `Object`

- **className** can be a string only. Array will not work.
- **style** can be a string only. Object will not work.

#### children(optional)

Type: `Array`

children must be placed in an array, otherwise it will not work.

### VNode.render()

Render itself to be a DOM node. svg will work.

## Note

To extend this VNode constructor, I suggest you read the [source code](../src/vnode/index.js).