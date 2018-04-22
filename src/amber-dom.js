import h from './h';
import patch from './patch';
import VNode from './vnode';
import { create as createElement } from './dom-manager';

const amberdom = {
  h,
  patch,
  VNode,
  createElement
};

export default amberdom;