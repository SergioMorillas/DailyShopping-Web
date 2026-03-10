//! Rutas de autenticación.
//!
//! Expone los endpoints de registro, login y cambio de contraseña.
//! Los tokens JWT tienen una vigencia de 30 días y se firman con HS256.

use axum::{
    extract::State,
    http::StatusCode,
    routing::{post, put},
    Json, Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use jsonwebtoken::{encode, EncodingKey, Header};
use serde_json::{json, Value};
use tokio_rusqlite::Connection;

use crate::errors::AppError;
use crate::middleware::auth::{AuthUser, Claims};
use crate::models::user::{ChangePasswordDto, LoginDto, RegisterDto, UserRow};

/// Construye el sub-router de autenticación.
pub fn router() -> Router<Connection> {
    Router::new()
        .route("/register", post(register))
        .route("/login",    post(login))
        .route("/password", put(change_password))
}

/// Genera un token JWT con expiración de 30 días.
fn generate_token(user_id: i64, secret: &str) -> anyhow::Result<String> {
    let exp = (Utc::now().timestamp() + 30 * 24 * 3600) as usize;
    let claims = Claims { user_id, exp };
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )?;
    Ok(token)
}

/// Registra un nuevo usuario en el sistema.
///
/// # Ruta
/// `POST /api/auth/register`
///
/// # Cuerpo de la petición
/// ```json
/// { "username": "...", "email": "...", "password": "..." }
/// ```
///
/// # Respuestas
/// - `201 Created` – `{ token, user }` si el registro es exitoso
/// - `400 Bad Request` – campos faltantes o contraseña corta
/// - `409 Conflict` – usuario o email ya registrado
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn register(
    State(db): State<Connection>,
    Json(body): Json<RegisterDto>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    let username = body.username
        .filter(|s| !s.trim().is_empty())
        .ok_or_else(|| AppError::BadRequest("Todos los campos son obligatorios".to_string()))?;
    let email = body.email
        .filter(|s| !s.trim().is_empty())
        .ok_or_else(|| AppError::BadRequest("Todos los campos son obligatorios".to_string()))?;
    let password = body.password
        .ok_or_else(|| AppError::BadRequest("Todos los campos son obligatorios".to_string()))?;

    if password.len() < 6 {
        return Err(AppError::BadRequest("La contraseña debe tener al menos 6 caracteres".to_string()));
    }

    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "daily-shopping-secret-dev".to_string());

    let username = username.trim().to_string();
    let email = email.trim().to_lowercase();
    let password_hash = hash(&password, DEFAULT_COST)
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    let created_at = Utc::now().timestamp_millis();

    let user_id: i64 = db
        .call(move |conn| {
            conn.execute(
                "INSERT INTO users (username, email, password_hash, created_at) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![username, email, password_hash, created_at],
            )?;
            Ok(conn.last_insert_rowid())
        })
        .await
        .map_err(|e| {
            let msg = e.to_string();
            if msg.contains("UNIQUE") {
                AppError::Conflict("El usuario o email ya existe".to_string())
            } else {
                AppError::Internal(anyhow::anyhow!(e))
            }
        })?;

    // Re-read to get the stored values
    let (stored_username, stored_email) = db
        .call(move |conn| {
            let mut stmt = conn.prepare("SELECT username, email FROM users WHERE id = ?1")?;
            let row = stmt.query_row(rusqlite::params![user_id], |r| {
                Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?))
            })?;
            Ok(row)
        })
        .await?;

    let token = generate_token(user_id, &jwt_secret)
        .map_err(|e| AppError::Internal(e))?;

    Ok((
        StatusCode::CREATED,
        Json(json!({
            "token": token,
            "user": { "id": user_id, "username": stored_username, "email": stored_email }
        })),
    ))
}

