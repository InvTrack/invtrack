const http = require("http");
const fs = require("fs");
// run this script from the directory it's in, otherwise the paths get messed up

const invoiceData = fs.readFileSync("./sales-raport-example.json");
const invoice = JSON.parse(invoiceData);

const options = {
  hostname: "127.0.0.1",
  port: 54321,
  path: "/functions/v1/process-sales-raport",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
  },
};

const req = http.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    fs.writeFile("./sales-raport-response.json", data, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
  });
});

req.on("error", (error) => {
  console.error(error);
});

req.write(JSON.stringify(invoice));
req.end();
