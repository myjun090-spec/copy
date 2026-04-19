export interface ClassificationResult {
  category: string;
  tags: string[];
}

export interface MetaSignal {
  title?: string;
  description?: string;
}

interface DomainRule {
  match: RegExp;
  category: string;
  tags: string[];
}

const DOMAIN_RULES: DomainRule[] = [
  // Dev platforms
  { match: /(^|\.)github\.com$/i, category: '개발', tags: ['오픈소스', '코드', 'GitHub'] },
  { match: /(^|\.)gitlab\.com$/i, category: '개발', tags: ['오픈소스', '코드', 'GitLab'] },
  { match: /(^|\.)bitbucket\.org$/i, category: '개발', tags: ['코드', 'Bitbucket'] },
  { match: /(^|\.)stackoverflow\.com$/i, category: '개발', tags: ['Q&A', '트러블슈팅'] },
  { match: /(^|\.)npmjs\.com$/i, category: '개발', tags: ['라이브러리', 'npm'] },
  { match: /(^|\.)pypi\.org$/i, category: '개발', tags: ['라이브러리', 'Python'] },
  { match: /(^|\.)crates\.io$/i, category: '개발', tags: ['라이브러리', 'Rust'] },
  { match: /(^|\.)pkg\.go\.dev$/i, category: '개발', tags: ['라이브러리', 'Go'] },
  { match: /(^|\.)developer\.mozilla\.org$/i, category: '개발', tags: ['MDN', '웹표준', '레퍼런스'] },
  { match: /(^|\.)web\.dev$/i, category: '개발', tags: ['웹', 'Google', '성능'] },
  { match: /(^|\.)vercel\.com$/i, category: '개발', tags: ['호스팅', 'Vercel'] },
  { match: /(^|\.)netlify\.com$/i, category: '개발', tags: ['호스팅', 'Netlify'] },
  { match: /(^|\.)nextjs\.org$/i, category: '개발', tags: ['Next.js', 'React'] },
  { match: /(^|\.)react\.dev$/i, category: '개발', tags: ['React', '프론트엔드'] },
  { match: /(^|\.)svelte\.dev$/i, category: '개발', tags: ['Svelte', '프론트엔드'] },
  { match: /(^|\.)vuejs\.org$/i, category: '개발', tags: ['Vue', '프론트엔드'] },

  // Design
  { match: /(^|\.)figma\.com$/i, category: '디자인', tags: ['UIUX', '기획', 'Figma'] },
  { match: /(^|\.)dribbble\.com$/i, category: '디자인', tags: ['레퍼런스', 'Dribbble'] },
  { match: /(^|\.)behance\.net$/i, category: '디자인', tags: ['포트폴리오', 'Behance'] },
  { match: /(^|\.)pinterest\.(com|co\.kr)$/i, category: '디자인', tags: ['무드보드', 'Pinterest'] },
  { match: /(^|\.)unsplash\.com$/i, category: '디자인', tags: ['이미지', '소스'] },
  { match: /(^|\.)pexels\.com$/i, category: '디자인', tags: ['이미지', '소스'] },
  { match: /(^|\.)awwwards\.com$/i, category: '디자인', tags: ['웹디자인', '레퍼런스'] },
  { match: /(^|\.)mobbin\.com$/i, category: '디자인', tags: ['모바일', '레퍼런스'] },

  // Video
  { match: /(^|\.)(youtube\.com|youtu\.be)$/i, category: '나중에 볼 영상', tags: ['영상', 'YouTube'] },
  { match: /(^|\.)vimeo\.com$/i, category: '나중에 볼 영상', tags: ['영상', 'Vimeo'] },
  { match: /(^|\.)tv\.naver\.com$/i, category: '나중에 볼 영상', tags: ['영상', '네이버'] },
  { match: /(^|\.)tiktok\.com$/i, category: '나중에 볼 영상', tags: ['쇼츠', 'TikTok'] },
  { match: /(^|\.)instagram\.com$/i, category: '나중에 볼 영상', tags: ['릴스', 'Instagram'] },

  // Knowledge / blogs
  { match: /(^|\.)velog\.io$/i, category: '지식/블로그', tags: ['블로그', '개발지식'] },
  { match: /(^|\.)medium\.com$/i, category: '지식/블로그', tags: ['블로그', '해외아티클'] },
  { match: /(^|\.)dev\.to$/i, category: '지식/블로그', tags: ['블로그', 'dev.to'] },
  { match: /(^|\.)tistory\.com$/i, category: '지식/블로그', tags: ['블로그', 'Tistory'] },
  { match: /(^|\.)brunch\.co\.kr$/i, category: '지식/블로그', tags: ['에세이', 'Brunch'] },
  { match: /(^|\.)substack\.com$/i, category: '지식/블로그', tags: ['뉴스레터', 'Substack'] },
  { match: /(^|\.)notion\.site$/i, category: '지식/블로그', tags: ['공개노트', 'Notion'] },
  { match: /(^|\.)arxiv\.org$/i, category: '지식/블로그', tags: ['논문', '연구'] },

  // Productivity / SaaS
  { match: /(^|\.)notion\.so$/i, category: '생산성', tags: ['협업', '노트', 'Notion'] },
  { match: /(^|\.)slack\.com$/i, category: '생산성', tags: ['커뮤니케이션', 'Slack'] },
  { match: /(^|\.)trello\.com$/i, category: '생산성', tags: ['프로젝트관리', 'Trello'] },
  { match: /(^|\.)linear\.app$/i, category: '생산성', tags: ['이슈트래커', 'Linear'] },
  { match: /(^|\.)atlassian\.net$/i, category: '생산성', tags: ['Jira', '협업'] },
  { match: /(^|\.)airtable\.com$/i, category: '생산성', tags: ['데이터베이스', 'Airtable'] },

  // AI
  { match: /(^|\.)openai\.com$/i, category: 'AI', tags: ['OpenAI', 'GPT'] },
  { match: /(^|\.)chatgpt\.com$/i, category: 'AI', tags: ['ChatGPT', 'OpenAI'] },
  { match: /(^|\.)gemini\.google\.com$/i, category: 'AI', tags: ['Gemini', 'Google'] },
  { match: /(^|\.)claude\.ai$/i, category: 'AI', tags: ['Claude', 'Anthropic'] },
  { match: /(^|\.)anthropic\.com$/i, category: 'AI', tags: ['Claude', 'Anthropic'] },
  { match: /(^|\.)huggingface\.co$/i, category: 'AI', tags: ['모델', 'HuggingFace'] },
  { match: /(^|\.)perplexity\.ai$/i, category: 'AI', tags: ['검색', 'Perplexity'] },
  { match: /(^|\.)midjourney\.com$/i, category: 'AI', tags: ['이미지생성', 'Midjourney'] },

  // Shopping
  { match: /(^|\.)coupang\.com$/i, category: '쇼핑/아이템', tags: ['쇼핑', '쿠팡'] },
  { match: /(^|\.)(smartstore|shopping)\.naver\.com$/i, category: '쇼핑/아이템', tags: ['쇼핑', '네이버'] },
  { match: /(^|\.)aliexpress\.com$/i, category: '쇼핑/아이템', tags: ['해외직구', 'Aliexpress'] },
  { match: /(^|\.)amazon\.(com|co\.jp)$/i, category: '쇼핑/아이템', tags: ['해외직구', 'Amazon'] },
  { match: /(^|\.)29cm\.co\.kr$/i, category: '쇼핑/아이템', tags: ['쇼핑', '29CM'] },
  { match: /(^|\.)kream\.co\.kr$/i, category: '쇼핑/아이템', tags: ['리셀', 'KREAM'] },

  // News
  { match: /(^|\.)news\.(naver|daum)\.com$/i, category: '뉴스', tags: ['뉴스', '시사'] },
  { match: /(^|\.)yna\.co\.kr$/i, category: '뉴스', tags: ['뉴스', '연합뉴스'] },
  { match: /(^|\.)chosun\.com$/i, category: '뉴스', tags: ['뉴스', '조선일보'] },
  { match: /(^|\.)hani\.co\.kr$/i, category: '뉴스', tags: ['뉴스', '한겨레'] },
  { match: /(^|\.)nytimes\.com$/i, category: '뉴스', tags: ['뉴스', 'NYT'] },

  // Finance
  { match: /(^|\.)(finance|stock)\.naver\.com$/i, category: '재테크', tags: ['주식', '네이버금융'] },
  { match: /(^|\.)toss\.im$/i, category: '재테크', tags: ['핀테크', 'Toss'] },
  { match: /(^|\.)kakaobank\.com$/i, category: '재테크', tags: ['은행', '카카오뱅크'] },
  { match: /(^|\.)upbit\.com$/i, category: '재테크', tags: ['코인', 'Upbit'] },
];

