import { readFile, writeFile } from "fs/promises";
import { mine_block } from "../blockchain/pkg/blockchain.js";

export default async function mine() {
  try {
    const transactions = await readFile("./transactions.json", "utf8");
    const chain = await readFile("./chain.json", "utf8");
    const updatedChain = mine_block(
      JSON.parse(chain),
      JSON.parse(transactions)
    );

    await writeFile("./chain.json", JSON.stringify(updatedChain));
    await writeFile("./transactions.json", JSON.stringify([]));
  } catch (e) {
    console.error(e);
  }
}
