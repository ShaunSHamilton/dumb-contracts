import { transact, transfer } from "./transactions.js";

export async function airdrop(address, amount) {
  try {
    await transact(transfer("0", address, amount));
  } catch (e) {
    console.error(e);
  }
}
