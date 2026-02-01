import { NextResponse } from 'next/server';

function extractComparableWidget(widget: any) {
  // Use either widget.query or widget.metadata depending on widget type
  const querySource = widget.query || widget.metadata;
  
  if (!querySource) {
    throw new Error('Invalid widget: query metadata missing');
  }

  return {
    // 1️⃣ Datasource (The logic needs to point to the same Cube name)
    datasource: {
      fullname: querySource.datasource?.fullname || widget.datasource?.fullname
    },

    // 2️⃣ Query structure (Dimensions, Measures, and Filters)
    metadata: (querySource.metadata || []).map((m: any) => ({
      panel: m.panel || 'unknown',
      jaql: {
        dim: m.jaql?.dim,
        title: m.jaql?.title,
        datatype: m.jaql?.datatype,
        aggregation: m.jaql?.aggregation,
        formula: m.jaql?.formula,
        filter: m.jaql?.filter
      }
    })),

    // 3️⃣ Results Behavior
    format: querySource.format || null,
    grandTotals: querySource.grandTotals ?? null,
    count: 1000
  };
}

export async function POST(req: Request) {
  try {
    const { url, token, dashboardId, widgetId, environment } = await req.json();

    const baseUrl = url.replace(/\/$/, '');
    const cleanToken = token.replace('Bearer ', '');
    const widgetUrl = `${baseUrl}/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`;

    const response = await fetch(widgetUrl, {
      method: 'GET',
      headers: {
        'authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Sisense Error: ${errText}` }, { status: response.status });
    }

    const widget = await response.json();
    const comparableWidget = extractComparableWidget(widget);

    return NextResponse.json({
      environment,
      widgetId,
      data: comparableWidget // This is the "Logic DNA"
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}