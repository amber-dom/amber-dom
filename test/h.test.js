const { h } = amberdom;

describe('h-module', () => {
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

    it('Event listeners. Expand this item to see how I\'ve tested it.', () => {
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

    it('Detaching event listeners. Expand this item to see how I\'ve tested it.', () => {
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
  })
});