# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM rust:1.78-bookworm AS builder
WORKDIR /app

# Cache de dependencias (sólo se recompila si cambia Cargo.toml)
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -f src/main.rs

COPY src ./src
RUN touch src/main.rs && cargo build --release

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM debian:bookworm-slim
# ca-certificates necesario para conexiones TLS salientes (proxy CORS)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/daily-shopping-server /usr/local/bin/server
EXPOSE 3001
CMD ["server"]
