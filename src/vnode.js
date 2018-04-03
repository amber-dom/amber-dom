import h from './h';
import { isArray } from './util';
export default VNode;

const eventHookRe = /^ev\-([a-z]+)/;

class VNode {
  /**
   * @param {String} tagName 
   * @param {Object} props 
   * @param {Array} children 
   */
  constructor(tagName, props, children) {
    this.tagName = tagName;
    this.props = props;
    this.children = isArray(children) ? children : [children];
    this.key = props.key || void 0;
    this.count = children.length;

    delete props.key; // no key will be needed anymore.
  }

  /**
   * 
   */
  render() {
    const element = !this.tagName.test(/(SVG)|(svg)/)
      ? document.createElement(this.tagName)
      : document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

    const props = this.props;
    const self = this;

    for (const propName in props) {
      if (props.hasOwnProperty(propName)) {
        const _events = propName.match(eventHookRe);
        if (_events) {
          try {
            const handler = typeof props[propName] === 'function'
              ? props[propName]
              : new Function(`(${props[propName]})(...arguments);`);

            element.addEventListener(_events[1], handler);
          } catch(e) {
            console.log(
              `Warning: handler for event '${_event[1]}' isn't working.
              If you're specifying props in string, consider using object notation.`);
          }
        }
        // handle class.
        else if (propName === 'className') {
          element.classList.add(...props[propName]);
        }
        
        else {
          element.setAttribute(propName, props[propName]);
        }
      }
    }

    this.children.forEach(child => {
      var childElement;

      if (typeof child === 'string') {
        
        childElement = document.createTextNode(child);  
      }
      // It is a VNode.
      else if (child instanceof VNode) {
        childElement = child.render();
      }
      // It is a custom-defined node.
      else {
        var _render = child.render || void 0;

        // It is defined as a class.
        if (typeof _render === 'function') {
          _render.bind(child);
          childElement = _render()
        }
        // defined as a function.
        else {
          childElement = child.render();
        }
      }
      element.appendChild(childElement);
    });
  }
}