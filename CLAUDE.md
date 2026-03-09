# DailyShopping Web

Aplicación web de gestión de listas de la compra con búsqueda de productos en supermercados reales, comparador de precios y juego de precios.

Puerto web de la aplicación Android original en `/home/smorillas/daily/DailyShopping/`.

---

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Estado global**: Zustand
- **Persistencia local**: IndexedDB vía `idb` (equivalente a Room/SQLite en Android)
- **Peticiones HTTP**: Fetch API nativa (con wrappers tipados)
- **Imágenes**: HTML `<img>` con lazy loading nativo
- **Enrutamiento**: React Router v6
- **Testing**: Vitest + Testing Library

---

## Arquitectura

Clean Architecture (Hexagonal) — ports & adapters:

```
src/
├── domain/           # Pure business logic - zero framework deps
│   ├── entities/     # Producto.ts, ListaCompra.ts, SupermercadoDisponible.ts
│   ├── ports/        # ISupermercadoPort.ts, IListaCompraRepository.ts
│   └── services/     # PrecioCalculatorService.ts, JuegoPreciosService.ts
├── application/      # Use cases
│   ├── usecases/
│   │   ├── lista/    # ObtenerListas, CrearLista, EliminarLista, ActualizarLista, BuscarListas, ObtenerListaPorId
│   │   └── producto/ # BuscarProductos, CompararPrecios
│   └── dtos/         # ListaCompraDTO.ts
├── infrastructure/   # Adapters
│   ├── persistence/  # IndexedDBListaRepository.ts, db.ts
│   └── supermercados/ # MercadonaAdapter, AlcampoAdapter, DiaAdapter, BMAdapter, CarrefourAdapter
├── presentation/     # React UI
│   ├── pages/        # PrincipalListas, CreadorListas, ListaEspecifica, BuscadorProductos, ComparadorProductos, JuegoPrecios
│   ├── components/   # Layout, BottomNav, LoadingSpinner, EmptyState, ListaCard, ProductoCard
│   └── store/        # useAppStore.ts (Zustand)
├── container.ts      # DI composition root
├── App.tsx
├── main.tsx
└── index.css
```

---

## Modelos de Datos

### ListaCompra
```typescript
interface ListaCompra {
  id: number;            // autoincrement
  nombre: string;
  fecha: number;         // timestamp ms
  supermercado: string;
  productos: Set<Producto>;
}
// Métodos: getPrecioTotal(), getPrecioMarcado(), getPrecioSinMarcar(), getPrecioPromedio()
```

### Producto
```typescript
interface Producto {
  id: string;            // ID del supermercado
  image: string;         // URL imagen
  name: string;
  price: number;         // euros
  price_per_kilo: number; // -1 si N/A
  mass: number;          // -1 si N/A
  amount: number;        // cantidad en lista
  marked: boolean;       // si está marcado como comprado
}
```

### SupermercadosDisponibles (enum)
```typescript
enum SupermercadosDisponibles {
  Mercadona = "Mercadona",
  Dia = "Dia",
  Alcampo = "Alcampo",
  BM = "BM"
}
```

---

## Pantallas / Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | PrincipalListas | Home: todas las listas, búsqueda por nombre, swipe-to-delete |
| `/crear` | CreadorListas | Formulario: nombre, fecha (date picker), supermercado |
| `/lista/:id` | ListaEspecifica | Productos de la lista, marcar comprados, totales |
| `/lista/:id/buscar` | BuscadorProductos | Búsqueda de productos en el supermercado de la lista |
| `/comparar` | ComparadorProductos | Buscar un producto y comparar precios entre supermercados |
| `/juego` | JuegoPrecios | Juego: adivinar el precio de un producto aleatorio |

**Navegación inferior** (visible en todas las pantallas):
- Icono menú → popup lateral
- Comparador → `/comparar`
- Inicio → `/`
- Juego → `/juego`

---

## Integraciones con APIs de Supermercados

Cada supermercado tiene su propia clase en `modelo/apiSupermercados/`:

| Supermercado | Método | Notas |
|-------------|--------|-------|
| Mercadona | POST (Algolia) | Body JSON con query |
| Dia | GET | Array en `search_items` |
| Alcampo | GET | Array en `entities.product` |
| BM | GET | Array en `catalog.products` |

