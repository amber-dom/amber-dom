import events from './modules/events';
import style from './modules/style';
import dataset from './modules/dataset';
import patchElem from './patch';
import createElem from './create-element';

export { default as h } from './h';
export const modules = {
  style,
  events,
  dataset,
  all() {
    return [
      style(),
      events(),
      dataset() ];
  }
}

/**
 * Initialize modules.
 * @param {Array|Object|null} mods an array of modules.
 */
export function init(mods) {
  const modules = {};

  mods || (mods = []);

  if (typeof mods.pop === 'function') {
    for (const mod of mods) {
      if (isMod(mod)) {
        modules[mod.name] = mod;
      } else {
        errMsg(mods);
      }
    }
  }

  else if (isMod(mods)) {
    modules[mods.name] = mods;
  }

  else {
    errMsg(mods);
  }

  return {
    patch(elem, vnode) {
      return patchElem(modules, elem, vnode);
    },

    createElement(vnode) {
      let mountedNodes = [];
      let root = createElem(modules, vnode, mountedNodes);
      let mounted, i;

      while((mounted = mountedNodes.shift())) {
        (i = mounted.__mounted__) && (typeof i === 'function') && i(mounted);
      }
      return root;
    }
  }
}

function isMod(obj) {
  return (obj != null) && (typeof obj.name === 'string') && (obj.name.length);
}

function errMsg(mod) {
  if (mod == null)
    return 'Given a null or undefined as module.';
  
  let msg = 'Unrecognized module: \n{\n';
  let fields = []
  for (let name in mod)
    fields.push('\t' + name + ': ' + mod[name])

  msg += fields.join(',\n\n');
  msg += '\n}\n';
  if (typeof mod === 'function') {
    msg += 'Did you just pass in a module generator function?';
  } else {
    msg += 'A module must contain a a string name.';
  }
  return msg;
}