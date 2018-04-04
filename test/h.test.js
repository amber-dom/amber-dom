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
        "span", {}, "Hello"
      ), "world");

      const divElem = div.render();
      expect(divElem.style.color).to.be('red');
      expect(divElem.children[0].tagName).to.be('SPAN');
      expect(divElem.children[0].textContent).to.be('Hello');
    });

    it('Multiple children case 2', () => {
      const div = h("div", "hello", " world");
      const divElem = div.render();

      expect(divElem.textContent).to.be("hello world");
    })
  })
});