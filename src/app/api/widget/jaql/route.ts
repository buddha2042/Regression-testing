import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Use AbortController to prevent the server from hanging on long Sisense queries
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

  try {
    const body = await req.json();
    let { baseUrl, token, datasource, jaql } = body;

    // 1. DATA SOURCE CLEANING (For URL path)
    // Strips "localhost/" to turn "localhost/MyDS" into "MyDS"
    const urlSegment = datasource.includes('/') 
      ? datasource.split('/').pop() 
      : datasource;

    // 2. CONSTRUCT ENDPOINT
    const encodedDs = encodeURIComponent(urlSegment || '');
    const url = `${baseUrl}/api/datasources/${encodedDs}/jaql`;

    // 3. PAYLOAD TRANSFORMATION
    // Ensures the JAQL matches Sisense's specific execution requirements
    if (jaql && jaql.metadata) {
      // Body fullname usually requires "localhost/" prefix
      if (jaql.datasource && !jaql.datasource.fullname.startsWith('localhost/')) {
        jaql.datasource.fullname = `localhost/${jaql.datasource.fullname}`;
      }

      jaql.metadata = jaql.metadata.map((item: any, index: number) => {
        // Map UI panel names to Sisense execution engine panel names
        if (item.panel === 'categories') item.panel = 'rows';
        
        // Ensure field mapping is correct for execution results
        if (item.panel !== 'scope' && item.field) {
          item.field.index = index;
          if (item.jaql?.dim) {
            item.field.id = item.jaql.dim;
          }
        }

        // Add 'pv' (Pivot View) hints: This forces the engine to calculate 
        // the query as a data table result, preventing 0-row "hanging" responses.
        if (item.panel === 'rows' && item.jaql) {
          item.jaql.pv = {
            "Visible in View>Yes": 2,
            "Aggregation>Count": 2
          };
        }

        // Ensure filters (scope) carry the datasource context
        if (item.panel === 'scope' && item.jaql && !item.jaql.datasource) {
          item.jaql.datasource = jaql.datasource;
        }

        return item;
      });
    }

    console.log(`[SISENSE PROXY] Fetching data: ${url}`);

    // 4. EXECUTE REQUEST
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jaql),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // 5. HANDLE NON-JSON RESPONSES (Sisense 404s/504s often return HTML)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("[SISENSE PROXY] Non-JSON Response received:", errorText.substring(0, 200));
      return NextResponse.json(
        { error: "Sisense returned an invalid format (check your Base URL or Datasource Name)." }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("[SISENSE PROXY] API Error:", JSON.stringify(data.error || data, null, 2));
      return NextResponse.json({ 
        error: data?.error?.message || data?.message || "Sisense Execution Error", 
        details: data 
      }, { status: response.status });
    }

    console.log(`[SISENSE PROXY] Success: Received ${data?.values?.length || 0} rows.`);
    return NextResponse.json({ data });

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error("[SISENSE PROXY] Request Timed Out after 45s");
      return NextResponse.json({ error: "Sisense query timed out (Request took too long)." }, { status: 504 });
    }

    console.error("[SISENSE PROXY] Critical Failure:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}