import {
  CONTEXT_TYPE,
  PROVIDER_TYPE,
  FRAGMENTS_TYPE,
} from '../../api/nodeSymbols.js'
import {
  flatten,
  formatVnode,
  installHooks,
  separateProps,
} from '../helpers/h.js'
import createVnode from './vnode.js'

function inspectedElemntType(tag, props, children) {
  if (typeof tag === 'object') {
    switch (tag.$$typeof) {
      case PROVIDER_TYPE:
        if (typeof tag !== 'function') {
          const context = tag._context
          function ContextProvider({ value, children }) {
            context._contextStack.push(value)
            return createVnode(FRAGMENTS_TYPE, {}, children, undefined, undefined)
          }
          ContextProvider.$$typeof = tag.$$typeof
          ContextProvider._context = tag._context
          tag = ContextProvider
        }
        break
      case CONTEXT_TYPE:
        break
    }
  }
  return { tag, props, children }
}


export default function h(tag, props, ...children) {
  // 平铺数组，这将导致数组中的子数组中的元素 key 值是在同一层级的
  children = flatten(children)

  if (tag === '') {
    tag = FRAGMENTS_TYPE
  }

  // 在此针对普通的 node，组件和内置组件做区分
  const res = inspectedElemntType(tag, props, children)

  tag = res.tag
  props = res.props
  children = res.children

  const data = typeof tag === 'string' || tag === FRAGMENTS_TYPE
    ? separateProps(props)
    : installHooks(props)

  return formatVnode(tag, data, children)
}