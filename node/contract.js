// ID from arguments
import { getSmartContractById } from "./index.js";

export async function contract(id) {
  try {
    const smartContract = await getSmartContractById(id);
    const buf = Buffer.from(smartContract.byte_code);
    WebAssembly.instantiate(buf).then((wasmModule) => {
      return wasmModule.instance.exports;
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}
