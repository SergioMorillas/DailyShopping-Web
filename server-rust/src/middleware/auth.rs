//! Extractor de autenticación JWT para Axum.
//!
//! Define [`Claims`] (payload del token) y [`AuthUser`], un extractor
//! `FromRequestParts` que valida el token Bearer del header `Authorization`
//! y proporciona el `user_id` a los handlers protegidos.
//!
//! # Uso en handlers
//! ```rust,ignore
//! async fn handler(auth: AuthUser, /* ... */) -> Result<impl IntoResponse, AppError> {
//!     let user_id = auth.user_id;
//!     // ...
//! }
//! ```

use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, HeaderMap},
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use crate::errors::AppError;

/// Payload del token JWT.
///
/// El campo `userId` coincide con el nombre utilizado por el backend Node.js
/// para garantizar compatibilidad con tokens existentes.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    /// Identificador del usuario en la base de datos.
    #[serde(rename = "userId")]
    pub user_id: i64,
    /// Unix timestamp de expiración.
    pub exp: usize,
}

/// Extractor que valida el JWT y expone el `user_id` al handler.
///
/// Se extrae del header `Authorization: Bearer <token>`.
/// Devuelve [`AppError::Unauthorized`] si el token falta, está malformado
/// o ha expirado.
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: i64,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let jwt_secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "daily-shopping-secret-dev".to_string());

        let token = extract_bearer_token(&parts.headers)
            .ok_or_else(|| AppError::Unauthorized("Token requerido".to_string()))?;

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(jwt_secret.as_bytes()),
            &Validation::new(Algorithm::HS256),
        )
        .map_err(|_| AppError::Unauthorized("Token inválido".to_string()))?;

        Ok(AuthUser { user_id: token_data.claims.user_id })
    }
}

/// Extrae el token Bearer del header `Authorization`.
///
/// Retorna `None` si el header no existe o no comienza con `"Bearer "`.
fn extract_bearer_token(headers: &HeaderMap) -> Option<&str> {
    let header = headers.get("Authorization")?.to_str().ok()?;
    header.strip_prefix("Bearer ")
}
