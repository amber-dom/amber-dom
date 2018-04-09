const { diff, patch } = amberdom;

describe('diff', () => {
  describe('#diff', () => {
    it('TEXT', () => {
      const v1 = h('div', 'Hello world!');
      const v2 = h("div", 'Hi');
      let patches = diff(v1, v2);
      
      expect(patches).to.eql({
        1: [{ type: 'TEXT', text: 'Hi' }]
      });
    });

    it('REPLACE', () => {
      const v1 = h('div');
      const v2 = h('h1');
      let patches = diff(v1, v2);

      expect(patches).to.eql({
        0: [{ type: 'REPLACE', node: h("h1") }]
      });
    });

    it('REPLACE 2', () => {
      const v1 = h('div', h('h1', 'Heading 1'), h('h2', 'Heading 2'));
      const v2 = h('div', h('div', 'Heading 1'), h('div', 'Heading 2'));
      let patches = diff(v1, v2);

      expect(patches).to.eql({
        1: [
          { type: 'REPLACE', node: h('div', 'Heading 1') }
        ],
        3: [
          { type: 'REPLACE', node: h('div', 'Heading 2') }
        ]
      })
    })

    it('REORDER with keys, will re-use elements with the same keys', () => {
      const v1 = h('ul', 
        h('li', { key: 'holla' }, 'Hola'),
        h('li', { key: 'hey' }, 'hey'));

      const v2 = h('ul',
        h('li', { key: 'hey' }, 'hey'),
        h('li', { key: 'another one' }, 'Hi'));

      let patches = diff(v1, v2);

      expect(patches).to.eql({
        0: [{
          type: 'REORDER',
          moves: [
            { type: 'MOVE', from: 1, to: 0 },
            { type: 'INSERT', index: 1, item: h('li', { key: 'another one' }, 'Hi') },
            { type: 'REMOVE', index: 2 }
          ]
        }]
      });
    });

    it('REORDER without keys, will remove accessary nodes of oldList, or insert new nodes to oldList', () => {
      const v1 = h('ul', 
        h('li', 'Hola'),
        h('li', 'hey'));

      const v2 = h('ul',
        h('li', 'hey'),
        h('li', 'Hi'));

      const v3 = h('ul',
        h('li','hey'),
        h('li', 'Hi'),
        h('li', 'shshsh'));

      let patches = diff(v1, v2);
      // should be non.
      expect(patches[0]).to.eql(void 0);
      patches = diff(v1, v3);
      expect(patches[0]).to.eql([{
        type: 'REORDER',
        moves: [
          { type: 'INSERT', index: 2, item: h('li', 'shshsh') }
        ]
      }]);

      patches = diff(v3, v2);
      expect(patches[0]).to.eql([
        {
          type: 'REORDER',
          moves: [
            { type: 'REMOVE', index: 2, item: null }
          ]
        }
      ])
    });

    it('REORDER & REPLACE', () => {
      const v1 = h('div', h('span', 'hello'), ' world');
      const v2 = h('div', 'hello world');
      let patches = diff(v1, v2);

      expect(patches).to.eql({
        // remove child 'span'
        0: [{ type: 'REORDER', moves: [{ type: 'REMOVE', index: 1, item: null }] }],
        // replace ' world' with 'hello world'.
        1: [{ type: 'REPLACE', node: 'hello world' }]
      });
    });

    it('PROPS', () => {
      const v1 = h('div', { 'data-main': 'something' });
      const v2 = h('div', { 'data-main': 'else' });

      let patches = diff(v1, v2);
      expect(patches).to.eql({
        0: [{ type: 'PROPS', props: { 'data-main': 'else' } }]
      });
    });

    it('RPOPS ex2', () => {
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
      expect(patches).to.eql({
        0: [
          {
            type: 'PROPS', props: {
              className: 'main',
              style: 'color: black; '
            }
          }
        ]
      })
    })
  })
})