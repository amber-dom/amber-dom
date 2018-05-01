# Release Notes


## v1.0.0

After reading through some related projects and some thinking, the underlying algorithm and public APIs were changed:

* Instead of separating the diffing and patching processes, apply patching while diffing.

* The `VNode` class contains only a constructor now. The `.render()` method was stripped because it seems to cause semantic confusions, and biases towards OOP. Instead, a new API `createElement` is provided.

* The `h` function can handle **nested children** now. Meanwhile, if multiple strings are passed as children, they will be concat as a single string. This might seem aggressive, though. Last thing to mention about `h` function is, **SVG** now works.

* Hooks are added, to let users take more control of patching process.

* Changed the children reordering(children reconciliation/list diffing) algorithm. When patching children, start from both ways.

* Instead of patching 2 vtrees, **patch directly against the DOM tree**. This change not only frees users from managing 2 in-memory vtrees, but also reduces memory usage. This is a significant improvement, because it means now you can patch any existing DOM tree with a vtree, even if the DOM tree wasn't created by `amber-dom/createElement`.

* Modularized. It is now able to init `patch` & `createElement` with different modules.


# v1.0.0

## v0.0.8

Provides `h`, `diff`, `patch`, and `VNode` interface.
`h` function returns an instance of VNode, which has a `.render()` method that can render itself to a DOM node.
The `diff` function diffs two vtrees in a **DFS** order, and returns an object describing the patches to apply to the DOM tree represented by the "old" vtree. Then invoke `patch` function with that DOM tree and that patch object as arguments.

# v0.0.8 Release notes begin

