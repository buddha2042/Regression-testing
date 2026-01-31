import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Get the dynamic credentials and IDs from the request body
    const { url, token, dashboardId, widgetId, environment } = await req.json();

    // 2. Validate that the user provided the necessary connection info
    if (!url || !token || !dashboardId || !widgetId) {
      return NextResponse.json(
        { error: 'Missing connection details (URL, Token, Dashboard ID, or Widget ID)' },
        { status: 400 }
      );
    }

    // 3. Clean up the URL (remove trailing slash if exists)
    const cleanBaseUrl = url.replace(/\/$/, "");
    
    // 4. Clean up the token (ensure it doesn't have "Bearer " prefix doubled)
    const cleanToken = token.replace('Bearer ', '');

    // 5. Construct the specific Sisense Widget URL
    const apiUrl = `${cleanBaseUrl}/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`;
    
    console.log(`[Proxy Fetch] Env: ${environment} -> ${apiUrl}`);

    // 6. Execute the request to Sisense
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Do not cache results to ensure fresh QA data
    });

    // 7. Handle Sisense-specific errors
    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Sisense Error (${response.status}): ${errText || response.statusText}` },
        { status: response.status }
      );
    }

    // 8. Return the widget JSON data to your frontend
    const data = await response.json();
    return NextResponse.json({ data });

  } catch (error: any) {
    console.error('Widget Fetch Proxy Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server encountered an error reaching Sisense' },
      { status: 500 }
    );
  }
}