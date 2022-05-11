import { getChain } from "./contract.js";

export async function getBalance(address) {
  const chain = await getChain();
  for (let i = chain.length - 1; i >= 0; i--) {
    const block = chain[i];
    const account = block.data.accounts.find(
      (account) => account.address === address
    );
    if (account) {
      return account.balance;
    }
  }
  return "Address not found";
}
