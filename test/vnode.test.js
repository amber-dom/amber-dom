describe('VNode', () => {
  describe('#constructor', () => {

    it('`className` as a string', () => {
      const div = new VNode('div', {
        id: 'app',
        className: 'content main'
      }, []);
    
      expect(div.props.className).to.be('content main');
      expect(div.props.id).to.be('app');
    });

    it('`style` as a string', () => {
      const div = new VNode('div', {
        style: 'display: block; color: red; '
      }, []);

      const divElem = div.render()
      expect(divElem.style.color).to.be('red');
      expect(divElem.style.display).to.be('block');
    });

    it('`style` as an object will not work', () => {
      const div = new VNode('div', {
        style: {
          color: 'red'
        }
      }, []);

      const divElem = div.render();
      
    })

    it('`children` must be specified even if its empty', () => {
      var happened = false;

      try {
        const somethingBad = new VNode('div', {});
        // because it you don't, an error will be raised on
        // rendering.
        somethingBad.render();
      } catch(e) {
        happened = true;
      }

      expect(happened).to.be(true);
    })

    it('Nested structure should work fine.', () => {
      const div = new VNode('div', {},
        [
          new VNode('h1', {}, 
            [
              'Hello ',
              new VNode('span', {}, 
                [
                  'world!'
                ])
            ])
        ]);

      expect(div.count).to.be(4);
      expect(div.children[0].tagName).to.be('h1');
      expect(div.children[0].children[0]).to.be('Hello ');
      expect(div.children[0].children[1].tagName).to.be('span');
      expect(div.children[0].children[1].children[0]).to.be('world!');
    });
  });

  describe('#render', () => {
    it('simple case', () => {
      const div = new VNode('h1', { style: "color: red;" }, ['Hello world!']);

      var divElem = div.render();
      expect(divElem.style.color).to.be('red')
    })
  })
})