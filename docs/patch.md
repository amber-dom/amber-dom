## amber-dom/patch

Patch module. Patch a real dom tree.

### patch(dTree, patches)

The patch algorithm is simpler than diff. It visits the **real dom tree** which corresponds to an **old VTree** in DFS walk, then apply patches for each real dom node.

#### dTree

Type: `HTMLelement`

A **real dom tree** rendered by the old VTree. A VTree is said to be `old` once it is rendered and another VTree is generated.

#### patches

Type: `Object`

An object holding all patches to apply to `dTree`. For more explainations, see [docs/diff](./diff.md).

## Example

```js
import { h, diff, patch } from 'amber-dom'

const vtree1 = h('div', 'Some text')    // Create a virtual dom tree
const dtree  = vtree1.render()          // render it to real dom tree

setTimeout(() => {                      // after a second
  const vtree2 = h('div', 'Some other text')    // Create a new virtual dom tree
  const patches = diff(vtree1, vtree2)  // diff

  patch(dtree, patches)                 // patch to real dom tree
}, 1000)
```
