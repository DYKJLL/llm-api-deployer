use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Endpoint {
    pub path: String,
    pub method: String,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiInfo {
    pub api_address: String,
    pub api_key: Option<String>,
    pub model_id: Option<String>,
    pub provider: String,
    pub provider_version: Option<String>,
    pub endpoints: Vec<Endpoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyResult {
    pub success: bool,
    pub api_reachable: bool,
    pub model_responsive: bool,
    pub error_message: Option<String>,
}
