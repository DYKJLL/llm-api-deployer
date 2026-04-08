use crate::models::*;
use crate::utils::*;
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiInfo {
    pub api_address: String,
    pub api_key: Option<String>,
    pub model_id: Option<String>,
    pub provider: String,
    pub provider_version: Option<String>,
    pub endpoints: Vec<Endpoint>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Endpoint {
    pub path: String,
    pub method: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifyResult {
    pub success: bool,
    pub api_reachable: bool,
    pub model_responsive: bool,
    pub error_message: Option<String>,
}

#[command]
pub async fn generate_api_info() -> Result<ApiInfo, String> {
    let ollama_status = crate::commands::ollama::get_ollama_status_internal().await?;

    if !ollama_status.running {
        return Err("Ollama is not running".to_string());
    }

    let base_url = "http://localhost:11434";
    let model_status = crate::commands::monitor::get_model_status_internal().await?;

    Ok(ApiInfo {
        api_address: base_url.to_string(),
        api_key: None,
        model_id: model_status.model_id,
        provider: "ollama".to_string(),
        provider_version: ollama_status.version,
        endpoints: vec![
            Endpoint {
                path: "/api/generate".to_string(),
                method: "POST".to_string(),
                description: "Generate completion".to_string(),
            },
            Endpoint {
                path: "/api/chat".to_string(),
                method: "POST".to_string(),
                description: "Chat completion".to_string(),
            },
            Endpoint {
                path: "/api/tags".to_string(),
                method: "GET".to_string(),
                description: "List models".to_string(),
            },
        ],
    })
}

#[command]
pub async fn verify_api_info() -> Result<VerifyResult, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let health_url = "http://localhost:11434/api/tags";

    let health_response = client.get(health_url).send().await;

    match health_response {
        Ok(response) => {
            if !response.status().is_success() {
                return Ok(VerifyResult {
                    success: false,
                    api_reachable: true,
                    model_responsive: false,
                    error_message: Some(format!("Health check failed: {}", response.status())),
                });
            }

            let model_status = crate::commands::monitor::get_model_status_internal().await?;

            if let Some(model_id) = model_status.model_id {
                let test_payload = serde_json::json!({
                    "model": model_id,
                    "prompt": "Hi",
                    "stream": false
                });

                let test_response = client
                    .post("http://localhost:11434/api/generate")
                    .json(&test_payload)
                    .send()
                    .await;

                match test_response {
                    Ok(resp) => {
                        if resp.status().is_success() {
                            Ok(VerifyResult {
                                success: true,
                                api_reachable: true,
                                model_responsive: true,
                                error_message: None,
                            })
                        } else {
                            Ok(VerifyResult {
                                success: false,
                                api_reachable: true,
                                model_responsive: false,
                                error_message: Some(format!("Test request failed: {}", resp.status())),
                            })
                        }
                    }
                    Err(e) => Ok(VerifyResult {
                        success: false,
                        api_reachable: true,
                        model_responsive: false,
                        error_message: Some(format!("Test request error: {}", e)),
                    }),
                }
            } else {
                Ok(VerifyResult {
                    success: true,
                    api_reachable: true,
                    model_responsive: false,
                    error_message: Some("No model is currently running".to_string()),
                })
            }
        }
        Err(e) => Ok(VerifyResult {
            success: false,
            api_reachable: false,
            model_responsive: false,
            error_message: Some(format!("Connection failed: {}", e)),
        }),
    }
}
