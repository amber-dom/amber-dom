import { h, init, modules } from '../src/amber-dom'


function renderClickButton(clickHandler) {
  return h('button', {
    events: {
      click: clickHandler
    }
  }, 'Click me to toggle on/off')
}

function rClickMOBtn(handlers) {
  return h('button', {
    events: {
      click: handlers[0],
      mouseover: handlers[1]
    }
  })
}

describe('events', () => {
  const { patch, createElement } = init([modules.events()])

  it('without params', () => {
    let isOn = false

    // render a button with a click handler attached to it.
    let elem = createElement(renderClickButton(() => { isOn = !isOn }))
    elem.dispatchEvent(new Event('click'))
    expect(isOn).to.equal(true)
    elem.dispatchEvent(new Event('click'))
    expect(isOn).to.equal(false)
  })

  it('with params', () => {
    let myObj = {
      data1: null,
      data2: null,
      data3: null
    }

    // render a button with a click handler attached to it.
    let elem = createElement(renderClickButton(
        [(ev, obj, data1, data2, data3) => {
        obj.data1 = data1;
        obj.data2 = data2;
        obj.data3 = data3;
      }, myObj, 'Hi', 'This is a message', 'This is another']))

    elem.dispatchEvent(new Event('click'))
    expect(myObj).to.deep.equal({
      data1: 'Hi',
      data2: 'This is a message',
      data3: 'This is another'
    })
  })

  it('"detach" the old listener', () => {
    const res = []

    // render a button with a click handler attached to it.
    let elem = createElement(renderClickButton(() => { res.push(1) }))
    elem.click()
    patch(elem, renderClickButton(() => { res.push(2) }))
    elem.click()
    expect(res).to.deep.equal([1, 2])
  })

  it('can handle changed param', () => {
    let res = []
    let elem = createElement(renderClickButton([
      (ev, data) => {
        res.push(data)
      }, 1])
    )

    elem.click()
    patch(elem, renderClickButton([
      (ev, data) => {
        res.push(data)
      }, 2])
    )
    elem.click()
    expect(res).to.deep.equal([1, 2])
  })

  it('can handle changed params', () => {
    let res = []
    let elem = createElement(renderClickButton([
      // If you use arrow function, be careful not to
      // use arguments inside, because amber-dom proxy
      // the events.
      function(ev, param1, param2) {
        res.push([].slice.call(arguments, 1))
      }, 1, 2])
    )

    elem.click()
    patch(elem, renderClickButton([
      function(ev) {
        res.push([].slice.call(arguments, 1))
      }, 3, 4])
    )
    elem.click()
    expect(res).to.deep.equal([[1, 2], [3, 4]])
  })

  it('can listen to multiple events', () => {
    let wasClicked = false
    let mouseovered = false
    // render a button with click and mouseover handlers attached to it.
    let elem = createElement(rClickMOBtn([
      () => { wasClicked = true },
      () => { mouseovered = true }
    ]))

    elem.dispatchEvent(new Event('click'))
    elem.dispatchEvent(new Event('mouseover'))
    expect(wasClicked).to.equal(true)
    expect(mouseovered).to.equal(true)
  })

  it('can remove listener by setting it undefined', () => {
    let isOn = false

    let elem = createElement(renderClickButton(() => { isOn = !isOn }))
    elem.dispatchEvent(new Event('click'))
    expect(isOn).to.equal(true)
    patch(elem, renderClickButton(void 0))

    // first time you can change me haha.
    elem.dispatchEvent(new Event('click'))
    expect(isOn).to.equal(true)
    // sec time!
    elem.dispatchEvent(new Event('click'))
    expect(isOn).to.equal(true)
  })
})