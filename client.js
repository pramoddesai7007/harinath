const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");
const path = require("path");

let client = null;
let qrCodeData = null;
let isReady = false;

const initClient = () => {
  if (client) {
    console.log("🚫 WhatsApp client already initialized.");
    return { success: false, message: "Client already initialized." };
  }

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join("/tmp", ".wwebjs_auth")
    }),
    puppeteer: {
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  });

  client.on("qr", (qr) => {
    console.log("📱 QR Code received");
    qrCodeData = qr;
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client is ready!");
    qrCodeData = null;
    isReady = true;
  });

  client.on("auth_failure", msg => {
    console.error("❌ Auth failure:", msg);
  });

  client.initialize();

  return { success: true, message: "WhatsApp client initialization started." };
};

const getQR = () => qrCodeData;
const getClient = () => client;
const getStatus = () => ({
  initialized: !!client,
  ready: isReady,
  qrAvailable: !!qrCodeData
});

module.exports = {
  initClient,
  getQR,
  getClient,
  getStatus
};
