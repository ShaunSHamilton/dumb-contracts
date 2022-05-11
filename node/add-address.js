import { transact, addAccount } from "./transactions.js";

const address = process.argv[2];

if (!address) {
  throw new Error("No address provided");
}

transact(addAccount(address));
