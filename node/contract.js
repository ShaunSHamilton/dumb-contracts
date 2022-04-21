// ID from arguments
import { getSmartContractById } from "./index.js";

// const ID = Number(process.argv[2]);
const num1 = Number(process.argv[3]);
const num2 = Number(process.argv[4]);

async function contract(id) {
  // Get contract from chain
  try {
    const smartContract = await getSmartContractById(id);
    // console.log(smartContract);
    const buf = Buffer.from(smartContract.byte_code);
    WebAssembly.instantiate(buf).then((wasmModule) => {
      const start = performance.now();
      for (let i = 0; i < 999999999; i++) {
        wasmModule.instance.exports.add(num1, num2);
      }
      const end = performance.now();
      console.log(`Contract: ${(end - start) / 1000} seconds.`);
    });
  } catch (e) {
    console.error(e);
  }
}

// contract(0);
// contract(1);

const start = performance.now();
for (let i = 0; i < 999999999; i++) {
  num1 + num2;
}
const end = performance.now();
console.log(`Contract: ${(end - start) / 1000} seconds.`);
