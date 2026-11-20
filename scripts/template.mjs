// Function replacers keep `$&`, `$'` and `$$` in content literal.
export function fillTemplate(template, { head, html }) {
  return template.replace('<!--app-head-->', () => head).replace('<!--app-html-->', () => html)
}
