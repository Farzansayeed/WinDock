import { fetchDownloadCounts } from '../lib/github-downloads.js';

export async function GET() {
  try {
    return Response.json(await fetchDownloadCounts(), {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    console.warn('Download statistics unavailable from GitHub');
    return Response.json({ error: 'Download counts are temporarily unavailable.' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
