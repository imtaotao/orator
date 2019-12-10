import h from './vdom/h.js'
import jsx from './jsx/index.js'
import render from './api/render.js'
import useState from './hooks/use-state.js'
import useEffect from './hooks/use-effect.js'
import useReducer from './hooks/use-reducer.js'

const oops = {
  h,
  jsx,
  render,
  useState,
  useEffect,
  useReducer,
}

export {
  h,
  jsx,
  render,
  useState,
  useEffect,
  useReducer,
  oops as default,
}
