//! Modelos relacionados con listas de la compra.
//!
//! Define las estructuras para la persistencia, los DTOs de entrada
//! y la respuesta JSON de una lista con sus productos deserializados.

use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Fila de la tabla `listas_compra` tal como se lee de SQLite.
///
/// El campo `productos` se almacena como texto JSON y se deserializa
/// en [`ListaResponse`] antes de enviarse al cliente.
#[derive(Debug)]
pub struct ListaRow {
    pub id: i64,
    pub user_id: i64,
    pub nombre: String,
    pub fecha: i64,
    pub supermercado: String,
    pub productos: String,
}

/// Respuesta JSON de una lista con los productos ya deserializados.
#[derive(Debug, Serialize)]
pub struct ListaResponse {
    pub id: i64,
    pub user_id: i64,
    pub nombre: String,
    pub fecha: i64,
    pub supermercado: String,
    pub productos: Value,
}

impl ListaRow {
    /// Convierte la fila en una respuesta con productos parseados.
    ///
    /// Si el JSON de productos está malformado se devuelve un array vacío.
    pub fn into_response(self) -> ListaResponse {
        let productos = serde_json::from_str(&self.productos)
            .unwrap_or(Value::Array(vec![]));
        ListaResponse {
            id: self.id,
            user_id: self.user_id,
            nombre: self.nombre,
            fecha: self.fecha,
            supermercado: self.supermercado,
            productos,
        }
    }
}

/// DTO para crear una nueva lista (`POST /api/listas`).
#[derive(Debug, Deserialize)]
pub struct CreateListaDto {
    pub nombre: Option<String>,
    pub fecha: Option<i64>,
    pub supermercado: Option<String>,
    pub productos: Option<Value>,
}

/// DTO para actualizar una lista existente (`PUT /api/listas/:id`).
#[derive(Debug, Deserialize)]
pub struct UpdateListaDto {
    pub nombre: Option<String>,
    pub fecha: Option<i64>,
    pub supermercado: Option<String>,
    pub productos: Option<Value>,
}
