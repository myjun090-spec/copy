export interface ClassificationResult {
  category: string;
  tags: string[];
}

const CATEGORY_MAP: Record<string, { category: string, tags: string[] }> = {
  'github.com': { category: '개발', tags: ['오픈소스', '개발', '코드'] },
  'stackoverflow.com': { category: '개발', tags: ['Q&A', '개발', '트러블슈팅'] },
  'npm' : { category: '개발', tags: ['라이브러리', '개발'] },
  'figma.com': { category: '디자인', tags: ['UIUX', '디자인', '기획'] },
  'dribbble.com': { category: '디자인', tags: ['레퍼런스', '디자인'] },
  'behance.net': { category: '디자인', tags: ['포트폴리오', '디자인'] },
  'youtube.com': { category: '나중에 볼 영상', tags: ['영상', '유튜브', '참고'] },
  'youtu.be': { category: '나중에 볼 영상', tags: ['영상', '유튜브', '참고'] },
  'vimeo.com': { category: '나중에 볼 영상', tags: ['영상', '참고'] },
  'velog.io': { category: '지식/블로그', tags: ['블로그', '개발지식', '참고'] },
  'medium.com': { category: '지식/블로그', tags: ['블로그', '지식', '해외아티클'] },
  'tistory.com': { category: '지식/블로그', tags: ['블로그', '참고'] },
  'brunch.co.kr': { category: '지식/블로그', tags: ['에세이', '인사이트', '블로그'] },
  'notion.so': { category: '생산성', tags: ['협업', '노트', '생산성'] },
  'slack.com': { category: '생산성', tags: ['커뮤니케이션', '협업'] },
  'trello.com': { category: '생산성', tags: ['프로젝트관리', '협업'] },
  'openai.com': { category: 'AI', tags: ['AI', 'GPT', '기술'] },
  'gemini.google.com': { category: 'AI', tags: ['AI', 'Google', '기술'] },
  'claude.ai': { category: 'AI', tags: ['AI', 'Anthropic'] },
};

const KEYWORD_MAP: Array<{ keywords: string[], result: ClassificationResult }> = [
  { keywords: ['news', 'headline', 'paper'], result: { category: '뉴스/정치', tags: ['뉴스', '정보'] } },
  { keywords: ['shopping', 'mall', 'store', 'coupang', 'naver.me'], result: { category: '쇼핑/아이템', tags: ['쇼핑', '위시리스트'] } },
  { keywords: ['dev', 'code', 'api', 'server', 'react', 'nextjs', 'python'], result: { category: '개발', tags: ['개발', '코드'] } },
  { keywords: ['design', 'ui', 'ux', 'color', 'font'], result: { category: '디자인', tags: ['디자인', '참고'] } },
  { keywords: ['money', 'invest', 'stock', 'finance'], result: { category: '재테크', tags: ['경제', '투자'] } },
];

export function classifyLink(url: string): ClassificationResult {
  const lowerUrl = url.toLowerCase();
  
  // 1. Exact domain match
  for (const domain in CATEGORY_MAP) {
    if (lowerUrl.includes(domain)) {
      return CATEGORY_MAP[domain];
    }
  }
  
  // 2. Keyword match
  for (const item of KEYWORD_MAP) {
    if (item.keywords.some(keyword => lowerUrl.includes(keyword))) {
      return item.result;
    }
  }
  
  // 3. Fallback
  return {
    category: '기타/미분류',
    tags: ['스크랩']
  };
}
