import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url, token, widgetMetadata } = await req.json();

    const datasourceId = widgetMetadata.datasource.id;
    const panels = widgetMetadata.metadata.panels;

    // Construct the JAQL Body
    const jaqlBody = {
      datasource: datasourceId,
      metadata: panels.flatMap((p: any) => p.items),
      settings: { count: 1000 }
    };

    const cleanBaseUrl = url.replace(/\/$/, "");
    
    // THE FIX: Ensure method is POST and body is stringified
    const response = await fetch(`${cleanBaseUrl}/api/v1/jaql`, {
      method: 'POST', // <--- THIS MUST BE POST
      headers: {
        'Authorization': `Bearer ${token.replace('Bearer ', '')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jaqlBody), // <--- YOU MUST SEND THE QUERY
      cache: 'no-store'
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Sisense Error: ${response.status} - ${errText}` }, { status: response.status });
    }

    const result = await response.json();
    
    // 'values' contains the actual rows of data for comparison
    return NextResponse.json({ data: result.values });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}