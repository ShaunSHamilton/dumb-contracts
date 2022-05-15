import { transact, addAccount } from "./transactions.js";
import { createHash } from "crypto";
import { getChain } from "./contract.js";

export async function createAccount(seed) {
  const address = generateAddressFromSeed(seed);
  try {
    await transact(addAccount(address));
    return address;
  } catch (e) {
    console.error(e);
  }
}

export async function getAccount(address) {
  const chain = await getChain();
  for (let i = chain.length - 1; i >= 0; i--) {
    const block = chain[i];
    const account = block.data.accounts.find(
      (account) => account.address === address
    );
    if (account) {
      return account;
    }
  }
  return null;
}

function generateAddressFromSeed(seed) {
  const hash = createHash("sha256");
  hash.update(seed);
  const digest = hash.digest("hex");
  return digest.substring(0, 40);
}