const PATH_KEYWORDS: Array<{ match: RegExp; category: string; tags: string[] }> = [
  { match: /\/(docs|documentation|reference|api)\b/i, category: '개발', tags: ['문서', '레퍼런스'] },
  { match: /\/(tutorial|guide|howto|getting-started)\b/i, category: '개발', tags: ['튜토리얼', '가이드'] },
  { match: /\/(release|changelog|v\d+)\b/i, category: '개발', tags: ['릴리즈', '변경사항'] },
  { match: /\/(blog|post|article|story)\b/i, category: '지식/블로그', tags: ['아티클'] },
  { match: /\/(product|shop|store|item)\b/i, category: '쇼핑/아이템', tags: ['쇼핑'] },
];

const KEYWORD_TAGS: Array<{ keywords: RegExp; tag: string }> = [
  { keywords: /\b(react|리액트)\b/i, tag: 'React' },
  { keywords: /\b(next\.?js)\b/i, tag: 'Next.js' },
  { keywords: /\b(vue)\b/i, tag: 'Vue' },
  { keywords: /\b(svelte)\b/i, tag: 'Svelte' },
  { keywords: /\b(typescript|타입스크립트)\b/i, tag: 'TypeScript' },
  { keywords: /\b(javascript|자바스크립트)\b/i, tag: 'JavaScript' },
  { keywords: /\b(python|파이썬)\b/i, tag: 'Python' },
  { keywords: /\b(rust|러스트)\b/i, tag: 'Rust' },
  { keywords: /\b(go\b|golang)/i, tag: 'Go' },
  { keywords: /\b(swift)\b/i, tag: 'Swift' },
  { keywords: /\b(kotlin)\b/i, tag: 'Kotlin' },
  { keywords: /\b(docker|쿠버네티스|kubernetes|k8s)\b/i, tag: 'DevOps' },
  { keywords: /\b(firebase|supabase|postgres|mysql|mongodb)\b/i, tag: 'Backend' },
  { keywords: /\b(css|tailwind|scss)\b/i, tag: 'CSS' },
  { keywords: /\b(ai|llm|agent|gpt|claude|openai|anthropic)\b/i, tag: 'AI' },
  { keywords: /\b(tutorial|강의|강좌|튜토리얼)\b/i, tag: '튜토리얼' },
  { keywords: /\b(review|리뷰|후기)\b/i, tag: '리뷰' },
  { keywords: /\b(design|ui|ux|디자인)\b/i, tag: '디자인' },
  { keywords: /\b(open.?source|오픈소스)\b/i, tag: '오픈소스' },
];

