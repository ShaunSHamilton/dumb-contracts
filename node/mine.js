import fs from "fs/promises";
import { mine_block } from "../blockchain/pkg/blockchain.js";

async function mine() {
  try {
    const transactions = await fs.readFile("./transactions.json", "utf8");
    mine_block(transactions);
  } catch (e) {
    console.error(e);
  }
}

mine();
