import Web3 from "web3";

const web3 = new Web3("http://localhost:8545");

web3.extend({
  property: "fcc",
  methods: [
    {
      name: "getBalance",
      call: "get_balance",
      params: 2,
      inputFormatter: [web3.utils.toHex, web3.utils.toHex],
      outputFormatter: web3.utils.toDecimal,
    },
  ],
});

export default web3;
