export default {
  add,
  remove,
  init
}

export const modules = {};

/**
 * Add an array of modules.
 * @param {Array|Object} mods an array of modules to add.
 */
export function add(mods) {
  if (mods && !!mods.pop) {
    for (let mod of mods) {
      if (isMod(mod)) {
        modules[mod.name] = mod;
      }

      else {
        let msg = errMsg(mod)
        console.warn(msg);
      }
    }
  }

  else if (isMod(mods)) {
    modules[mods.name] = mods;
  }

  else {
    let msg = errMsg(mods)
    console.warn(msg);
  }
}

/**
 * Initialize modules.
 * @param {Array} mods an array of modules.
 */
export function init(mods) {
  for (let name in modules) {
    modules[name] = void 0;
  }
  
  if (mods != null) {
    add(mods);
  }
}

/**
 * Remove module(s).
 * @param {Array} mods an array of module names.
 */
export function remove(mods) {
  if (mods && !!mods.pop) {
    for (let name of mods) {
      modules[name] = void 0;
    }
  }

  else if (mods) {
    modules[mods] = void 0;
  }
}

function isMod(obj) {
  return (obj != null) && (typeof obj.name === 'string') && (obj.name.length);
}

function errMsg(mod) {
  if (mod == null)
    return 'Given a null or undefined object as module.';
  
  let msg = 'Unrecognized module: \n{\n';
  let fields = []
  for (let name in mod)
    fields.push('\t' + name + ': ' + mod[name])

  msg += fields.join(',\n\n');
  msg += '\n}\n';
  msg += 'A module must contain a a string name.'
  return msg;
}