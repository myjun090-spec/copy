export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  stargazers_count: number;
  language: string;
  owner?: { login: string };
}

export interface GithubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  content?: string;
  download_url: string | null;
}

export async function fetchUserRepos(token: string): Promise<GithubRepo[]> {
  try {
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('GitHub API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
}

export async function fetchRepoContents(token: string, owner: string, repo: string, path: string = ''): Promise<GithubContent[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch contents');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching repo contents:', error);
    return [];
  }
}

export async function fetchFileRaw(downloadUrl: string): Promise<string> {
  try {
    const response = await fetch(downloadUrl);
    return await response.text();
  } catch (error) {
    console.error('Error fetching raw file:', error);
    return '';
  }
}

export interface RepoReadme {
  content: string;
  encoding: string;
}

export async function fetchRepoReadme(token: string, owner: string, repo: string): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3.raw',
      },
    });
    if (!response.ok) return '';
    return await response.text();
  } catch (error) {
    console.error('Error fetching README:', error);
    return '';
  }
}

export interface RepoLanguages {
  [language: string]: number;
}

export async function fetchRepoLanguages(token: string, owner: string, repo: string): Promise<RepoLanguages> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!response.ok) return {};
    return await response.json();
  } catch (error) {
    console.error('Error fetching languages:', error);
    return {};
  }
}
