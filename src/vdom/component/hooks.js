import { Component } from './create.js'
import { isUndef } from '../../shared.js'
import { isComponent } from '../helpers/patch/is.js'

function createComponentInstanceForVnode(vnode) {
  if (isUndef(vnode.component)) {
    vnode.component = new Component(vnode)
    vnode.component.init()
  }
}

export const componentVNodeHooks = {
  init(vnode) {
    if (isComponent(vnode)) {
      createComponentInstanceForVnode(vnode)
    }
  },

  prepatch(oldVnode, vnode) {
    const component = vnode.component = oldVnode.component
    // 换成新的 vnode，这样就会有新的 props
    component.vnode = vnode
  },

  update(oldVnode, vnode) {
    vnode.component.update(oldVnode, vnode)
  },

  postpatch(oldVnode, vnode) {
    vnode.component.postpatch(oldVnode, vnode)
  },

  remove(vnode, rm) {
    vnode.component.remove(vnode, rm)
  },

  destroy(vnode) {
    vnode.component.destroy(vnode)
  }
}
