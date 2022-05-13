# Dumb Contracts for Smart People

This repo contains a simple example of how smart contracts work at a low-level. I got tired of Googling _"how smart contracts work"_, and getting nothing but the same _high-level_ overview. So, I did it myself the way I think they work.

## Build the Blockchain

```bash
npm run build:blockchain
```

## Run the Server

```bash
npm run server
```

## Run a Node

```bash
npm run node
```

## Add an Account

```bash
fcc account create
```

## Build a Smart Contract

```bash
npm run build -- <path_to_rust_lib>
```

## Deploy a Contract

```bash
fcc deploy <account_address> <path_to_smart_contract_lib>
```

## Airdrop to an Account

```bash
fcc airdrop <account_address> <amount>
```
