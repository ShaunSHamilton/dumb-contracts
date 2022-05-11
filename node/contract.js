// ID from arguments
import { debug } from "logover";
import { readFile } from "fs/promises";
import { transact, transfer } from "./transactions.js";

import { nodeAddress } from "./state.js";

const MICRO_SECOND = 1000;

export async function contract(id, method, args, callerAddress) {
  try {
    const smartContract = await getSmartContractById(id);
    const buf = Buffer.from(smartContract.byte_code);
    const wasmModule = await WebAssembly.instantiate(buf);
    const start = performance.now();
    const res = wasmModule.instance.exports[method](...args);
    const end = performance.now();
    const cost = calculateCost(MICRO_SECOND * (end - start));
    debug(`Calling '${method}' cost '${cost}' tokens`);
    debug(`Result: ${res}`);
    transact(transfer(callerAddress, nodeAddress, cost));
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function calculateCost(num) {
  return Math.max(Math.round(num), 1);
}

export async function getChain() {
  // Open chain from ./chain.json
  const chain = await readFile("./chain.json", "utf8");
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
