import events from './modules/events';
import style from './modules/style';

export default modules;

// The exported `modules` object is used internally throughout
// amber-dom, but should not be accessed from outside of this lib. 
let modules = { events, style };