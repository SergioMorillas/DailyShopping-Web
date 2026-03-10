//! Inicialización de la base de datos SQLite.
//!
//! Abre (o crea) el archivo `daily-shopping.db` en el directorio configurado,
//! activa WAL y claves foráneas, y crea las tablas si no existen.
//! El esquema es idéntico al del backend Node.js para compatibilidad total.

use std::path::Path;
use tokio_rusqlite::Connection;
use anyhow::Context;

/// Abre la conexión a SQLite y aplica el esquema inicial.
///
/// # Parámetros
/// - `data_dir` – ruta al directorio donde se almacena el archivo `.db`.
///
/// # Errores
/// Retorna error si el directorio no se puede crear o si SQLite falla.
pub async fn init_db(data_dir: &str) -> anyhow::Result<Connection> {
    std::fs::create_dir_all(data_dir)
        .with_context(|| format!("No se pudo crear el directorio de datos: {data_dir}"))?;

    let db_path = Path::new(data_dir).join("daily-shopping.db");
    let conn = Connection::open(&db_path)
        .await
        .with_context(|| format!("No se pudo abrir la base de datos: {}", db_path.display()))?;

    conn.call(|db| {
        db.execute_batch("PRAGMA journal_mode = WAL;")?;
        db.execute_batch("PRAGMA foreign_keys = ON;")?;
        db.execute_batch("
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                username      TEXT UNIQUE NOT NULL,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at    INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS listas_compra (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                nombre       TEXT NOT NULL,
                fecha        INTEGER NOT NULL,
                supermercado TEXT NOT NULL,
                productos    TEXT NOT NULL DEFAULT '[]'
            );
        ")?;
        Ok(())
    })
    .await
    .map_err(|e| anyhow::anyhow!(e))?;

    tracing::info!("Base de datos inicializada: {}", db_path.display());
    Ok(conn)
}
