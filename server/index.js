// Server to handle all requests on `http://localhost:3030`
import { readFile } from "fs/promises";
import { dirname, extname, join } from "path";
import http from "http";
import { WebSocketServer } from "ws";
import logover, { debug, error, info, warn } from "logover";

logover({ level: "debug", trace: ["debug", "info", "warn", "error"] });

const CONNECTED_NODES = [];

async function handleRequest(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (data) => {
      body += data;
    });
    req.on("end", () => {
      resolve(body);
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
}

async function subscribeToEvent(event, requestId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timeout"));
    }, 30000);
    CONNECTED_NODES.forEach((node) => {
      node.on("message", (rawData) => {
        const message = JSON.parse(rawData);
        if (message.event === event && message.requestId === requestId) {
          clearTimeout(timeout);
          resolve(message.data.result);
        }
      });
    });
  });
}

const requests = {
  "/call-smart-contract": async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    // Get the body
    const body = await handleRequest(req);
    broadcast("call-smart-contract", body, req.id);
    // Await node response with request id
    const response = await subscribeToEvent(
      "call-smart-contract-result",
      req.id
    );
    debug("Got response:", response);
    return res.end(JSON.stringify({ result: response }));
  },
  "/get-balance": async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    const body = await handleRequest(req);

    broadcast("get-balance", body, req.id);
    // Await node response with request id
    const response = await subscribeToEvent("get-balance-result", req.id);
    debug("Got response:", response);
    return res.end(JSON.stringify({ result: response }));
  },
  "/create-account": async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    const body = await handleRequest(req);

    broadcast("create-account", body, req.id);
    const response = await subscribeToEvent("create-account-result", req.id);
    debug("Got response:", response);
    return res.end(JSON.stringify({ result: response }));
  },
  "/get-account": async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    const body = await handleRequest(req);

    broadcast("get-account", body, req.id);
    const response = await subscribeToEvent("get-account-result", req.id);
    debug("Got response:", response);
    return res.end(JSON.stringify({ result: response }));
  },
  "/deploy": async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    const body = await handleRequest(req);

    broadcast("deploy", body, req.id);
    const response = await subscribeToEvent("deploy-result", req.id);
    debug("Got response:", response);
    return res.end(JSON.stringify({ result: response }));
  },
  "/airdrop": async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    const body = await handleRequest(req);

    broadcast("airdrop", body, req.id);
    const response = await subscribeToEvent("airdrop-result", req.id);
    debug("Got response:", response);
    return res.end(JSON.stringify({ result: response }));
  },
  "/transfer": async (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    const body = await handleRequest(req);

    broadcast("transfer", body, req.id);
    const response = await subscribeToEvent("transfer-result", req.id);
    debug("Got response:", response);
    return res.end(JSON.stringify({ result: response }));
  },
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);

  const requestId = Date.now();
  req.id = requestId;
  const outcome = requests?.[req.url]?.(req, res);

  if (outcome) return;

  const baseToClient = dirname("");
  let filePath = join(baseToClient, req.url);
  if (req.url === "/") {
    filePath = "client/index.html";
  }

  const ext = String(extname(filePath)).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "application/font-woff",
    ".ttf": "application/font-ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "application/font-otf",
    ".wasm": "application/wasm",
  };

  const contentType = mimeTypes[ext] || "application/octet-stream";

  try {
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content, "utf-8");
  } catch (error) {
    if (error.code == "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404", "utf-8");
    } else {
      res.writeHead(500);
      res.end(
        "Sorry, check with the site admin for error: " + error.code + " ..\n"
      );
    }
  }
});

// Create a WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const nodeId = req.headers["sec-websocket-protocol"];
  ws.id = nodeId;
  info(`Connected to node: ${nodeId}`);
  CONNECTED_NODES.push(ws);

  ws.on("message", (rawData) => {
    const message = JSON.parse(rawData);
    debug(message);
    handleEvent(message.event, message.data);
  });

  ws.on("error", (err) => {
    error(err);
    CONNECTED_NODES.splice(CONNECTED_NODES.indexOf(ws), 1);
  });

  ws.on("close", () => {
    warn(`Connection closed: ${nodeId}`);
    CONNECTED_NODES.splice(CONNECTED_NODES.indexOf(ws), 1);
  });

  broadcast(
    "new-node",
    CONNECTED_NODES.map((node) => node.id)
  );
  function send(event, data) {
    ws.send(JSON.stringify({ event, data }));
  }
});

async function broadcast(event, data, requestId) {
  CONNECTED_NODES.forEach((node) => {
    node.send(JSON.stringify({ event, data, requestId }));
  });
}

const port = 3030;
server.listen(port, () => {
  info(`Server listening on port ${port}`);
});

function handleEvent(event, data) {
  switch (event) {
    default:
      break;
  }
}
