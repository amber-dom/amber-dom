import h from '../h/index';
import { isArray, eventHookRe } from '../util';
export default VNode;


class VNode {
  /**
   * @param {String} tagName a tag name. Must be specified.
   * @param {Object} props can be an empty object.
   * @param {Array} children can be an empty array.
   */
  constructor(tagName, props, children) {
    this.tagName = tagName;
    this.props = props;
    this.children = children;
    this.key = props.key || void 0;
    this.cleanups = []; // for cleaning up event listeners.
    this.count = children.reduce((acc, child) => {
      if (child instanceof VNode)
        return child.count + acc + 1;
      else
        return acc + 1;
    }, 0);

    delete props.key; // no key will be needed anymore.
  }

  /**
   * render a real DOM tree for this VTree rooted at this VNode.
   */
  render() {
    const element = !(/(SVG|svg)/.test(this.tagName))
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
          // FIXME: might be a better way of handling this.
          try {
            const handler = typeof props[propName] === 'function'
              ? props[propName]
              : new Function(`(${props[propName]})(...arguments);`);
            
            // store it for later detachment, to avoid memory
            // leaking.
            this.cleanups.push({
              evName: _events[1],
              handler: handler
            });
            // avoid bubbling.
            element.addEventListener(_events[1], handler, false);
          } catch(e) {
            console.log(
              `Warning: listener for event '${_event[1]}' isn't working.
              If you're specifying this handler in string, please specify a function.`);
          }
        }
        
        else if (propName === 'className') {
          element.setAttribute('class', props[propName])
        }

        else {
          element.setAttribute(propName, props[propName]);
        }
      }
    }

    this.children.forEach(child => {
      var childElement;

      // It is a Text node.
      if (typeof child === 'string') {
        
        childElement = document.createTextNode(child);  
      }
      // It is a VNode or custom node.
      else if (child instanceof VNode ||
        (child.render && typeof child.render === 'function')
      ) {
        childElement = child.render();
      }

      else {
        throw new Error('Custom-defined node must provide a `render` method.');
      }
      element.appendChild(childElement);
    });

    this.$el = element;
    return element;
  }

  detachEventListeners() {
    this.cleanups.forEach(event => {
      this.$el.removeEventListener(event.evName, event.handler);
    });
  }
}