describe('h Module', () => {
  describe('#h', () => {
    it('`className` as an array', () => {
      const div = h('div', {
        id: 'app',
        // className 
        className: ['content', 'main']
      });

      const divElem = div.render();

      expect(divElem.tagName).to.equal('DIV');
      expect(divElem.className).to.equal('content main');
      expect(divElem.id).to.equal('app');
    });

    it('`className` as a string', () => {
      const div = h('div', {
        id: 'app',
        className: 'content main'
      });
    
      const divElem = div.render();
      expect(div.props.className).to.equal('content main');
      expect(div.props.id).to.equal('app');
    });

    it('`style` as an object', () => {
      const div = h('div', {
        style: {
          color: 'red',
          display: 'block'
        }
      });

      const divElem = div.render();
      expect(divElem.style.color).to.equal('red');
      expect(divElem.style.display).to.equal('block');
    });

    it('h("div") is fine.', () => {
      const div = h('div');

      expect(div.children).to.deep.equal([]);
    });

    it('h("div", "Hello") is fine', () => {
      const div = h("div", "Hello");
      const divElem = div.render();

      expect(divElem.textContent).to.equal("Hello");
    });

    it('Multiple children', () => {
      const div = h("div", { style: { color: 'red' } }, h(
        "span", {}, "Hello"), "world");

      const divElem = div.render();
      expect(divElem.style.color).to.equal('red');
      expect(divElem.children[0].tagName).to.equal('SPAN');
      expect(divElem.children[0].textContent).to.equal('Hello');
    });

    it('Multiple text children', () => {
      const div = h("div", "hello", " world");
      const divElem = div.render();

      expect(divElem.textContent).to.equal("hello world");
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
      expect(wasClicked).to.equal(true);
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
      expect(on).to.equal(true);

      let i = 2;
      while(i--)
        buttonElem.dispatchEvent(event);
        expect(on).to.equal(true);
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
      expect(blockElem.tagName).to.equal('DIV');
      expect(blockElem.id).to.equal('block-wrapper');
      expect(blockElem.className).to.equal(' box');

      // child 1
      expect(blockElem.childNodes[0].tagName).to.equal('DIV');
      expect(blockElem.childNodes[0].className).to.equal(' header');
      expect(blockElem.childNodes[0].textContent).to.equal('Title');

      expect(blockElem.childNodes[1].tagName).to.equal('DIV');
      expect(blockElem.childNodes[1].className).to.equal(' content');
      expect(blockElem.childNodes[1].textContent).to.equal('Article1');
      
      expect(blockElem.childNodes[2].tagName).to.equal('DIV');
      expect(blockElem.childNodes[2].className).to.equal(' footer');
      expect(blockElem.childNodes[2].textContent).to.equal('Footer');
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
      expect(blockElem.tagName).to.equal('DIV');
      expect(blockElem.id).to.equal('block-wrapper');
      expect(blockElem.className).to.equal(' box');

      // child 1
      expect(blockElem.childNodes[0].tagName).to.equal('DIV');
      expect(blockElem.childNodes[0].className).to.equal(' header');
      expect(blockElem.childNodes[0].textContent).to.equal('Title');

      expect(blockElem.childNodes[1].tagName).to.equal('DIV');
      expect(blockElem.childNodes[1].className).to.equal(' content');
      expect(blockElem.childNodes[1].textContent).to.equal('Article1');
      
      expect(blockElem.childNodes[2].tagName).to.equal('DIV');
      expect(blockElem.childNodes[2].className).to.equal(' footer');
      expect(blockElem.childNodes[2].textContent).to.equal('Footer');
    });
  })
});
