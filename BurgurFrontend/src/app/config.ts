// Configuración central de mapas y tracking
export const RESTAURANT_ORIGIN = { lat: 4.653, lon: -74.057 };
export const DEFAULT_DESTINATION = { lat: 4.662, lon: -74.066 }; // Chapinero aprox

// Preferencia por defecto: desactivar tiles externos para evitar bloqueos/redes restringidas
export const DEFAULT_USE_EXTERNAL_TILES = false;
export type TileProvider = 'osm' | 'carto';
export const DEFAULT_TILE_PROVIDER: TileProvider = 'osm';
// Email de contacto para Nominatim (recomendado por su política de uso)
export const NOMINATIM_CONTACT_EMAIL = 'admin@burgerclub.local';