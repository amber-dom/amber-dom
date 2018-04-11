## amber-dom/diff

Diff module. Diffs 2 virtual trees in O(n) time. It is a matter of fact that everyone knows.

### diff(oldVTree, newVTree)

Diffs `newVTree` against `oldVTree`, and returns an object holding all patches to apply.

#### oldVTree

Type: `VNode|String`

An old virtual dom tree.

A VTree is represented by a `VNode` which is the root of that VTree. If `oldTree` is a text node, then it is a string.

#### newVTree

Type: `VNode|String`

An new virtual dom tree.

#### returns

Type: `Object`

When performing a DFS walk on `oldVTree`, each `VNode` will be visited in a specific order, such that we can label a unique index for each `VNode` of `oldVTree`.

During the process of DFS walk, compare `oldVTree` with `newVTree`, record a `patch` for a `VNode` if there is a difference.

The returned object of `diff` is a hash with key equals the index of a `VNode` of `oldVTree`, and value equals an **array of patch** for that `VNode`.

To understand `diff` algorithm, I suggest you read the source code of [`diff`](../src/diff/index.js) & [`list-diff`](../src/diff/list-diff.js).

## Example

The example below draws the shape of each type of patch. 

```js
import { h, diff } from 'amber-dom'

const div = h('div')
const p = h('p')

let patches = diff(div, p)  //=> { 0: [{ type: 'REPLACE', node: p }] }

const div2 = h('div', { className: 'main' })
const div3 = h('div', { className: 'subcontent' })

patches = diff(div2, div3)
/*=>
{
    0: [
        {
            type: 'PROPS', props: { className: 'subcontent' } 
        }
    ]
}*/

const p1 = h('p', 'Text 1')
const p2 = h('p', 'Text 2')

patches = diff(p1, p2)
/*
{
    0: [
        {
            type: 'TEXT', text: 'Text 2'
        }
    ]
}
*/

const ul1 = h('ul', h('li', { key: 'li1' }, 'item 1'), h('li', { key: 'li2' }, 'item 2'))
const ul2 = h('ul', h('li', { key: 'li1' }, 'item 1'))

patches = diff(ul1, ul2)
/*
{
    0: [
        {
            type: 'REORDER',
            moves: [
                {
                    type: 'REMOVE',
                    index: 1
                }
            ]
        }
    ]
}
*/
```

