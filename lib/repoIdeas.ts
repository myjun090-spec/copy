import type { GithubContent, GithubRepo, RepoLanguages } from './github';

export interface DevelopIdea {
  title: string;
  rationale: string;
  prompt: string;
}

interface Signals {
  hasNextJs: boolean;
  hasReact: boolean;
  hasVite: boolean;
  hasFirebase: boolean;
  hasSupabase: boolean;
  hasTests: boolean;
  hasCi: boolean;
  hasDockerfile: boolean;
  hasReadme: boolean;
  hasTypeScript: boolean;
  hasPackageJson: boolean;
  hasPython: boolean;
  hasEnvExample: boolean;
  topLang: string;
}

function detectSignals(repo: GithubRepo, tree: GithubContent[], readme: string, languages: RepoLanguages): Signals {
  const names = new Set(tree.map(t => t.name.toLowerCase()));
  const readmeLower = readme.toLowerCase();
  const topLang = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] || repo.language || '';

  return {
    hasNextJs: readmeLower.includes('next') || names.has('next.config.ts') || names.has('next.config.js') || names.has('next.config.mjs'),
    hasReact: readmeLower.includes('react') || /react/.test(topLang.toLowerCase()),
    hasVite: names.has('vite.config.ts') || names.has('vite.config.js'),
    hasFirebase: readmeLower.includes('firebase') || names.has('firebase.json'),
    hasSupabase: readmeLower.includes('supabase') || names.has('supabase'),
    hasTests: Array.from(names).some(n => n.includes('test') || n.includes('spec') || n === 'jest.config.js' || n === 'vitest.config.ts'),
    hasCi: names.has('.github'),
    hasDockerfile: names.has('dockerfile') || names.has('docker-compose.yml'),
    hasReadme: Array.from(names).some(n => n.startsWith('readme')),
    hasTypeScript: names.has('tsconfig.json') || /typescript/i.test(topLang),
    hasPackageJson: names.has('package.json'),
    hasPython: names.has('pyproject.toml') || names.has('requirements.txt') || /python/i.test(topLang),
    hasEnvExample: Array.from(names).some(n => n.startsWith('.env.example') || n === '.env.sample'),
    topLang,
  };
}

function contextBlock(repo: GithubRepo, signals: Signals, readme: string): string {
  const readmeSnippet = readme.slice(0, 800).replace(/```/g, "'''");
  return `Context:
- Repo: ${repo.full_name} (${signals.topLang || 'unknown lang'})
- Description: ${repo.description || 'n/a'}
- Stack signals: ${[
    signals.hasNextJs && 'Next.js',
    signals.hasReact && 'React',
    signals.hasVite && 'Vite',
    signals.hasTypeScript && 'TypeScript',
    signals.hasFirebase && 'Firebase',
    signals.hasSupabase && 'Supabase',
    signals.hasPython && 'Python',
    signals.hasDockerfile && 'Docker',
  ].filter(Boolean).join(', ') || 'mixed'}

README excerpt:
${readmeSnippet || '(no README found — infer from tree)'}
`;
}

export function generateIdeas(
  repo: GithubRepo,
  tree: GithubContent[],
  readme: string,
  languages: RepoLanguages,
): DevelopIdea[] {
  const signals = detectSignals(repo, tree, readme, languages);
  const header = contextBlock(repo, signals, readme);
  const ideas: DevelopIdea[] = [];

  if (!signals.hasTests) {
    ideas.push({
      title: '테스트 스위트 도입',
      rationale: '테스트 파일/설정이 보이지 않아 회귀 방지 기반이 없습니다.',
      prompt: `${header}
Task: Add a practical test suite to this repo.
1. Pick the idiomatic test runner for the stack (Jest/Vitest for JS, pytest for Python, go test for Go).
2. Create 3 representative tests covering the core module(s) identified in the README.
3. Wire a "test" script into package.json (or Makefile) and add a minimal GitHub Actions workflow at .github/workflows/test.yml.
4. Target 80% coverage for the touched files and report gaps.
Deliver: diff, updated README section on how to run tests.`,
    });
  }

  if (!signals.hasCi) {
    ideas.push({
      title: 'CI 파이프라인 구축',
      rationale: '.github 디렉터리가 없어 자동 검증이 빠져 있습니다.',
      prompt: `${header}
Task: Bootstrap CI for this repo using GitHub Actions.
1. Add .github/workflows/ci.yml that runs install, lint, typecheck (if TS), and tests on push/PR.
2. Cache package manager dependencies.
3. Add a status badge to the README.
Deliver: the workflow file, README badge, and a note on required branch protection settings.`,
    });
  }

  if (!signals.hasReadme || readme.length < 400) {
    ideas.push({
      title: 'README / 온보딩 문서 재작성',
      rationale: 'README가 짧거나 비어 있어 신규 기여자가 진입하기 어렵습니다.',
      prompt: `${header}
Task: Rewrite the README to be a first-class onboarding document.
Structure: 1) What this does in one sentence, 2) Quick start (install/run), 3) Architecture diagram (mermaid), 4) Directory map, 5) Contributing workflow.
Deliver: a single README.md PR.`,
    });
  }

  if (signals.hasNextJs || signals.hasReact) {
    ideas.push({
      title: '관찰 가능성 + 에러 바운더리 추가',
      rationale: 'Next.js/React 프로젝트에 기본 에러 수집과 계측이 빠져 있는 경우가 많습니다.',
      prompt: `${header}
