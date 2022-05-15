import { transact } from "./transactions.js";
import { addSmartContract } from "./transactions.js";

export async function deploy(contractOwner, byteCode) {
  try {
    await transact(
      addSmartContract({
        byte_code: byteCode.toJSON().data,
        base_account: contractOwner,
      })
    );
  } catch (e) {
    console.error(e);
  }
}
