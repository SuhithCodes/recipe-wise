import fetch from 'node-fetch';

async function testMcp() {
  console.log("Sending tools/list request to MCP Server...");
  
  const response = await fetch('http://localhost:3000/api/mcp/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'local-dev-api-key-12345',
      'Accept': 'application/json, text/event-stream'
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    })
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response Body:", text);
}

testMcp();
