/**
 * Apply FashionTested brand colors across the codebase.
 * Usage: node scripts/apply-theme.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const root = join(import.meta.dirname, '..')

const replacements = [
  ['#0B453C', '#01345B'],
  ['#0b453c', '#01345B'],
  ['#0a2f2a', '#012a47'],
  ['#042b26', '#001f36'],
  ['#063830', '#024a72'],
  ['#0f5c4e', '#024a72'],
  ['#CD3D1C', '#FFCF43'],
  ['#cd3d1c', '#FFCF43'],
  ['#006838', '#01345B'],
  ['#f26522', '#FFCF43'],
  ['hover:bg-emerald-700', 'hover:bg-brand-navy-dark'],
  ['bg-emerald-700', 'bg-brand-navy-dark'],
  ['from-emerald-700', 'from-brand-navy-dark'],
  ['to-emerald-700', 'to-brand-navy-dark'],
  ['via-emerald-600', 'via-brand-cyan'],
  ['from-emerald-600', 'from-brand-cyan'],
  ['to-emerald-600', 'to-brand-navy-light'],
  ['to-emerald-800', 'to-brand-navy-darker'],
  ['from-emerald-800', 'from-brand-navy-darker'],
  ['to-teal-500', 'to-brand-cyan'],
  ['to-teal-600', 'to-brand-cyan'],
  ['text-emerald-400', 'text-brand-cyan'],
  ['text-emerald-600', 'text-brand-navy'],
  ['text-emerald-800', 'text-brand-navy-dark'],
  ['hover:text-emerald-400', 'hover:text-brand-cyan'],
  ['border-emerald-400', 'border-brand-cyan'],
  ['from-green-50', 'from-brand-cyan/10'],
  ['to-emerald-50', 'to-brand-cyan/15'],
  ['border-green-100', 'border-brand-cyan/20'],
  ['bg-green-100', 'bg-brand-cyan/15'],
  ['bg-emerald-50', 'bg-brand-cyan/10'],
  ['bg-emerald-100', 'bg-brand-cyan/15'],
  ['hover:bg-green-50', 'hover:bg-brand-cyan/10'],
  ['from-emerald-100', 'from-brand-cyan/15'],
  ['to-emerald-100', 'to-brand-cyan/15'],
  ['from-emerald-800/20', 'from-brand-navy-darker/20'],
  ['to-emerald-800/20', 'to-brand-navy-darker/20'],
  ["color: '#0B453C'", "color: '#01345B'"],
  ['#a7f3d0', '#5CE0D8'],
  ['hover:text-emerald-700', 'hover:text-brand-navy-dark'],
  ['text-emerald-700', 'text-brand-navy-dark'],
  ['from-emerald-400', 'from-brand-cyan'],
  ['to-emerald-400', 'to-brand-cyan'],
  ['via-emerald-400', 'via-brand-cyan'],
  ['from-emerald-500', 'from-brand-cyan'],
  ['to-emerald-500', 'to-brand-cyan'],
  ['bg-emerald-400', 'bg-brand-cyan'],
  ['bg-emerald-200/20', 'bg-brand-cyan/20'],
  ['border-emerald-200', 'border-brand-cyan/25'],
  ['bg-green-50', 'bg-brand-cyan/10'],
  ['border-green-50', 'border-brand-cyan/10'],
  ['border-green-200', 'border-brand-cyan/25'],
  ['border-green-300', 'border-brand-cyan/30'],
  ['text-green-600', 'text-brand-navy'],
  ['text-green-700', 'text-brand-navy-dark'],
  ['text-green-800', 'text-brand-navy-dark'],
  ['text-green-100', 'text-brand-cyan/80'],
  ['from-green-100', 'from-brand-cyan/15'],
  ['to-green-300/5', 'to-brand-cyan/5'],
  ['to-green-100', 'to-brand-cyan/15'],
  ['bg-teal-100', 'bg-brand-cyan/15'],
  ['text-teal-600', 'text-brand-navy'],
  ['text-teal-800', 'text-brand-navy-dark'],
  ['text-teal-100/90', 'text-brand-cyan/90'],
  ['bg-green-200/20', 'bg-brand-cyan/20'],
  ['text-green-300', 'text-brand-cyan/80'],
  ['text-green-900', 'text-brand-navy-darker'],
  ['text-green-200', 'text-brand-cyan/30'],
  ['bg-green-600', 'bg-brand-navy'],
  ['hover:bg-green-700', 'hover:bg-brand-navy-dark'],
  ['hover:bg-green-200', 'hover:bg-brand-cyan/25'],
]

const allowedExt = new Set(['.tsx', '.ts', '.css', '.svg'])

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) walk(path, files)
    else if (allowedExt.has(extname(path))) files.push(path)
  }
  return files
}

let updated = 0
for (const file of walk(root)) {
  let content = readFileSync(file, 'utf8')
  let next = content
  for (const [from, to] of replacements) {
    next = next.split(from).join(to)
  }
  if (next !== content) {
    writeFileSync(file, next, 'utf8')
    updated++
    console.log(file.replace(root + '\\', '').replace(root + '/', ''))
  }
}

console.log(`Updated ${updated} files.`)
