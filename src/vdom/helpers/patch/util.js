import * as api from './domApi.js'
import { createVnode } from '../../h.js'
import { cbs } from '../../modules/index.js'
import { FragmentNode } from './fragment.js'
import { createFragmentVnode } from '../h.js'
import {
  isDef,
  isArray,
} from '../../../shared.js'
import {
  emptyNode,
  isPortal,
  isFragment,
  isProvider,
  isPrimitiveVnode,
} from './is.js'

export function createKeyToOldIdx(children, beginIdx, endIdx) {
  let map = {}, key, ch
  for (let i = beginIdx; i <= endIdx; ++i) {
    ch = children[i]
    if (ch != null) {
      key = ch.key
      if (key !== undefined) map[key] = i
    }
  }
  return map
}

export function emptyNodeAt(elm) {
  let tagName = api.tagName(elm)
  if (typeof tagName === 'string') {
    tagName = tagName.toLowerCase()
  }
  return createVnode(tagName, {}, [], undefined, elm)
}

export function invokeCreateHooks(vnode, insertedVnodeQueue) {
  let i
  for (i = 0; i < cbs.create.length; i++) {
    cbs.create[i](emptyNode, vnode)
  }
  i = vnode.data.hook
  if (isDef(i)) {
    if (isDef(i.create)) i.create(emptyNode, vnode)
    if (isDef(i.insert)) insertedVnodeQueue.push(vnode)
  }
}

export function invokeDestroyHook(vnode) {
  let i, j
  let data = vnode.data

  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.destroy)) {
      i(vnode)
    }

    for (i = 0; i < cbs.destroy.length; i++) {
      cbs.destroy[i](vnode)
    }

    if (isDef(vnode.children)) {
      for (j = 0; j < vnode.children.length; j++) {
        i = vnode.children[j]
        if (i != null && typeof i !== 'string') {
          invokeDestroyHook(i)
        }
      }
    }
  }
}

export function createRmCb(childElm, listeners) {
  return function remove() {
    if (--listeners === 0) {
      const parent = parentNode(childElm)
      removeChild(parent, childElm)
    }
  }
}

export function formatRootVnode(vnode) {
  if (isPrimitiveVnode(vnode)) {
    vnode = createVnode(undefined, undefined, undefined, vnode, undefined)
  }
  if (isArray(vnode)) {
    vnode = createFragmentVnode(vnode)
    console.warn('Warning: Aadjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?')
  }
  return vnode
}

// 如果是 fragment，返回 list 中最后一个的 nextSibling
export function nextSibling(node) {
  return node._isFragmentNode
    ? node.nextSibling
    : api.nextSibling(node)
}

export function parentNode(node) {
  return node._isFragmentNode
    ? node.parentNode
    : api.parentNode(node)
}

export function appendChild(node, child) {
  if (!node || !child) return
  if (node._isFragmentNode) {
    node.appendChild(child)
  } else {
    if (child._isFragmentNode) {
      child.appendSelfInParent(node)
    } else {
      api.appendChild(node, child)
    }
  }
}

export function removeChild(node, child) {
  if (!node || !child) return
  if (node._isFragmentNode) {
    node.removeChild(child)
  } else {
    if (child._isFragmentNode) {
      child.removeSelfInParent(node)
    } else {
      api.removeChild(node, child)
    }
  }
}

export function insertBefore(parentNode, newNode, referenceNode) {
  if (!parentNode || !newNode) return
  if (parentNode._isFragmentNode) {
    parentNode.insertBefore(newNode, referenceNode)
  } else {
    if (newNode._isFragmentNode) {
      newNode.insertBeforeSelfInParent(parentNode, referenceNode)
    } else {
      if (referenceNode && referenceNode._isFragmentNode) {
        referenceNode = referenceNode.first
      }
      api.insertBefore(parentNode, newNode, referenceNode)
    }
  }
}

export function createComponent(vnode) {
  let i = vnode.data
  if (isDef(i)) {
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode)
    }
    return isDef(vnode.component) && !isProvider(vnode)
  }
  return false
}

export function createElm(vnode, insertedVnodeQueue) {
  // 如果是一个组件则没必要往下走（包含自定义的组件和内部标识组件）
  if (createComponent(vnode)) {
    // portal 组件需要在 create 钩子中对 container 做事件的代理和转发
    if (isPortal(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
    }
    return vnode.elm
  }

  const { tag, data, children } = vnode

  if (isDef(tag)) {
    let elm
    if (isFragment(vnode) || isProvider(vnode)) {
      elm = vnode.elm = new FragmentNode()
    } else {
      elm = vnode.elm = isDef(data) && isDef(data.ns)
        ? api.createElementNS(data.ns, tag)
        : api.createElement(tag)
    }
    if (isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const chVNode = children[i]
        if (chVNode != null) {
          appendChild(elm, createElm(chVNode, insertedVnodeQueue))
        }
      }
    } else if (isPrimitiveVnode(vnode.text)) {
      appendChild(elm, api.createTextNode(vnode.text))
    }
    invokeCreateHooks(vnode, insertedVnodeQueue)
  } else {
    vnode.elm = api.createTextNode(vnode.text)
  }

  // 初始化之后
  if (isDef(data)) {
    let i = data.hook
    if (isDef(i) && isDef(i = i.initBefore)) {
      i(vnode)
    }
  }
  return vnode.elm
}