**Interfaz común**:
```typescript
interface Supermercado {
  buscarProductos(query: string): Promise<Producto[]>;
}
```

Los resultados siempre se devuelven ordenados por precio ascendente.

> **CORS**: Las APIs de supermercados requieren un proxy. Usar `/api/proxy?url=...` en desarrollo y configurar el proxy en Vite. En producción, usar un servidor intermediario (Node/Express o Netlify Functions).

---

## Lógica de Negocio Clave

### Juego de Precios (`JuegoPrecios`)
- Se muestra un producto aleatorio (imagen + nombre)
- El usuario tiene **3 intentos** para adivinar el precio
- Tolerancia: **±25%** del precio real
- Resultados:
  - Acierto exacto → estrella dorada
  - Dentro de tolerancia → estrella plateada
  - Demasiado alto → flecha hacia abajo
  - Demasiado bajo → flecha hacia arriba
  - Sin aciertos → se muestra el precio correcto

### Gestión de Lista (`ListaEspecifica`)
- Toggle de marcado/no marcado por producto
- Incrementar/decrementar cantidad
- Swipe-to-delete (o botón eliminar)
- Resumen de precios: total, marcado, sin marcar
- Autoguardado al salir de la pantalla (`useEffect` cleanup / `beforeunload`)

### Comparador (`ComparadorProductos`)
- Busca el mismo texto en todos los supermercados en paralelo (`Promise.all`)
- Agrupa resultados por supermercado
- Muestra el más barato primero
- "No se han encontrado productos" si no hay resultados

---

## Persistencia (IndexedDB)

Esquema de la base de datos (`GestorBD.ts`):

```
DB name: "daily_shopping"
Version: 1

Stores:
- "listas_compra"  { keyPath: "id", autoIncrement: true }
    índice único: [nombre, fecha, supermercado]
- "productos"      { keyPath: "id" }
```

Los productos de cada lista se almacenan como JSON serializado en el campo `productos` de la lista (igual que en Android con Room + TypeConverter).

---

## Convenciones

- **Idioma**: Todo en español (nombres de variables, componentes, comentarios, textos UI)
- **Async**: Usar `async/await` (en lugar de `Thread` + `Handler` del original Android)
- **Errores**: Manejo de errores con try/catch en llamadas a API y BD
- **Componentes**: Functional components con hooks, sin clases
- **Estilo**: Tailwind utility classes, sin CSS custom salvo casos especiales

---

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (Vite)
npm run build        # Build de producción
npm run test         # Ejecutar tests con Vitest
npm run lint         # ESLint
```

---

## Estado Actual del Proyecto

- [ ] Configurar Vite + React + Tailwind
- [ ] Implementar modelos de datos y GestorBD (IndexedDB)
- [ ] Pantalla: PrincipalListas (home)
- [ ] Pantalla: CreadorListas
- [ ] Pantalla: ListaEspecifica
- [ ] APIs de supermercados (Mercadona, Dia, Alcampo, BM)
- [ ] Pantalla: BuscadorProductos
- [ ] Pantalla: ComparadorProductos
- [ ] Pantalla: JuegoPrecios
- [ ] Proxy CORS para APIs de supermercados
- [ ] BottomNav + Header comunes
- [ ] Tests unitarios

---

## Arquitectura Elegida: Clean Architecture (Hexagonal)

Motivo: el patrón ports & adapters encaja perfectamente con múltiples adaptadores de supermercado (5 APIs distintas), permite migrar de IndexedDB a backend sin tocar dominio, y aísla la lógica de negocio (juego de precios, cálculos) de cualquier framework.

Flujo de dependencias: presentation → application → domain ← infrastructure

El dominio no importa nada externo. Los adaptadores implementan los puertos definidos en el dominio.

---

## Referencia: App Android Original

Ubicación: `/home/smorillas/daily/DailyShopping/`

- Arquitectura MVC en Java
- Room database (SQLite)
- Threading manual con `Thread` + `Handler`
- 7 Activities
- Mismas 4 APIs de supermercados