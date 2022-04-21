import fs from "fs/promises";
import { transact } from "./index.js";
import { addSmartContract } from "./transactions.js";

const CONTRACT_OWNER = process.argv[2];
const PATH_TO_CONTRACT = process.argv[3];

if (!CONTRACT_OWNER) {
  throw new Error("No contract owner provided");
}
if (!PATH_TO_CONTRACT) {
  throw new Error("No path to contract provided");
}

console.log(`🔵 Deploying '${PATH_TO_CONTRACT}' as ${CONTRACT_OWNER}`);

try {
  const byteCode = await fs.readFile(PATH_TO_CONTRACT);
  transact(
    addSmartContract({
      byte_code: byteCode.toJSON().data,
      base_account: CONTRACT_OWNER,
    })
  );
  console.log(`✅ Deployed ${PATH_TO_CONTRACT}`);
} catch (e) {
  console.log(`❌ Failed to deploy ${PATH_TO_CONTRACT}\n\n`);
  console.error(e);
}

// TODO:
/*
Need to respond with the block id
Block id can be used to get the id of the smart contract, once the block has been mined which added the smart contract to the chain
*/
