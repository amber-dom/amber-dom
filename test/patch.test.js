describe('Patch Module', () => {
  describe('#patch', () => {
    it('TEXT', () => {
      const v1 = h('div', 'hello world');
      const v2 = h('div', 'this is another text');
      
      let patches = diff(v1, v2);
      let v1Elem = v1.render();
      patch(v1Elem, patches);
      
      expect(v1Elem.textContent || v1Elem.nodeValue).to.equal('this is another text');
      v1Elem = null;
    });

    it('REORDER, list without keys', () => {
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

      expect(v1Elem.childNodes[0].textContent).to.equal('another stuff');
      expect(v1Elem.childNodes[1].textContent).to.equal('yet another stuff');
    });

    it('REORDER, list with keys', () => {
      const v1 = h('ul',
        h('li', { key: 'Halo' }, 'Halo'),
        h('li', { key: 'Hala' }, 'Hala'),
        );

      const v2 = h('ul',
        h('li', { key: 'Hala' }, 'another stuff'),
        h('li', 'yet another stuff')
      );

      let patches = diff(v1, v2);
      let v1Elem = v1.render();
      patch(v1Elem, patches);

      expect(v1Elem.childNodes[0].textContent).to.equal('another stuff');
      expect(v1Elem.childNodes[1].textContent).to.equal('yet another stuff');
    });

    it('PROPS', () => {
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
      patch(v1Elem, patches);

      expect(v1Elem.getAttribute('class')).to.equal('main');
      expect(v1Elem.style.color).to.equal('black')
    });

    it('PROPS 2', () => {
      const v1 = h('div#app.main.content', 'This is a content');
      const v2 = h('div#app2.content', 'This is another content');


      let patches = diff(v1, v2);
      let v1Elem = v1.render();
      patch(v1Elem, patches);

      expect(v1Elem.getAttribute('class')).to.equal(' content');
      expect(v1Elem.textContent).to.equal('This is another content');
    });

    it('PROPS, when event handler changes, the previously handler will be detached.', () => {
      let message = [];

      function handler1() { message.push('handler1 was invoked.'); }
      function handler2() { message.push('handler2 was invoked.'); }

      const butt1 = h('button', {
        'ev-click': handler1
      }, 'Click me');

      const butt2 = h('button', {
        'ev-click': handler2
      }, 'Click me');

      let patches = diff(butt1, butt2);
      let butt1Elem = butt1.render();
      let clickEvent = new Event('click');
      patch(butt1Elem, patches);

      // handler1 will not be invoked.
      butt1Elem.dispatchEvent(clickEvent);
      expect(message).to.deep.equal(['handler2 was invoked.']);
    });

    it('REPLACE', () => {
      const v1 = h('div', h('h1', 'Heading 1'), h('h2', 'Heading 2'));
      const v2 = h('div', h('div', 'Heading 1'), h('div', 'Heading 2'));
      let patches = diff(v1, v2);
      let v1Elem = v1.render();
      patch(v1Elem, patches);

      expect(v1Elem.childNodes[0].tagName).to.equal('DIV');
      expect(v1Elem.childNodes[0].textContent).to.equal('Heading 1');
      expect(v1Elem.childNodes[1].tagName).to.equal('DIV');
      expect(v1Elem.childNodes[1].textContent).to.equal('Heading 2');
    });

    it('REPLACE a pretty deep node', () => {
      const v1 = h('div', h('div', h('span', 'deep')), h('div', h('span', 'node')))
      const v2 = h('div', h('p', h('span', 'deep')), h('p', h('span', 'node')))

      let patches = diff(v1, v2)
      let v1Elem = v1.render();
      patch(v1Elem, patches);

      expect(v1Elem.childNodes[0].tagName).to.equal('P');
      expect(v1Elem.childNodes[1].tagName).to.equal('P');
    });
  });
});
