//! Configuración de la aplicación mediante variables de entorno.
//!
//! Las variables se leen al inicio del programa vía [`dotenvy`].
//! Si no están definidas se usan los valores por defecto de desarrollo.

/// Configuración global de la aplicación.
#[derive(Debug, Clone)]
pub struct Config {
    /// Puerto TCP en el que escucha el servidor.
    pub port: u16,
    /// Secreto usado para firmar y verificar tokens JWT.
    /// Los handlers lo leen directamente via `std::env::var("JWT_SECRET")`.
    #[allow(dead_code)]
    pub jwt_secret: String,
    /// Directorio donde se almacena el archivo SQLite.
    pub data_dir: String,
}

impl Config {
    /// Carga la configuración desde variables de entorno.
    ///
    /// Se llama a [`dotenvy::dotenv`] automáticamente (si existe `.env`)
    /// antes de leer las variables.
    pub fn from_env() -> Self {
        let _ = dotenvy::dotenv();
        Config {
            port: std::env::var("PORT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3001),
            jwt_secret: std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "daily-shopping-secret-dev".to_string()),
            data_dir: std::env::var("DATA_DIR")
                .unwrap_or_else(|_| "./data".to_string()),
        }
    }
}
