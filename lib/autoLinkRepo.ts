interface LinkLike {
  title?: string;
  description?: string;
  url?: string;
  memo?: string;
}

function escapeRegex(input: string): string {
  return input.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function inferRelatedRepo(link: LinkLike, repoNames: readonly string[]): string | null {
  const hay = [link.title, link.description, link.memo, link.url]
    .filter((v): v is string => !!v)
    .join(' ');
  if (!hay) return null;

  // Prefer longest repo names first so "my-app-server" beats "my-app"
  const ordered = [...repoNames].filter(n => n && n.length >= 3).sort((a, b) => b.length - a.length);
  for (const name of ordered) {
    const re = new RegExp(`(^|[^a-zA-Z0-9_-])${escapeRegex(name)}([^a-zA-Z0-9_-]|$)`, 'i');
    if (re.test(hay)) return name;
  }
  return null;
}
