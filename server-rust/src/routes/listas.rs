//! Rutas de gestión de listas de la compra.
//!
//! Todos los endpoints requieren autenticación JWT.
//! Los usuarios sólo pueden acceder a sus propias listas.

use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use tokio_rusqlite::OptionalExtension;
use chrono::Utc;
use tokio_rusqlite::Connection;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::lista::{CreateListaDto, ListaRow, UpdateListaDto};

/// Construye el sub-router de listas de la compra.
pub fn router() -> Router<Connection> {
    Router::new()
        .route("/",    get(get_listas).post(create_lista))
        .route("/:id", get(get_lista).put(update_lista).delete(delete_lista))
}

/// Devuelve todas las listas del usuario autenticado ordenadas por fecha descendente.
///
/// # Ruta
/// `GET /api/listas`  *(requiere JWT)*
///
/// # Respuestas
/// - `200 OK` – array de listas con productos deserializados
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn get_listas(
    State(db): State<Connection>,
    auth: AuthUser,
) -> Result<Json<Vec<serde_json::Value>>, AppError> {
    let user_id = auth.user_id;
    let rows: Vec<ListaRow> = db
        .call(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, nombre, fecha, supermercado, productos \
                 FROM listas_compra WHERE user_id = ?1 ORDER BY fecha DESC",
            )?;
            let rows = stmt
                .query_map(rusqlite::params![user_id], |r| {
                    Ok(ListaRow {
                        id: r.get(0)?,
                        user_id: r.get(1)?,
                        nombre: r.get(2)?,
                        fecha: r.get(3)?,
                        supermercado: r.get(4)?,
                        productos: r.get(5)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;
            Ok(rows)
        })
        .await?;

    let json_rows: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|r| serde_json::to_value(r.into_response()).unwrap_or_default())
        .collect();

    Ok(Json(json_rows))
}

/// Devuelve una lista concreta del usuario autenticado.
///
/// # Ruta
/// `GET /api/listas/:id`  *(requiere JWT)*
///
/// # Respuestas
/// - `200 OK` – lista con productos deserializados
/// - `404 Not Found` – la lista no existe o no pertenece al usuario
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn get_lista(
    State(db): State<Connection>,
    auth: AuthUser,
    Path(id): Path<i64>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = auth.user_id;
    let row: Option<ListaRow> = db
        .call(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, nombre, fecha, supermercado, productos \
                 FROM listas_compra WHERE id = ?1 AND user_id = ?2",
            )?;
            let row = stmt
                .query_row(rusqlite::params![id, user_id], |r| {
                    Ok(ListaRow {
                        id: r.get(0)?,
                        user_id: r.get(1)?,
                        nombre: r.get(2)?,
                        fecha: r.get(3)?,
                        supermercado: r.get(4)?,
                        productos: r.get(5)?,
                    })
                })
                .optional()?;
            Ok(row)
        })
        .await?;

    match row {
        Some(r) => Ok(Json(serde_json::to_value(r.into_response()).unwrap_or_default())),
        None => Err(AppError::NotFound("Lista no encontrada".to_string())),
    }
}

/// Crea una nueva lista de la compra para el usuario autenticado.
///
/// # Ruta
/// `POST /api/listas`  *(requiere JWT)*
///
/// # Cuerpo de la petición
/// ```json
/// { "nombre": "...", "supermercado": "...", "fecha": 1234567890, "productos": [] }
/// ```
/// Los campos `fecha` y `productos` son opcionales (se usan el timestamp actual y `[]`).
///
/// # Respuestas
/// - `201 Created` – lista creada con productos deserializados
/// - `400 Bad Request` – nombre o supermercado faltantes
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn create_lista(
    State(db): State<Connection>,
    auth: AuthUser,
    Json(body): Json<CreateListaDto>,
) -> Result<(StatusCode, Json<serde_json::Value>), AppError> {
    let nombre = body.nombre
        .filter(|s| !s.trim().is_empty())
        .ok_or_else(|| AppError::BadRequest("Nombre y supermercado requeridos".to_string()))?;
    let supermercado = body.supermercado
        .filter(|s| !s.is_empty())
        .ok_or_else(|| AppError::BadRequest("Nombre y supermercado requeridos".to_string()))?;
    let fecha = body.fecha.unwrap_or_else(|| Utc::now().timestamp_millis());
    let productos = serde_json::to_string(&body.productos.unwrap_or(serde_json::Value::Array(vec![])))
        .unwrap_or_else(|_| "[]".to_string());
    let user_id = auth.user_id;
    let nombre = nombre.trim().to_string();

    let new_id: i64 = db
        .call(move |conn| {
            conn.execute(
                "INSERT INTO listas_compra (user_id, nombre, fecha, supermercado, productos) \
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                rusqlite::params![user_id, nombre, fecha, supermercado, productos],
            )?;
            Ok(conn.last_insert_rowid())
        })
        .await?;

    let row: ListaRow = db
        .call(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, nombre, fecha, supermercado, productos \
                 FROM listas_compra WHERE id = ?1",
            )?;
            let row = stmt.query_row(rusqlite::params![new_id], |r| {
                Ok(ListaRow {
                    id: r.get(0)?,
                    user_id: r.get(1)?,
                    nombre: r.get(2)?,
                    fecha: r.get(3)?,
                    supermercado: r.get(4)?,
                    productos: r.get(5)?,
                })
            })?;
            Ok(row)
        })
        .await?;

    Ok((StatusCode::CREATED, Json(serde_json::to_value(row.into_response()).unwrap_or_default())))
}

