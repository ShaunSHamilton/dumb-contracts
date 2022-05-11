import logover, { debug, info, error, warn } from "logover";
import Web3 from "../web3/index.js";
import { contract } from "./contract.js";
import { getBalance } from "./utils.js";
import mine from "./mine.js";

logover({ level: "debug" });

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
  "new-node": async (data, requestId) => {},
};
async function handleEvent(event, data, requestId) {
  events?.[event]?.(data, requestId);
}

// If `m` is pressed while the program is running, mine a new block
process.stdin.on("data", async (data) => {
  if (data.toString().trim() === "m") {
    info("Mining a new block...");
    await mine();
    info("New block mined!");
  }
});
