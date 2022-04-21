use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Account {
    pub address: String,
    pub balance: u64,
}
