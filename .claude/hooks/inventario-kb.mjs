#!/usr/bin/env node
// SessionStart hook: inyecta el inventario vivo de la base de conocimientos interna.
// Evita mantener un INDICE.md que queda desactualizado: la lista se deriva del disco
// en cada sesion, asi las notas que agrega el equipo aparecen sin tocar configuracion.

import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const KB = join(ROOT, "base-de-conocimientos-inenco");
const SPECS = join(ROOT, "especificaciones-proyectos");

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name, "es"))) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) out.push(full);
  }
  return out;
}

function listar(dir, base) {
  return walk(dir).map((f) => {
    const rel = relative(base, f).split(sep).join("/");
    const kb = Math.max(1, Math.round(statSync(f).size / 1024));
    return `- ${rel} (~${kb} KB)`;
  });
}

const notas = listar(KB, ROOT);
const specs = listar(SPECS, ROOT);

const bloques = [
  "Inventario actual de las fuentes de conocimiento de este repositorio " +
    "(derivado del disco al iniciar la sesion). Usalo para saber que existe " +
    "antes de buscar; la jerarquia de autoridad esta en CLAUDE.md.",
  "",
  `Base de conocimientos Inenco -- ${notas.length} nota(s):`,
  ...(notas.length ? notas : ["- (vacia)"]),
];

if (specs.length) {
  bloques.push(
    "",
    `Especificaciones de proyectos -- ${specs.length} documento(s), ` +
      "tienen prioridad sobre cualquier patron generico:",
    ...specs
  );
} else {
  bloques.push(
    "",
    "Especificaciones de proyectos: no incorporadas todavia."
  );
}

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: bloques.join("\n"),
    },
    suppressOutput: true,
  })
);
