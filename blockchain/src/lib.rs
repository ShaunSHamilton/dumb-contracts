pub mod account;
pub mod block;
pub mod chain;
pub mod smart_contract;

use block::Data;
use serde::{Deserialize, Serialize};
use serde_json;
use sha2::{Digest, Sha256};
use smart_contract::SmartContract;
use wasm_bindgen::prelude::*;
// use web_sys::console;

pub static DIFFICULTY_PREFIX: &str = "0";

#[derive(Serialize, Deserialize, Debug)]
pub struct Transfer {
    pub from: String,
    pub to: String,
    pub amount: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Transactions {
    AddAccount(String),
    AddSmartContract(SmartContract),
    Transfer(Transfer),
}

#[wasm_bindgen]
pub fn mine_block(transactions: JsValue) -> Result<(), JsError> {
    let transactions: Vec<Transactions> = transactions.into_serde()?;
    for _transaction in transactions {}
    Ok(())
}

// #[wasm_bindgen]
// pub fn transact(data: JsValue) -> Result<(), JsError> {
//     let transaction: Transactions = data.into_serde()?;
//     // console::log_1(&format!("{:?}", transaction).into());
//     // Append `transaction` to `../../transactions.json`
//     let transactions_file = std::fs::read_to_string("../../transactions.json")?;
//     console::log_1(&format!("{:?}", transactions_file).into());
//     let mut transactions: Vec<Transactions> = serde_json::from_str(&transactions_file)?;
//     transactions.push(transaction);
//     let transactions = serde_json::to_string(&transactions)?;
//     std::fs::write("../../transactions.json", transactions)?;
//     Ok(())
// }

//---------------------

/// Takes a hash slice, and returns the binary representation.
pub fn hash_to_binary(hash: &[u8]) -> String {
    let mut res: String = String::default();
    for c in hash {
        res.push_str(&format!("{:b}", c));
    }
    res
}

/// Uses `Sha256` to calculate the hash from a `serde_json::Value` of the input arguments.
pub fn calculate_hash(
    data: &Data,
    id: u64,
    nonce: u64,
    previous_id: &u64,
    timestamp: u64,
) -> Vec<u8> {
    let data = serde_json::json!({
        "id": id,
        "previous_id": previous_id,
        "data": data,
        "timestamp": timestamp,
        "nonce": nonce,
    });
    let mut hasher = Sha256::new();
    hasher.update(data.to_string().as_bytes());
    hasher.finalize().as_slice().to_owned()
}
