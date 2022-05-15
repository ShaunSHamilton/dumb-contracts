use std::{collections::HashMap, fs, io::Write};

/// # CLI Blockchain
/// This is a simple blockchain CLI program.
///
/// ## Usage
///
/// ```
/// $ fcc [command]
///
/// ## Examples
///
/// $ fcc account create shaun
/// $ fcc account get shaun
/// $ fcc deploy shaun ./path-to-contract
/// $ fcc airdrop shaun 100
/// $ fcc transfer shaun tom 100
/// $ fcc config set address 0x123
/// $ fcc config get address
/// ```
use clap::{Args, Parser, Subcommand};
use reqwest::{Client, Error};
use serde::{Deserialize, Serialize};
use serde_json;
use tokio;

#[derive(Debug, Parser)]
#[clap(author, version, about)]
pub struct Cli {
    #[clap(subcommand)]
    pub command: Command,
}

#[derive(Debug, Subcommand)]
pub enum Command {
    #[clap(name = "account", about = "Create a new account.")]
    Account(Account),
    #[clap(name = "deploy", about = "Deploy a new contract.")]
    Deploy(Deploy),
    #[clap(name = "airdrop", about = "Airdrop tokens to an account.")]
    Airdrop(Airdrop),
    #[clap(
        name = "transfer",
        about = "Transfer tokens from one account to another."
    )]
    Transfer(Transfer),
    #[clap(name = "config", about = "Set configuration options.")]
    Config(Config),
}

#[derive(Debug, Args)]
pub struct Account {
    #[clap(subcommand)]
    pub command: AccountCommand,
}

#[derive(Debug, Args)]
pub struct Deploy {
    /// The address of the owner of the contract.
    pub address: String,
    /// The path to the contract.
    ///
    /// The path should be relative to the current working directory, and point to the directory containing the Rust library.
    pub path: String,
}

#[derive(Debug, Args)]
pub struct Airdrop {
    /// The address of the account to airdrop tokens to.
    pub address: String,
    /// The amount of tokens to airdrop.
    pub amount: u64,
}

#[derive(Debug, Args)]
pub struct Transfer {
    /// The address of the account to transfer tokens from.
    pub from: String,
    /// The address of the account to transfer tokens to.
    pub to: String,
    /// The amount of tokens to transfer.
    pub amount: u64,
}

#[derive(Debug, Args)]
pub struct Config {
    #[clap(subcommand)]
    pub command: ConfigCommand,
}

#[derive(Debug, Subcommand)]
pub enum AccountCommand {
    #[clap(name = "create", about = "Create a new account.")]
    Create(Create),
    #[clap(name = "get", about = "Get an account.")]
    Get(Get),
}

#[derive(Debug, Subcommand)]
pub enum ConfigCommand {
    #[clap(name = "set", about = "Set configuration options.")]
    Set(Set),
    #[clap(name = "get", about = "Get configuration options.")]
    Get(ConfigGet),
}

#[derive(Debug, Args)]
pub struct Set {
    /// The configuration option to set.
    property: String,
    /// The value to set the configuration option to.
    value: String,
}

#[derive(Debug, Args)]
pub struct Create {
    /// The seed phrase to use to create the account.
    pub seed: String,
}

