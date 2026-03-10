//! Registro de rutas de la aplicación.
//!
//! La función [`router`] construye el [`axum::Router`] completo con
//! todas las rutas agrupadas bajo sus prefijos correspondientes.

pub mod auth;
pub mod listas;
pub mod stats;

use axum::Router;
use tokio_rusqlite::Connection;

/// Construye el router principal con todos los sub-routers montados.
///
/// # Rutas registradas
/// - `GET  /health`
/// - `POST /api/auth/register`
/// - `POST /api/auth/login`
/// - `PUT  /api/auth/password`
/// - `GET  /api/listas`
/// - `GET  /api/listas/:id`
/// - `POST /api/listas`
/// - `PUT  /api/listas/:id`
/// - `DELETE /api/listas/:id`
/// - `GET  /api/stats`
pub fn router(db: Connection) -> Router {
    use axum::routing::get;
    use axum::Json;
    use serde_json::json;

    Router::new()
        .route("/health", get(|| async { Json(json!({ "ok": true })) }))
        .nest("/api/auth",   auth::router())
        .nest("/api/listas", listas::router())
        .nest("/api/stats",  stats::router())
        .with_state(db)
}
