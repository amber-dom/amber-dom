import h from './h';
import patch from './patch';
import VNode from './vnode';
import { create as createElement } from './domManager';

const amberdom = {
  h,
  patch,
  VNode,
  createElement
};

export default amberdom;

export { default as h } from './h';
export { default as patch } from './patch';
export { default as VNode } from './vnode';
export { create as createElement } from './domManager';