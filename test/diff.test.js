const { diff, patch } = amberdom;

describe('diff', () => {
  describe('#diff', () => {
    it('TEXT type', () => {
      const v1 = h('div', 'Hello world!');
      const v2 = h("div", 'Hi');
      let domTree = v1.render();
      let patches = diff(v1, v2);
      
      expect(patches).to.eql({
        1: [{ type: 'TEXT', text: 'Hi' }]
      });
    });

    it('REPLACE type', () => {
      const v1 = h('div');
      const v2 = h('h1');
      let patches = diff(v1, v2);

      expect(patches).to.eql({
        0: [{ type: 'REPLACE', node: h("h1") }]
      });
    });

    it('REPLACE type, ex2', () => {
      const v1 = h('div', h('span', 'hello'), ' world');
      const v2 = h('div', 'hello world');

      let patches = diff(v1, v2);
      console.log(patches);
    })
  })
})