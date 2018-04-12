(function() {
const { h, VNode } = amberdom;

describe('h Module', () => {
  describe('#h', () => {
    it('`className` as an array', () => {
      const div = h('div', {
        id: 'app',
        // className 
        className: ['content', 'main']
      });

      const divElem = div.render();

      expect(divElem.tagName).to.be('DIV');
      expect(divElem.className).to.be('content main');
      expect(divElem.id).to.be('app');
    });

    it('`className` as a string', () => {
      const div = h('div', {
        id: 'app',
        className: 'content main'
      });
    
      const divElem = div.render();
      expect(div.props.className).to.be('content main');
      expect(div.props.id).to.be('app');
    });

    it('`style` as an object', () => {
      const div = h('div', {
        style: {
          color: 'red',
          display: 'block'
        }
      });

      const divElem = div.render();
      expect(divElem.style.color).to.be('red');
      expect(divElem.style.display).to.be('block');
    });

    it('h("div") is fine.', () => {
      const div = h('div');

      expect(div.children).to.eql([]);
    });

    it('h("div", "Hello") is fine', () => {
      const div = h("div", "Hello");
      const divElem = div.render();

      expect(divElem.textContent).to.be("Hello");
    });

    it('Multiple children', () => {
      const div = h("div", { style: { color: 'red' } }, h(
        "span", {}, "Hello"), "world");

      const divElem = div.render();
      expect(divElem.style.color).to.be('red');
      expect(divElem.children[0].tagName).to.be('SPAN');
      expect(divElem.children[0].textContent).to.be('Hello');
    });

    it('Multiple text children', () => {
      const div = h("div", "hello", " world");
      const divElem = div.render();

      expect(divElem.textContent).to.be("hello world");
    });

    it('Add event listeners.', () => {
      let wasClicked = false;

      function handleClick(ev) {
        wasClicked = true;
        button.detachEventListeners();
      }
      
      const button = h("button", {
        'ev-click': handleClick,
        style: {
          'background-color': '#fec'
        }
      }, "Click Me");
      const buttonElem = button.render();
      const event = new Event('click');

      buttonElem.dispatchEvent(event);
      expect(wasClicked).to.be(true);
    });

    it('Detach event listeners.', () => {
      let on = false;

      function onceOnYouCannotToggleItOff() {
        on = !on;
        button.detachEventListeners();
      }

      const button = h("button", {
        'ev-click': onceOnYouCannotToggleItOff
      }, "Click Me");
    
      const buttonElem = button.render();
      const event = new Event('click');
      buttonElem.dispatchEvent(event);
      expect(on).to.be(true);

      let i = 2;
      while(i--)
        buttonElem.dispatchEvent(event);
        expect(on).to.be(true);
    });

    it('Custom-defined stateless node without props.', () => {
      function Block(header, body, footer) {
        return (
          h('div#block-wrapper.box',
            h('div.header', header),
            h('div.content', body),
            h('div.footer', footer)
          ));
      }

      const block = h(Block, 'Title', 'Article1', 'Footer');
      const blockElem = block.render();

      // root
      expect(blockElem.tagName).to.be('DIV');
      expect(blockElem.id).to.be('block-wrapper');
      expect(blockElem.className).to.be(' box');

      // child 1
      expect(blockElem.childNodes[0].tagName).to.be('DIV');
      expect(blockElem.childNodes[0].className).to.be(' header');
      expect(blockElem.childNodes[0].textContent).to.be('Title');

      expect(blockElem.childNodes[1].tagName).to.be('DIV');
      expect(blockElem.childNodes[1].className).to.be(' content');
      expect(blockElem.childNodes[1].textContent).to.be('Article1');
      
      expect(blockElem.childNodes[2].tagName).to.be('DIV');
      expect(blockElem.childNodes[2].className).to.be(' footer');
      expect(blockElem.childNodes[2].textContent).to.be('Footer');
    });

    it('Cutom-defined node with state', () => {
      class Block extends VNode {
        constructor(header, body, footer) {
          super();
          this.header = header;
          this.body = body;
          this.footer = footer;

          this.vtree = this.initVTree();
        }

        // You may write some logic here to watch state.

        initVTree() {
          return (
            h('div#block-wrapper.box',
              h('div.header', this.header),
              h('div.content', this.body),
              h('div.footer', this.footer)
            ));
        }

        render() {
          return this.vtree.render();
        }
      }

      const block = h(Block, 'Title', 'Article1', 'Footer');
      const blockElem = block.render();

      // root
      expect(blockElem.tagName).to.be('DIV');
      expect(blockElem.id).to.be('block-wrapper');
      expect(blockElem.className).to.be(' box');

      // child 1
      expect(blockElem.childNodes[0].tagName).to.be('DIV');
      expect(blockElem.childNodes[0].className).to.be(' header');
      expect(blockElem.childNodes[0].textContent).to.be('Title');

      expect(blockElem.childNodes[1].tagName).to.be('DIV');
      expect(blockElem.childNodes[1].className).to.be(' content');
      expect(blockElem.childNodes[1].textContent).to.be('Article1');
      
      expect(blockElem.childNodes[2].tagName).to.be('DIV');
      expect(blockElem.childNodes[2].className).to.be(' footer');
      expect(blockElem.childNodes[2].textContent).to.be('Footer');
    });
  })
});
})()