#[derive(Debug, Args)]
pub struct Get {
    /// The address of the account to get.
    address: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConfigOptions {
    address: String,
    network: String,
}

#[derive(Debug, Args)]
pub struct ConfigGet {
    /// The configuration property to get.
    ///
    /// Possible values:
    /// * `address`: The address of the account.
    /// * `network`: The network set.
    property: String,
}

// #[derive(Debug)]
// enum CliError {
//     Timeout,
// }

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Error> {
    let network_url = get_config_option(&ConfigGet {
        property: "network".to_string(),
    })
    .unwrap_or("http://localhost:3030".to_string());
    let client = Client::new();
    let args = Cli::parse();
    let result = match args.command {
        Command::Account(account) => match account.command {
            AccountCommand::Create(create) => {
                println!("Creating account...");

                let mut map = HashMap::new();
                map.insert("seed", create.seed);
                let response = client
                    .post(format!("{}/create-account", network_url))
                    .json(&map)
                    .send()
                    .await;

                match response {
                    Ok(response) => {
                        let body = response.text().await?;
                        println!("{}", body);
                        Ok(())
                    }
                    Err(err) => Err(err),
                }
            }
            AccountCommand::Get(get) => {
                println!("Getting account {}...", get.address);

                let mut map = HashMap::new();
                map.insert("address", get.address);
                let response = client
                    .post(format!("{}/get-account", network_url))
                    .json(&map)
                    .send()
                    .await;

                match response {
                    Ok(response) => {
                        let body = response.text().await?;
                        println!("{}", body);
                        Ok(())
                    }
                    Err(err) => Err(err),
                }
            }
        },
        Command::Deploy(deploy) => {
            println!("Deploying contract {}...", deploy.address);

            let mut map = HashMap::new();
            map.insert("address", deploy.address);

            // Get name of deepest folder in path
            let path = deploy.path.clone();
            let last_slash = path.rfind('/').unwrap();
            let mut last_dot = path.rfind('.').unwrap();
            if last_slash > last_dot {
                last_dot = last_slash;
            }
            let contract_name = path[last_dot + 1..].to_string();
            let path_to_wasm = format!("{}/pkg/{}_bg.wasm", path, contract_name);
            let byte_code = fs::read_to_string(path_to_wasm).unwrap();
            map.insert("byte_code", byte_code);
            let response = client
                .post(format!("{}/deploy", network_url))
                .json(&map)
                .send()
                .await;

            match response {
                Ok(response) => {
                    let body = response.text().await?;
                    println!("{}", body);
                    Ok(())
                }
                Err(err) => Err(err),
            }
        }
        Command::Airdrop(airdrop) => {
            println!(
                "Airdropping {} tokens to {}...",
                airdrop.amount, airdrop.address
            );

            let mut map = HashMap::new();
            map.insert("address", airdrop.address);
            map.insert("amount", airdrop.amount.to_string());
            let response = client
                .post(format!("{}/airdrop", network_url))
                .json(&map)
                .send()
                .await;

            match response {
                Ok(response) => {
                    let body = response.text().await?;
                    println!("{}", body);
                    Ok(())
                }
                Err(err) => Err(err),
            }
        }
        Command::Transfer(transfer) => {
            println!(
                "Transferring {} tokens from {} to {}...",
                transfer.amount, transfer.from, transfer.to
            );

            let mut map = HashMap::new();
            map.insert("from", transfer.from);
            map.insert("to", transfer.to);
            map.insert("amount", transfer.amount.to_string());
            let response = client
                .post(format!("{}/transfer", network_url))
                .json(&map)
                .send()
                .await;

            match response {
                Ok(response) => {
                    let body = response.text().await?;
                    println!("{}", body);
                    Ok(())
                }
                Err(err) => Err(err),
            }
        }
        Command::Config(config) => match config.command {
            ConfigCommand::Set(set) => {
                let res = set_config_option(&set);
                match res {
                    Ok(()) => {
                        println!("Set {:?} to {:?}", set.property, set.value);
                        Ok(())
                    }
                    Err(err) => {
                        println!("\nError setting config:\n{}\n", err);
                        Ok(())
                    }
                }
            }
            ConfigCommand::Get(get) => {
                let config_options = get_config_option(&get);
                match config_options {
                    Ok(config_options) => {
                        println!("\n{}: {:?}\n", get.property, config_options);
                        Ok(())
                    }
                    Err(err) => {
                        println!("\nError: Could not get config file:\n{}\n", err);
                        Ok(())
                    }
                }
            }
        },
    };

    if let Err(err) = result {
        println!("{}", err);
        Err(err)
    } else {
        Ok(())
    }
}

const CONFIG_FILE: &str = "./fcc-config.json";

fn get_config_option(config_option: &ConfigGet) -> Result<String, std::io::Error> {
    // Read the config file
    match fs::read_to_string(CONFIG_FILE) {
        Ok(config_file) => {
            let config: ConfigOptions = serde_json::from_str(&config_file).unwrap();

            match config_option.property.as_str() {
                "address" => Ok(config.address),
                "network" => Ok(config.network),
                _ => {
                    println!("Invalid property");
                    return Err(std::io::Error::new(
                        std::io::ErrorKind::Other,
                        "Invalid property",
                    ));
                }
            }
        }
        Err(e) => Err(e),
    }
}

fn set_config_option(config_option: &Set) -> Result<(), std::io::Error> {
    // Write the config file
    let mut config = ConfigOptions {
        address: "".to_string(),
        network: "".to_string(),
    };
    if let Ok(config_file) = fs::read_to_string(CONFIG_FILE) {
        let existing_options: ConfigOptions = serde_json::from_str(&config_file).unwrap();
        config = existing_options;
    }

    match config_option.property.as_str() {
        "address" => config.address = config_option.value.clone(),
        "network" => config.network = config_option.value.clone(),
        _ => println!("Error: Invalid config option"),
    };

    let mut config_file = fs::File::create(CONFIG_FILE)?;
    let config_string = serde_json::to_string(&config).unwrap();
    config_file.write_all(config_string.as_bytes()).unwrap();

    Ok(())
}
