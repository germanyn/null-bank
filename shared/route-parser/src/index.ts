function toKebabCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function extractRoutePath(filePath: string): string | null {
  const match = filePath.match(/routes\/([^.]+)\.[tj]sx?$/);
  if (!match) return null;
  return '/' + toKebabCase(match[1]);
}

export function parseDiffRoutes(diff: string): string[] {
  if (!diff) return [];

  const routes: string[] = [];
  const seen = new Set<string>();
  const diffBlocks = diff.split(/^diff --git /m).slice(1);

  for (const block of diffBlocks) {
    const blockLines = block.split('\n');
    let deleted = false;
    let renamedTo: string | null = null;
    let newPath: string | null = null;

    for (const line of blockLines) {
      if (line === 'deleted file mode 100644') {
        deleted = true;
      } else if (line.startsWith('+++ /dev/null')) {
        deleted = true;
      } else if (line.startsWith('rename to ')) {
        renamedTo = line.slice('rename to '.length);
      } else if (line.startsWith('+++ b/')) {
        newPath = line.slice('+++ b/'.length);
      }
    }

    if (deleted) continue;

    const pathToUse = renamedTo || newPath;
    if (!pathToUse) continue;

    const route = extractRoutePath(pathToUse);
    if (route && !seen.has(route)) {
      seen.add(route);
      routes.push(route);
    }
  }

  return routes;
}
