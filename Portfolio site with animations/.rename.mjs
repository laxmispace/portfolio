// One-off: rename identifiers with the TypeScript language service so only real
// references change (never strings/comments). Deleted after use.
import ts from 'typescript'
import fs from 'fs'
import path from 'path'

const cfg = ts.parseJsonConfigFileContent(ts.readConfigFile('tsconfig.json', ts.sys.readFile).config, ts.sys, process.cwd())
const files = new Map(cfg.fileNames.map((f) => [path.resolve(f), { text: fs.readFileSync(f, 'utf8'), v: 0 }]))
const host = {
  getScriptFileNames: () => [...files.keys()],
  getScriptVersion: (f) => String(files.get(path.resolve(f))?.v ?? 0),
  getScriptSnapshot: (f) => {
    const e = files.get(path.resolve(f))
    if (e) return ts.ScriptSnapshot.fromString(e.text)
    return fs.existsSync(f) ? ts.ScriptSnapshot.fromString(fs.readFileSync(f, 'utf8')) : undefined
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => cfg.options,
  getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
  fileExists: ts.sys.fileExists, readFile: ts.sys.readFile, readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists, getDirectories: ts.sys.getDirectories,
}
const ls = ts.createLanguageService(host)

function apply(locs, newName, skip = () => false) {
  const byFile = new Map()
  for (const l of locs) {
    if (skip(l)) continue
    if (!byFile.has(l.fileName)) byFile.set(l.fileName, [])
    byFile.get(l.fileName).push(l)
  }
  for (const [f, ls_] of byFile) {
    const e = files.get(path.resolve(f))
    ls_.sort((a, b) => b.textSpan.start - a.textSpan.start)
    for (const l of ls_) e.text = e.text.slice(0, l.textSpan.start) + (l.prefixText ?? '') + newName + (l.suffixText ?? '') + e.text.slice(l.textSpan.start + l.textSpan.length)
    e.v++
  }
}

const DECL = new Set([ts.SyntaxKind.FunctionDeclaration, ts.SyntaxKind.VariableDeclaration, ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.TypeAliasDeclaration, ts.SyntaxKind.ClassDeclaration, ts.SyntaxKind.PropertySignature, ts.SyntaxKind.Parameter, ts.SyntaxKind.BindingElement])

function findDecl(file, name) {
  const sf = ls.getProgram().getSourceFile(path.resolve(file))
  let found
  const visit = (n) => {
    if (found) return
    if (ts.isIdentifier(n) && n.text === name && n.parent && DECL.has(n.parent.kind) && n.parent.name === n) { found = n; return }
    ts.forEachChild(n, visit)
  }
  visit(sf)
  return found
}

export function rename(file, oldName, newName) {
  const id = findDecl(file, oldName)
  if (!id) { console.log(`  ! not found: ${oldName} in ${file}`); return }
  const locs = ls.findRenameLocations(path.resolve(file), id.getStart(), false, false, { providePrefixAndSuffixTextForRename: false })
  apply(locs ?? [], newName)
}

// `const m = isMobile;` → drop the alias and use isMobile directly
export function inlineMobileAlias(file) {
  for (;;) {
    const sf = ls.getProgram().getSourceFile(path.resolve(file))
    let decl
    const visit = (n) => {
      if (decl) return
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'm' && n.initializer && ts.isIdentifier(n.initializer) && n.initializer.text === 'isMobile') { decl = n; return }
      ts.forEachChild(n, visit)
    }
    visit(sf)
    if (!decl) return
    const stmt = decl.parent.parent
    const declStart = decl.name.getStart()
    const locs = ls.findRenameLocations(path.resolve(file), declStart, false, false, { providePrefixAndSuffixTextForRename: true })
    apply(locs, 'isMobile', (l) => l.textSpan.start === declStart)
    // remove the now-redundant `const isMobile = isMobile;` line
    const e = files.get(path.resolve(file))
    const sf2 = ts.createSourceFile(file, e.text, ts.ScriptTarget.Latest, true)
    let s2
    const v2 = (n) => { if (s2) return; if (ts.isVariableStatement(n) && /^const m = isMobile;$/.test(n.getText(sf2))) { s2 = n; return } ts.forEachChild(n, v2) }
    v2(sf2)
    const lineStart = e.text.lastIndexOf('\n', s2.getStart(sf2))
    e.text = e.text.slice(0, lineStart) + e.text.slice(s2.getEnd())
    e.v++
  }
}

export function save() {
  for (const [f, e] of files) if (e.v > 0) fs.writeFileSync(f, e.text)
}

const { default: plan } = await import(process.argv[2])
plan({ rename, inlineMobileAlias })
save()
