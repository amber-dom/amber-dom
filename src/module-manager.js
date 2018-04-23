import events from './modules/events';
import style from './modules/style';


export let modules = {
  events,
  style
};

/**
 * Add an array of modules.
 * @param {Array} mods an array of modules to add.
 */
export function addModule(mods) {
  if (!!mods.pop) {
    for (let mod in mods) {
      if (isMod(mod))
        modules[mod.name] = mod;
      else
        console.warn(`Unrecognizable module: ${mod}`);
    }
  }

  else {
    console.warn(`Unrecognizable modules: ${mods}`);
  }
}

/**
 * Initialize modules.
 * @param {Array} mods an array of modules.
 */
export function initModule(mods) {
  modules = [];
  addModule(mods);
}


function isMod(obj) {
  return
    (obj != null) && (obj.name) &&
    obj.creating && (typeof obj.creating === 'function') &&
    obj.updating && (typeof obj.updating === 'function');
}