Task: Add production-grade observability to this Next.js/React app.
1. Wire a lightweight error boundary at the app shell.
2. Add Sentry (or OpenTelemetry) via env-var config, no-op in dev.
3. Add a /api/health route returning { ok, commit, uptime }.
4. Document env vars in .env.example.
Deliver: the diff and a short README section on how to run with/without Sentry.`,
    });
  }

  if (signals.hasFirebase || signals.hasSupabase) {
    ideas.push({
      title: '보안 규칙/RLS 리뷰 + 테스트',
      rationale: 'BaaS 프로젝트는 규칙 실수가 사고로 이어지기 쉽습니다.',
      prompt: `${header}
Task: Audit and harden the BaaS access layer.
1. Review ${signals.hasFirebase ? 'firestore.rules/storage.rules' : 'Supabase RLS policies'} for unintended public access.
2. Add automated rule tests (emulator suite / pgTAP).
3. Add a CI job that runs them.
Deliver: updated rules, the test file, CI wiring, and a short threat-model note.`,
    });
  }

  if (signals.hasPython) {
    ideas.push({
      title: '패키징 + Typing 현대화',
      rationale: 'Python 레포는 pyproject/ruff/mypy 구성 여부로 유지보수성이 크게 갈립니다.',
      prompt: `${header}
Task: Modernize this Python project.
1. Move to pyproject.toml with PEP 621 metadata.
2. Add ruff + mypy (strict) with sensible per-module overrides.
3. Add a pre-commit config and a minimal GitHub Actions workflow.
Deliver: the configuration files and a migration notes section in the README.`,
    });
  }

  if (!signals.hasEnvExample && (signals.hasPackageJson || signals.hasPython)) {
    ideas.push({
      title: '.env.example 정리',
      rationale: '환경 변수 온보딩 문서가 없어 재현 가능한 개발환경 구성이 어렵습니다.',
      prompt: `${header}
Task: Extract every referenced environment variable into .env.example.
1. Grep the codebase for process.env / os.environ / Deno.env.get and build a complete list.
2. Group by concern (auth, database, feature flags).
3. Add a "Required env" section to the README.
Deliver: .env.example and README update.`,
    });
  }

  // Always include a blue-sky "next feature" idea anchored on repo description
  ideas.push({
    title: `${repo.name} 의 다음 기능 아이디에이션`,
    rationale: '레포 성격에 맞춘 추가 기능을 제안합니다.',
    prompt: `${header}
Task: Based on the README and stack above, propose the single highest-leverage next feature and implement it end-to-end.
Constraints:
- Must ship within a single PR (<400 LOC).
- Must include at least one test.
- Must be backwards-compatible with current public APIs.
Deliver: design doc (3 bullets), diff, and a CHANGELOG entry.`,
  });

  return ideas.slice(0, 6);
}
