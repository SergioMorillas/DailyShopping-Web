//! Tipos de error de la aplicación y su conversión a respuestas HTTP.
//!
//! [`AppError`] centraliza todos los errores posibles y los convierte
//! automáticamente en respuestas JSON con el código HTTP apropiado
//! mediante la implementación de [`axum::response::IntoResponse`].

use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

/// Error unificado de la aplicación.
///
/// Cada variante corresponde a una familia de errores HTTP.
/// Se convierte automáticamente a `Response` al ser devuelto
/// desde un handler de Axum.
#[derive(Debug, Error)]
pub enum AppError {
    /// Recurso no encontrado (404).
    #[error("{0}")]
    NotFound(String),

    /// Petición inválida — campos faltantes o datos incorrectos (400).
    #[error("{0}")]
    BadRequest(String),

    /// Credenciales inválidas o token JWT expirado / malformado (401).
    #[error("{0}")]
    Unauthorized(String),

    /// El recurso ya existe (unicidad violada) (409).
    #[error("{0}")]
    Conflict(String),

    /// Error interno del servidor (500).
    #[error("Error interno del servidor")]
    Internal(#[from] anyhow::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg.clone()),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, msg.clone()),
            AppError::Internal(err) => {
                tracing::error!("Error interno: {:?}", err);
                (StatusCode::INTERNAL_SERVER_ERROR, "Error interno del servidor".to_string())
            }
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}

/// Conversión directa desde errores de tokio-rusqlite.
impl From<tokio_rusqlite::Error> for AppError {
    fn from(err: tokio_rusqlite::Error) -> Self {
        AppError::Internal(anyhow::anyhow!(err))
    }
}
