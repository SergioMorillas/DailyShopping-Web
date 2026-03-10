//! # daily-shopping-server
//!
//! Backend REST en Rust (Axum) para la aplicación DailyShopping.
//!
//! Reimplementación del backend Node.js/Express con el mismo esquema SQLite,
//! misma lógica JWT y mismos hashes bcrypt, sin cambios en el frontend.
//!
//! ## Módulos principales
//! - [`config`] – variables de entorno
//! - [`db`]     – inicialización de SQLite
//! - [`errors`] – tipo de error unificado
//! - [`models`] – estructuras de datos y DTOs
//! - [`middleware::auth`] – extractor JWT
//! - [`routes`] – todos los handlers HTTP
//!
//! ## Ejecutar en desarrollo
//! ```bash
//! cd server-rust
//! cargo run
//! ```
//!
//! ## Generar documentación
//! ```bash
//! cargo doc --open
//! ```

mod config;
mod db;
mod errors;
mod middleware;
mod models;
mod routes;

use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber::{fmt, EnvFilter};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // ── Logging ───────────────────────────────────────────────────────────
    fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    // ── Configuración ─────────────────────────────────────────────────────
    let cfg = config::Config::from_env();
    tracing::info!("Configuración cargada: puerto={}, data_dir={}", cfg.port, cfg.data_dir);

    // ── Base de datos ─────────────────────────────────────────────────────
    let db = db::init_db(&cfg.data_dir).await?;

    // ── CORS ──────────────────────────────────────────────────────────────
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // ── Router ────────────────────────────────────────────────────────────
    let app = routes::router(db).layer(cors);

    // ── Servidor ──────────────────────────────────────────────────────────
    let addr = SocketAddr::from(([0, 0, 0, 0], cfg.port));
    tracing::info!("Servidor escuchando en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
