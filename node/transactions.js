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
