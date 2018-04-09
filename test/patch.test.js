//const { diff, patch } = amberdom;


describe('Patch Module', () => {
  describe('#patch', () => {
    it('Patch text', () => {
      const v1 = h('div', 'hello world');
      const v2 = h('div', 'this is another text');
      
      let patches = diff(v1, v2);
      let v1Elem = v1.render();
      patch(v1Elem, patches);
      
      expect(v1Elem.textContent || v1Elem.nodeValue).to.be('this is another text');
      v1Elem = null;
    });

    it('Patch list', () => {
      const v1 = h('ul',
        h('li', 'Hala'),
        h('li', 'Halo')
      );

      const v2 = h('ul',
        h('li', 'another stuff'),
        h('li', 'yet another stuff')
      );

      let patches = diff(v1, v2);
      let v1Elem = v1.render();
      patch(v1Elem, patches);

      expect(v1Elem.childNodes[0].textContent).to.be('another stuff');
      expect(v1Elem.childNodes[1].textContent).to.be('yet another stuff');
    });

    it('Patch props', () => {
      const v1 = h('div', {
        className: ['content', 'main'],
        style: {
          'color': 'red'
        }
      });

      const v2 = h('div', {
        className: ['main'],
        style: {
          'color': 'black'
        }
      });


      let patches = diff(v1, v2);
      let v1Elem = v1.render();
      console.log(v1Elem);
      patch(v1Elem, patches);

      expect(v1Elem.getAttribute('class')).to.be('main');
      expect(v1Elem.style.color).to.be('black')
    });
  });
});