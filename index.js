const express = require("express");
const {
  initClient,
  getQR,
  getClient,
  getStatus
} = require("./client");
const qrcode = require("qrcode");

const app = express();
app.use(express.json());

const PORT = 5000;

// ✅ Start the WhatsApp client manually
app.post("/start-client", (req, res) => {
  const result = initClient();
  res.json(result);
});

// 🔍 Get QR code (if available)
app.get("/generate-qr", async (req, res) => {
  const qr = getQR();
  if (!qr) {
    return res.json({ success: false, message: "QR not available or client is ready." });
  }

  try {
    const qrImage = await qrcode.toDataURL(qr);
    res.json({ success: true, qr: qrImage });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to generate QR", error: err });
  }
});

app.get("/gen-qr", async (req, res) => {
    const qr = getQR();
    if (!qr) {
      return res.send("<h3>❌ QR not available or already authenticated.</h3>");
    }
  
    try {
      const qrImage = await qrcode.toDataURL(qr);
      const html = `
        <html>
          <head><title>Scan QR</title></head>
          <body style="text-align:center; font-family:sans-serif;">
            <h2>📱 Scan the QR Code to Login to WhatsApp</h2>
            <img src="${qrImage}" alt="QR Code" />
          </body>
        </html>
      `;
      res.send(html);
    } catch (err) {
      res.status(500).send("<h3>❌ Failed to generate QR</h3><p>" + err.message + "</p>");
    }
  });
  

// ✉️ Send message (only if client is ready)
app.post("/send-message", async (req, res) => {
  const client = getClient();
  const status = getStatus();

  
  if (!client) {
    console.error("❌ Client is null or undefined.");
    return res.status(500).json({ success: false, message: "WhatsApp client is not initialized" });
  }

  // if (!status.ready) {
  //   return res.status(400).json({ success: false, message: "Client not ready." });
  // }

  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ success: false, message: "Missing number or message" });
  }

  try {
    await client.sendMessage(`${number}@c.us`, message);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔍 Client status endpoint
app.get("/client-status", (req, res) => {
  res.json(getStatus());
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
