import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { baseUrl, token, datasource, jaql } = body;

    // 1. FIX THE URL (Routing Context)
    const urlSegment = datasource.includes('/') 
      ? datasource.split('/').pop() 
      : datasource;

    const url = `${baseUrl}/api/datasources/${encodeURIComponent(urlSegment || '')}/jaql`;

    // 2. FIX THE PAYLOAD (Data Context)
    if (jaql && jaql.metadata) {
      if (jaql.datasource && !jaql.datasource.fullname.startsWith('localhost/')) {
        jaql.datasource.fullname = `localhost/${jaql.datasource.fullname}`;
      }

      jaql.metadata = jaql.metadata.map((item: any, index: number) => {
        if (item.panel === 'categories') item.panel = 'rows';

        if (item.panel !== 'scope' && item.field) {
          item.field.index = index;
          if (item.jaql.dim) {
            item.field.id = item.jaql.dim;
          }
        }

        if (item.panel === 'rows') {
          item.jaql.pv = {
            "Visible in View>Yes": 2,
            "Aggregation>Count": 2
          };
        }

        if (item.panel === 'scope' && !item.jaql.datasource) {
          item.jaql.datasource = jaql.datasource;
        }

        return item;
      });
    }

    /* LOGGING FOR DEBUGGING */
    console.log(`EXECUTING SISENSE CALL: ${url}`);


    // 3. REAL FETCH CODE
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jaql)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("SISENSE API ERROR:", data);
      return NextResponse.json({ 
        error: data?.error?.message || "Sisense Error", 
        details: data 
      }, { status: response.status });
    }

    console.log(`SUCCESS: Received ${data?.values?.length || 0} rows.`);
    return NextResponse.json({ data });

  } catch (error: any) {
    console.error("PROXY ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}