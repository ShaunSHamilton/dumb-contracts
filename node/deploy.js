// Deploy the dumb-contract to the blockchain.
import fs from "fs/promises";
// import { transact } from "../blockchain/pkg/blockchain.js";
import { transact } from "./index.js";
import { addSmartContract } from "./transactions.js";

try {
  const byteCode = await fs.readFile(
    "./dumb-contract/pkg/dumb_contract_bg.wasm"
  );
  transact(
    addSmartContract({
      byte_code: byteCode.toJSON().data,
      base_account: "Camper",
    })
  );
} catch (e) {
  console.error(e);
}

// TODO:
/*
Need to respond with the block id
Block id can be used to get the id of the smart contract, once the block has been mined which added the smart contract to the chain
*/
