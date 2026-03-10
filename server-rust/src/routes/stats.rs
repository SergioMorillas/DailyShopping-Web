//! Ruta de estadísticas del usuario.
//!
//! Calcula en Rust las mismas métricas que el backend Node.js:
//! gasto total, gasto medio por lista, desglose por supermercado,
//! productos más comprados y gasto mensual de los últimos 6 meses.

use axum::{extract::State, routing::get, Json, Router};
use chrono::{Datelike, TimeZone, Utc};
use serde::Serialize;
use tokio_rusqlite::Connection;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::lista::ListaRow;

/// Construye el sub-router de estadísticas.
pub fn router() -> Router<Connection> {
    Router::new().route("/", get(get_stats))
}

/// Resumen de uso por supermercado.
#[derive(Debug, Serialize)]
pub struct SupermercadoStats {
    pub nombre: String,
    /// Número de listas en ese supermercado.
    pub count: u32,
    /// Gasto total (€) redondeado a 2 decimales.
    pub gasto: f64,
}

/// Producto más comprado.
#[derive(Debug, Serialize)]
pub struct ProductoTop {
    pub nombre: String,
    /// Unidades totales compradas.
    pub count: u32,
    /// Gasto total (€) redondeado a 2 decimales.
    pub gasto: f64,
}

/// Gasto agregado en un mes calendario.
#[derive(Debug, Serialize)]
pub struct GastoMensual {
    pub mes: String,
    /// Gasto total (€) redondeado a 2 decimales.
    pub gasto: f64,
}

/// Respuesta completa del endpoint de estadísticas.
#[derive(Debug, Serialize)]
pub struct StatsResponse {
    /// Total de listas del usuario.
    #[serde(rename = "totalListas")]
    pub total_listas: usize,
    /// Suma del gasto en todas las listas.
    #[serde(rename = "gastoTotal")]
    pub gasto_total: f64,
    /// Media de gasto por lista.
    #[serde(rename = "gastoMedio")]
    pub gasto_medio: f64,
    /// Desglose por supermercado.
    pub supermercados: Vec<SupermercadoStats>,
    /// Top 8 productos más comprados.
    #[serde(rename = "productosTop")]
    pub productos_top: Vec<ProductoTop>,
    /// Gasto de los últimos 6 meses.
    #[serde(rename = "gastoMensual")]
    pub gasto_mensual: Vec<GastoMensual>,
}

/// Devuelve las estadísticas de compra del usuario autenticado.
///
/// # Ruta
/// `GET /api/stats`  *(requiere JWT)*
///
/// # Respuestas
/// - `200 OK` – objeto [`StatsResponse`] con todos los cálculos
///
/// # Errores
/// Retorna [`AppError`] en caso de fallo de base de datos.
pub async fn get_stats(
    State(db): State<Connection>,
    auth: AuthUser,
) -> Result<Json<StatsResponse>, AppError> {
    let user_id = auth.user_id;

    let rows: Vec<ListaRow> = db
        .call(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, nombre, fecha, supermercado, productos \
                 FROM listas_compra WHERE user_id = ?1",
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

    // Parsear productos de cada lista
    let listas_con_productos: Vec<(ListaRow, Vec<serde_json::Value>)> = rows
        .into_iter()
        .map(|row| {
            let productos: Vec<serde_json::Value> =
                serde_json::from_str(&row.productos).unwrap_or_default();
            (row, productos)
        })
        .collect();

    // ── Stats por supermercado ─────────────────────────────────────────────
    let mut sup_map: std::collections::HashMap<String, (u32, f64)> = std::collections::HashMap::new();
    let mut gasto_total = 0.0_f64;

    for (lista, productos) in &listas_con_productos {
        let gasto_lista: f64 = productos.iter().map(|p| {
            let price = p["price"].as_f64().unwrap_or(0.0);
            let amount = p["amount"].as_f64().unwrap_or(1.0);
            price * amount
        }).sum();
        let entry = sup_map.entry(lista.supermercado.clone()).or_insert((0, 0.0));
        entry.0 += 1;
        entry.1 += gasto_lista;
        gasto_total += gasto_lista;
    }

    let supermercados: Vec<SupermercadoStats> = sup_map
        .into_iter()
        .map(|(nombre, (count, gasto))| SupermercadoStats {
            nombre,
            count,
            gasto: round2(gasto),
        })
        .collect();

    // ── Top productos ──────────────────────────────────────────────────────
    let mut prod_map: std::collections::HashMap<String, (u32, f64)> = std::collections::HashMap::new();
    for (_, productos) in &listas_con_productos {
        for p in productos {
            let name = p["name"].as_str().unwrap_or("Desconocido").trim().to_string();
            if name.is_empty() { continue; }
            let amount = p["amount"].as_u64().unwrap_or(1) as u32;
            let gasto = p["price"].as_f64().unwrap_or(0.0) * amount as f64;
            let entry = prod_map.entry(name).or_insert((0, 0.0));
            entry.0 += amount;
            entry.1 += gasto;
        }
    }
    let mut productos_top: Vec<ProductoTop> = prod_map
        .into_iter()
        .map(|(nombre, (count, gasto))| ProductoTop { nombre, count, gasto: round2(gasto) })
        .collect();
    productos_top.sort_by(|a, b| b.count.cmp(&a.count));
    productos_top.truncate(8);

    // ── Gasto mensual últimos 6 meses ──────────────────────────────────────
    let now = Utc::now();
    let mut meses: Vec<(String, String, f64)> = Vec::with_capacity(6); // (key, label, gasto)
    for i in (0..6).rev() {
        let year = now.year();
        let month = now.month() as i32 - i;
        let (y, m) = if month <= 0 {
            (year - 1, (month + 12) as u32)
        } else {
            (year, month as u32)
        };
        let key = format!("{y}-{m:02}");
        let d = Utc.with_ymd_and_hms(y, m, 1, 0, 0, 0).unwrap();
        let label = month_label(d.month(), d.year());
        meses.push((key, label, 0.0));
    }

    for (lista, productos) in &listas_con_productos {
        let d = Utc.timestamp_millis_opt(lista.fecha).unwrap();
        let key = format!("{}-{:02}", d.year(), d.month());
        if let Some(entry) = meses.iter_mut().find(|(k, _, _)| k == &key) {
            let gasto_lista: f64 = productos.iter().map(|p| {
                p["price"].as_f64().unwrap_or(0.0) * p["amount"].as_f64().unwrap_or(1.0)
            }).sum();
            entry.2 += gasto_lista;
        }
    }

    let gasto_mensual: Vec<GastoMensual> = meses
        .into_iter()
        .map(|(_, label, gasto)| GastoMensual { mes: label, gasto: round2(gasto) })
        .collect();

    let total = listas_con_productos.len();
    let gasto_medio = if total > 0 { round2(gasto_total / total as f64) } else { 0.0 };

    Ok(Json(StatsResponse {
        total_listas: total,
        gasto_total: round2(gasto_total),
        gasto_medio,
        supermercados,
        productos_top,
        gasto_mensual,
    }))
}

/// Redondea un float a 2 decimales.
fn round2(v: f64) -> f64 {
    (v * 100.0).round() / 100.0
}

/// Devuelve la etiqueta abreviada del mes en español.
///
/// Formato: `"ene 25"`, `"feb 25"`, etc.
fn month_label(month: u32, year: i32) -> String {
    let names = ["ene", "feb", "mar", "abr", "may", "jun",
                 "jul", "ago", "sep", "oct", "nov", "dic"];
    let m = names[(month as usize).saturating_sub(1).min(11)];
    let y = year % 100;
    format!("{m} {y:02}")
}
