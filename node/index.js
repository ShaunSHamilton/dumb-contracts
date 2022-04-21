import fs from "fs/promises";

async function test() {
  // import { mine_block } from "../blockchain/pkg/blockchain.js";

  const smartContractByteCodeFromBlockchain = await getSmartContractById(0)
    .byte_code;
  WebAssembly.instantiate(smartContractByteCodeFromBlockchain).then(
    (wasmModule) => {
      console.log(wasmModule);
    }
  );
}
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
