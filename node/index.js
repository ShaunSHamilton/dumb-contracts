import fs from "fs/promises";
import * as blockchain from "../blockchain/pkg/blockchain.js";
import web3 from "../web3/index.js";
import http from "http";
import { WebSocketServer } from "ws";

const server = http.createServer();

web3.setProvider(server);

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  // web3.shh.subscribe(
  //   "messages",
  //   {
  //     symKeyID: "a",
  //     sig: "0x0",
  //     ttl: 200000,
  //     topics: ["chain"],
  //     minPow: 0.8,
  //   },
  //   function (error, message, subscription) {
  //     console.log("Error: ", error);
  //     console.log("Message: ", message);
  //     console.log("Subscription: ", subscription);
  //   }
  // );
  web3.shh.net.isListening((a, b) => {
    console.log(a, b);
    console.log("Listening to the whisper protocol");
  });
  ws.on("message", (message) => {
    console.log("received: %s", message);
    // If message is to run a smart contract, do so, and add fee to the transactionPool
  });

  ws.on("error", (error) => {
    console.error(error);
  });
  ws.on("close", () => {
    console.warn("Connection closed");
  });

  ws.send("connected");
});

export async function getChain() {
  // Open chain from ./chain.json
  const chain = await fs.readFile("./chain.json", "utf8");
  return JSON.parse(chain);
}
export async function getSmartContractById(id) {
  const chain = await getChain();
  for (let i = chain.length - 1; i >= 0; i--) {
    const block = chain[i];
    const smartContract = block.data.smart_contracts.find(
      (smartContract) => smartContract.id === id
    );
    if (smartContract) {
      return smartContract;
    }
  }
  return null;
}

export async function transact(data) {
  const transactionsFile = await fs.readFile("./transactions.json", "utf8");
  const transactions = JSON.parse(transactionsFile);
  transactions.push(data);
  await fs.writeFile("./transactions.json", JSON.stringify(transactions));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});