const CATEGORY_OVERRIDES: Array<{ keywords: RegExp; category: string }> = [
  { keywords: /\b(ai|llm|gpt|claude|agent|머신러닝|딥러닝)\b/i, category: 'AI' },
  { keywords: /\b(채용|job|recruit|career)\b/i, category: '커리어' },
  { keywords: /\b(recipe|cook|요리|레시피)\b/i, category: '라이프' },
  { keywords: /\b(travel|여행|관광)\b/i, category: '라이프' },
];

function hostnameOf(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function pathnameOf(url: string): string {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    return new URL(normalized).pathname.toLowerCase();
  } catch {
    return '';
  }
}

function uniq(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const key = item.trim();
    if (!key) continue;
    const lowered = key.toLowerCase();
    if (seen.has(lowered)) continue;
    seen.add(lowered);
    out.push(key);
  }
  return out;
}

export function classifyLink(url: string, meta: MetaSignal = {}): ClassificationResult {
  const host = hostnameOf(url);
  const path = pathnameOf(url);
  const corpus = [url, host, path, meta.title ?? '', meta.description ?? ''].join(' ').toLowerCase();

  let category = '기타/미분류';
  const tags: string[] = [];

  // 1. Domain match
  for (const rule of DOMAIN_RULES) {
    if (rule.match.test(host)) {
      category = rule.category;
      tags.push(...rule.tags);
      break;
    }
  }

  // 2. Path hints — only override if we still have no category
  if (category === '기타/미분류') {
    for (const rule of PATH_KEYWORDS) {
      if (rule.match.test(path)) {
        category = rule.category;
        tags.push(...rule.tags);
        break;
      }
    }
  } else {
    for (const rule of PATH_KEYWORDS) {
      if (rule.match.test(path)) {
        tags.push(...rule.tags);
        break;
      }
    }
  }

  // 3. Keyword-based tags from title/description/url
  for (const rule of KEYWORD_TAGS) {
    if (rule.keywords.test(corpus)) tags.push(rule.tag);
  }

  // 4. AI/career/lifestyle overrides based on content
  if (category === '기타/미분류') {
    for (const rule of CATEGORY_OVERRIDES) {
      if (rule.keywords.test(corpus)) {
        category = rule.category;
        break;
      }
    }
  }

  // Default fallback tag
  const finalTags = uniq(tags.length > 0 ? tags : ['스크랩']);
  return { category, tags: finalTags.slice(0, 6) };
}

export function buildAutoDescription(url: string, meta: MetaSignal): string {
  if (meta.description && meta.description.trim().length > 0) {
    return meta.description.trim().slice(0, 240);
  }
  const host = hostnameOf(url) || '웹사이트';
  if (meta.title && meta.title.trim().length > 0) {
    return `${host} — ${meta.title.trim()}`.slice(0, 240);
  }
  return `${host} 에서 수집한 링크입니다.`;
}

export function buildAutoTitle(url: string, meta: MetaSignal): string {
  if (meta.title && meta.title.trim().length > 0) return meta.title.trim().slice(0, 160);
  const host = hostnameOf(url);
  const path = pathnameOf(url).replace(/\/$/, '');
  if (host && path && path !== '') {
    const lastSeg = path.split('/').filter(Boolean).pop() ?? '';
    if (lastSeg) return `${host} · ${decodeURIComponent(lastSeg).replace(/[-_]/g, ' ')}`.slice(0, 160);
  }
  return host || url.slice(0, 160);
}
