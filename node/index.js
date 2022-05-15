import logover, { debug, info, error, warn } from "logover";
import Web3 from "../web3/index.js";
import { contract } from "./contract.js";
import { getBalance } from "./utils.js";
import mine from "./mine.js";
import { watch } from "fs";
import { readFile } from "fs/promises";
import { createAccount, getAccount } from "./account.js";
import { deploy } from "./deploy.js";
import { airdrop } from "./airdrop.js";
import { transfer, transact } from "./transactions.js";

logover({ level: "debug", trace: ["debug", "info", "warn", "error"] });

const web3 = new Web3("http://localhost:3030");

const ws = await web3.upgrade();
// const myId = ws._protocol;
ws.on("message", (rawData) => {
  const message = JSON.parse(rawData);
  debug(message);
  handleEvent(message.event, message.data, message.requestId);
});
ws.on("open", () => {
  info("Connection opened");
});
ws.on("error", (err) => {
  error(err);
});
ws.on("close", () => {
  warn("Connection to network closed");
});

const events = {
  "call-smart-contract": async (data, requestId) => {
    const { method, args, id, address } = JSON.parse(data);
    const result = await contract(id, method, args, address);
    ws.send(
      JSON.stringify({
        event: "call-smart-contract-result",
        data: { result },
        requestId,
      })
    );
  },
  "get-balance": async (data, requestId) => {
    const { address } = JSON.parse(data);
    const result = await getBalance(address);
    ws.send(
      JSON.stringify({
        event: "get-balance-result",
        data: { result },
        requestId,
      })
    );
  },
  "create-account": async (data, requestId) => {
    const { seed } = JSON.parse(data);
    const result = await createAccount(seed);
    ws.send(
      JSON.stringify({
        event: "create-account-result",
        data: { result },
        requestId,
      })
    );
  },
  "get-account": async (data, requestId) => {
    const { address } = JSON.parse(data);
    const result = await getAccount(address);
    ws.send(
      JSON.stringify({
        event: "get-account-result",
        data: { result },
        requestId,
      })
    );
  },
  deploy: async (data, requestId) => {
    const { address, byteCode } = JSON.parse(data);
    const result = await deploy(address, byteCode);
    ws.send(
      JSON.stringify({
        event: "deploy-result",
        data: { result },
        requestId,
      })
    );
  },
  airdrop: async (data, requestId) => {
    const { address, amount } = JSON.parse(data);
    const result = await airdrop(address, amount);
    ws.send(
      JSON.stringify({
        event: "airdrop-result",
        data: { result },
        requestId,
      })
    );
  },
  transfer: async (data, requestId) => {
    const { from, to, amount } = JSON.parse(data);
    const result = await transact(transfer(from, to, amount));
    ws.send(
      JSON.stringify({
        event: "transfer-result",
        data: { result },
        requestId,
      })
    );
  },
  "new-node": async (data, requestId) => {},
};
async function handleEvent(event, data, requestId) {
  events?.[event]?.(data, requestId);
}

let timesTransactionsChanged = 0;

// If `m` is pressed while the program is running, mine a new block
process.stdin.on("data", async (data) => {
  if (data.toString().trim() === "m") {
    info("Mining a new block...");
    await mine();
    info("New block mined!");
    timesTransactionsChanged = 0;
  }
});

// Watch for changes to `transactions.json`.
// If `transactions.json` changes 4 times, mine a new block.
// If `transactions.json` has changed at least 2 times, and 120 seconds have passed, mine a new block.

const interval = setInterval(async () => {
  if (timesTransactionsChanged >= 2) {
    await mine();
    timesTransactionsChanged = 0;
  }
}, 120 * 1000);

watch("./transactions.json", { interval: 1000 }, async () => {
  const transactions = await readFile("./transactions.json", "utf8");
  const transactionsCount = JSON.parse(transactions).length;
  if (transactionsCount >= 4) {
    info("Mining a new block...");
    await mine();
    info("New block mined!");
    timesTransactionsChanged = 0;
  }
  timesTransactionsChanged++;
});
