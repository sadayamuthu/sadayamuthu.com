// @vitest-environment node
import { fillTemplate } from './template.mjs'

it('keeps replacement patterns literal', () => {
  const out = fillTemplate('<head><!--app-head--></head><!--app-html-->', { head: 'a $& b', html: "$' $$ c" })
  expect(out).toBe("<head>a $& b</head>$' $$ c")
})
