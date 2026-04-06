exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token  = process.env.NOTION_TOKEN;
  const dbId   = process.env.NOTION_DATABASE_ID;

  if (!token || !dbId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing NOTION_TOKEN or NOTION_DATABASE_ID environment variables." })
    };
  }

  let query = "";
  try {
    const body = JSON.parse(event.body || "{}");
    query = body.query || "";
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body." }) };
  }

  const notionRes = await fetch(
    `https://api.notion.com/v1/databases/${dbId}/query`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "Name",
          title: { contains: query }
        },
        page_size: 25
      })
    }
  );

  const data = await notionRes.json();

  return {
    statusCode: notionRes.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data)
  };
};