/// Actualiza una lista existente del usuario autenticado.
///
/// # Ruta
/// `PUT /api/listas/:id`  *(requiere JWT)*
///
/// # Cuerpo de la petición
/// ```json
/// { "nombre": "...", "supermercado": "...", "fecha": 1234567890, "productos": [...] }
/// ```
///
/// # Respuestas
/// - `200 OK` – lista actualizada
/// - `404 Not Found` – la lista no existe o no pertenece al usuario
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn update_lista(
    State(db): State<Connection>,
    auth: AuthUser,
    Path(id): Path<i64>,
    Json(body): Json<UpdateListaDto>,
) -> Result<Json<serde_json::Value>, AppError> {
    let user_id = auth.user_id;

    // Verificar que existe y pertenece al usuario
    let exists: bool = db
        .call(move |conn| {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM listas_compra WHERE id = ?1 AND user_id = ?2",
                rusqlite::params![id, user_id],
                |r| r.get(0),
            )?;
            Ok(count > 0)
        })
        .await?;

    if !exists {
        return Err(AppError::NotFound("Lista no encontrada".to_string()));
    }

    let nombre = body.nombre;
    let fecha = body.fecha;
    let supermercado = body.supermercado;
    let productos = serde_json::to_string(&body.productos.unwrap_or(serde_json::Value::Array(vec![])))
        .unwrap_or_else(|_| "[]".to_string());

    db.call(move |conn| {
        conn.execute(
            "UPDATE listas_compra SET nombre = ?1, fecha = ?2, supermercado = ?3, productos = ?4 \
             WHERE id = ?5",
            rusqlite::params![nombre, fecha, supermercado, productos, id],
        )?;
        Ok(())
    })
    .await?;

    let row: ListaRow = db
        .call(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, nombre, fecha, supermercado, productos \
                 FROM listas_compra WHERE id = ?1",
            )?;
            let row = stmt.query_row(rusqlite::params![id], |r| {
                Ok(ListaRow {
                    id: r.get(0)?,
                    user_id: r.get(1)?,
                    nombre: r.get(2)?,
                    fecha: r.get(3)?,
                    supermercado: r.get(4)?,
                    productos: r.get(5)?,
                })
            })?;
            Ok(row)
        })
        .await?;

    Ok(Json(serde_json::to_value(row.into_response()).unwrap_or_default()))
}

/// Elimina una lista del usuario autenticado.
///
/// # Ruta
/// `DELETE /api/listas/:id`  *(requiere JWT)*
///
/// # Respuestas
/// - `204 No Content` – lista eliminada
/// - `404 Not Found` – la lista no existe o no pertenece al usuario
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn delete_lista(
    State(db): State<Connection>,
    auth: AuthUser,
    Path(id): Path<i64>,
) -> Result<StatusCode, AppError> {
    let user_id = auth.user_id;
    let changes: usize = db
        .call(move |conn| {
            Ok(conn.execute(
                "DELETE FROM listas_compra WHERE id = ?1 AND user_id = ?2",
                rusqlite::params![id, user_id],
            )?)
        })
        .await?;

    if changes == 0 {
        return Err(AppError::NotFound("Lista no encontrada".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}
