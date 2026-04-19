import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, {
      next: { revalidate: 3600 }, // Cache title for an hour
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch the URL');
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : null;

    if (!title) {
       // Fallback to domain
       return NextResponse.json({ title: new URL(targetUrl).hostname });
    }

    // Decode HTML entities (basic)
    const decodedTitle = title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    return NextResponse.json({ title: decodedTitle });
  } catch (err) {
    console.error('Title fetch error:', err);
    try {
      return NextResponse.json({ title: new URL(url.startsWith('http') ? url : `https://${url}`).hostname });
    } catch(e) {
      return NextResponse.json({ title: 'Unknown Website' });
    }
  }
}
