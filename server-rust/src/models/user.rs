//! Modelos relacionados con usuarios.
//!
//! Define las estructuras usadas tanto para la capa de persistencia
//! (filas de SQLite) como para los DTOs de entrada de la API.

use serde::Deserialize;

/// Fila completa de la tabla `users` tal como se lee de SQLite.
///
/// No se expone directamente en la API; se usa internamente para
/// verificar credenciales y obtener el hash de contraseña.
#[derive(Debug)]
pub struct UserRow {
    pub id: i64,
    pub username: String,
    pub email: String,
    pub password_hash: String,
    #[allow(dead_code)]
    pub created_at: i64,
}

/// DTO para el registro de un nuevo usuario (`POST /api/auth/register`).
#[derive(Debug, Deserialize)]
pub struct RegisterDto {
    pub username: Option<String>,
    pub email: Option<String>,
    pub password: Option<String>,
}

/// DTO para el inicio de sesión (`POST /api/auth/login`).
#[derive(Debug, Deserialize)]
pub struct LoginDto {
    pub email: Option<String>,
    pub password: Option<String>,
}

/// DTO para el cambio de contraseña (`PUT /api/auth/password`).
#[derive(Debug, Deserialize)]
pub struct ChangePasswordDto {
    #[serde(rename = "currentPassword")]
    pub current_password: Option<String>,
    #[serde(rename = "newPassword")]
    pub new_password: Option<String>,
}
