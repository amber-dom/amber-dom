export default {
  addModules,
  rmModules,
  initModules
}

export const modules = {};

/**
 * Add an array of modules.
 * @param {Array|Object} mods an array of modules to add.
 */
export function addModules(mods) {
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
export function initModules(mods) {
  for (let name in modules) {
    modules[name] = void 0;
  }
  
  if (mods != null) {
    addModules(mods);
  }
}

/**
 * Remove module(s).
 * @param {Array} mods an array of module names.
 */
export function rmModules(mods) {
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
  return (obj != null) && (obj.name) &&
    obj.creating && (typeof obj.creating === 'function') &&
    obj.updating && (typeof obj.updating === 'function');
}

function errMsg(mod) {
  if (mod == null)
    return 'Given a null or undefined object as module.';
  
  let msg = 'Unrecognized module: \n{\n'
  for (let name in mod)
    msg += '  ' + name + ': ' + mod[name] + '\n';

  msg += '}';
  return msg;
}