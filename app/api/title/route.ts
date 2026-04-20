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
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch');
    }

    const html = await response.text();
    
    // Scrape Title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : null;

    // Scrape Description
    let description = '';
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i) || 
                      html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i);
    if (descMatch) description = descMatch[1];

    // Scrape Image
    let image = '';
    const imgMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
    if (imgMatch) image = imgMatch[1];

    const decodedTitle = title 
      ? title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      : new URL(targetUrl).hostname;

    return NextResponse.json({ 
      title: decodedTitle,
      description: description || 'No description available',
      image: image || '/mock-image-1.jpg'
    });
  } catch {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return NextResponse.json({ 
      title: domain,
      description: 'Metadata fetch failed',
      image: '/mock-image-1.jpg'
    });
  }
}