/// Autentica un usuario y devuelve un token JWT.
///
/// # Ruta
/// `POST /api/auth/login`
///
/// # Cuerpo de la petición
/// ```json
/// { "email": "...", "password": "..." }
/// ```
///
/// # Respuestas
/// - `200 OK` – `{ token, user }` si las credenciales son correctas
/// - `400 Bad Request` – campos faltantes
/// - `401 Unauthorized` – credenciales incorrectas
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn login(
    State(db): State<Connection>,
    Json(body): Json<LoginDto>,
) -> Result<Json<Value>, AppError> {
    let email = body.email
        .filter(|s| !s.trim().is_empty())
        .ok_or_else(|| AppError::BadRequest("Email y contraseña requeridos".to_string()))?;
    let password = body.password
        .ok_or_else(|| AppError::BadRequest("Email y contraseña requeridos".to_string()))?;

    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "daily-shopping-secret-dev".to_string());

    let email_lower = email.trim().to_lowercase();

    let user: UserRow = db
        .call(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, username, email, password_hash, created_at FROM users WHERE email = ?1",
            )?;
            let row = stmt.query_row(rusqlite::params![email_lower], |r| {
                Ok(UserRow {
                    id: r.get(0)?,
                    username: r.get(1)?,
                    email: r.get(2)?,
                    password_hash: r.get(3)?,
                    created_at: r.get(4)?,
                })
            });
            Ok(row)
        })
        .await?
        .map_err(|_| AppError::Unauthorized("Credenciales incorrectas".to_string()))?;

    let valid = verify(&password, &user.password_hash)
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    if !valid {
        return Err(AppError::Unauthorized("Credenciales incorrectas".to_string()));
    }

    let token = generate_token(user.id, &jwt_secret)
        .map_err(|e| AppError::Internal(e))?;

    Ok(Json(json!({
        "token": token,
        "user": { "id": user.id, "username": user.username, "email": user.email }
    })))
}

/// Cambia la contraseña del usuario autenticado.
///
/// # Ruta
/// `PUT /api/auth/password`  *(requiere JWT)*
///
/// # Cuerpo de la petición
/// ```json
/// { "currentPassword": "...", "newPassword": "..." }
/// ```
///
/// # Respuestas
/// - `200 OK` – `{ ok: true }` si el cambio fue exitoso
/// - `400 Bad Request` – campos faltantes o contraseña nueva muy corta
/// - `401 Unauthorized` – contraseña actual incorrecta
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn change_password(
    State(db): State<Connection>,
    auth: AuthUser,
    Json(body): Json<ChangePasswordDto>,
) -> Result<Json<Value>, AppError> {
    let current = body.current_password
        .ok_or_else(|| AppError::BadRequest("Campos requeridos".to_string()))?;
    let new_pwd = body.new_password
        .ok_or_else(|| AppError::BadRequest("Campos requeridos".to_string()))?;

    if new_pwd.len() < 6 {
        return Err(AppError::BadRequest("La contraseña debe tener al menos 6 caracteres".to_string()));
    }

    let user_id = auth.user_id;
    let user: UserRow = db
        .call(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, username, email, password_hash, created_at FROM users WHERE id = ?1",
            )?;
            let row = stmt.query_row(rusqlite::params![user_id], |r| {
                Ok(UserRow {
                    id: r.get(0)?,
                    username: r.get(1)?,
                    email: r.get(2)?,
                    password_hash: r.get(3)?,
                    created_at: r.get(4)?,
                })
            })?;
            Ok(row)
        })
        .await?;

    let valid = verify(&current, &user.password_hash)
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;
    if !valid {
        return Err(AppError::Unauthorized("Contraseña actual incorrecta".to_string()));
    }

    let new_hash = hash(&new_pwd, DEFAULT_COST)
        .map_err(|e| AppError::Internal(anyhow::anyhow!(e)))?;

    db.call(move |conn| {
        conn.execute(
            "UPDATE users SET password_hash = ?1 WHERE id = ?2",
            rusqlite::params![new_hash, user_id],
        )?;
        Ok(())
    })
    .await?;

    Ok(Json(json!({ "ok": true })))
}
