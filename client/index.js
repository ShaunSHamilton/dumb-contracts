import Web3 from "../web3/index.js";
import idl from "../web3/idl.json" assert { type: "json" };

const web3 = new Web3("http://localhost:3030");
await web3.setClientAddress("shaun");
const smartContract = web3.createSmartContract(idl);

const btn = document.getElementById("btn");
const a = document.getElementById("a");
const b = document.getElementById("b");
const resDiv = document.getElementById("res");

btn.addEventListener("click", () => {
  add(Number(a.value), Number(b.value));
});

async function add(a, b) {
  const res = await smartContract.add(a, b);
  resDiv.innerHTML = res;
}

const accountBtn = document.getElementById("account");
const balDiv = document.getElementById("bal");
const acc = document.getElementById("acc");
accountBtn.addEventListener("click", async () => {
  const balance = await web3.getBalance(acc.value);
  balDiv.innerHTML = balance;
});

const fac = document.getElementById("fac");
const facBtn = document.getElementById("facBtn");
facBtn.addEventListener("click", () => {
  expense(Number(fac.value));
});

async function expense(a) {
  const res = await smartContract.expense(a);
  resDiv.innerHTML = res;
}
