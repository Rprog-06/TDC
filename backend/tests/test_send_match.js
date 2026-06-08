const http = require("http");

const data = JSON.stringify({ customerId: 1, matchId: 1 });

const req = http.request(
  {
    hostname: "localhost",
    port: 5000,
    path: "/api/actions/send-match",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  },
  (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Response:", body);
    });
  }
);

req.on("error", (e) => console.error("Error:", e.message));
req.write(data);
req.end();
