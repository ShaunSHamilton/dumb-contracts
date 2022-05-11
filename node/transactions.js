import { readFile, writeFile } from "fs/promises";

export function addAccount(address) {
  return {
    AddAccount: address,
  };
}

export function addSmartContract(smartContract) {
  return {
    AddSmartContract: smartContract,
  };
}

export function transfer(from, to, amount) {
  return {
    Transfer: {
      from,
      to,
      amount,
    },
  };
}

export async function transact(data) {
  const transactionsFile = await readFile("./transactions.json", "utf8");
  const transactions = JSON.parse(transactionsFile);
  transactions.push(data);
  await writeFile("./transactions.json", JSON.stringify(transactions));
}
