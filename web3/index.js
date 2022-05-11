export default class Web3 {
  constructor(provider) {
    this.provider = new URL(provider);
    this.network = null;
    this.wss = null;
    this.rpc = null;
    this.address = null;
  }
  async setClientAddress(address) {
    this.address = address;
  }
  /**
   * Upgrade HTTP connection to WebSocket connection
   */
  async upgrade() {
    const WebSocket = (await import("ws")).WebSocket;
    return new Promise((resolve, reject) => {
      const id = Math.random().toString();
      try {
        const wsAddress = `ws://${this.provider.hostname}:${this.provider.port}`;
        const ws = new WebSocket(wsAddress, id);
        this.network = ws;
        resolve(ws);
      } catch (err) {
        reject(err);
      }
    });
  }
  async call(rpcCall) {
    try {
      const response = await fetch(`${this.provider.href}call-smart-contract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...rpcCall, address: this.address }),
      });
      return (await response.json()).result;
    } catch (err) {
      console.log(err);
    }
  }
  // Init rpc with given IDL
  createSmartContract(idl) {
    const smartContract = {};
    for (const instruction of idl.instructions) {
      smartContract[instruction.handle] = async (...args) => {
        const rpcCall = {
          version: idl.version,
          method: instruction.handle,
          args,
          id: idl.id,
        };
        return await this.call(rpcCall);
      };
    }
    return smartContract;
  }
  async getBalance(address) {
    try {
      const response = await fetch(`${this.provider.href}get-balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: address || this.address }),
      });
      return (await response.json()).result;
    } catch (err) {
      console.log(err);
    }
  }
}
