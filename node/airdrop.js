import { transact, transfer } from "./transactions.js";

const address = process.argv[2];
const amount = process.argv[3];

if (!address) {
  throw new Error("No address provided");
}
if (!amount) {
  throw new Error("No amount provided");
}

await transact(transfer("0", address, amount));
