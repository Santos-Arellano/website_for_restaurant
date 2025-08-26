//burger-club/burgur/src/main/java/restaurante/example/burgur/Service/ProductoServiceImpl.java
package restaurante.example.burgur.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.AdicionalesPermiXProducto;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Repository.AdicionalesPermiXProductoRepository;
import restaurante.example.burgur.Repository.ProductoRepository;
import restaurante.example.burgur.Repository.AdicionalRepository;

@Service
public class ProductoServiceImpl implements ProductoService {
    
    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AdicionalesPermiXProductoRepository adicionalesPermiXProductoRepository;

    @Autowired
    private AdicionalRepository adicionalRepository;
    
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    
    @Override
    public List<Producto> findAll() {
        try {
            return productoRepository.findAll();
        } catch (Exception e) {
            System.err.println("Error al obtener todos los productos: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public Optional<Producto> findById(Long id) {
        try {
            if (id == null) return Optional.empty();
            return productoRepository.findById(id);
        } catch (Exception e) {
            System.err.println("Error al buscar producto por ID " + id + ": " + e.getMessage());
            return Optional.empty();
        }
    }
    
    @Override
    public Producto save(Producto producto) {
        try {
            validateProducto(producto);
            return productoRepository.save(producto);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar el producto: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void deleteById(Long id) throws IllegalArgumentException {
        try {
            if (id == null) {
                throw new IllegalArgumentException("El ID no puede ser nulo");
            }
            if (!productoRepository.existsById(id)) {
                throw new RuntimeException("Producto no encontrado con ID: " + id);
            }
            productoRepository.deleteById(id);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el producto: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean existsById(Long id) {
        try {
            return id != null && productoRepository.existsById(id);
        } catch (Exception e) {
            System.err.println("Error al verificar existencia del producto " + id + ": " + e.getMessage());
            return false;
        }
    }

    // ==========================================
    // MÉTODOS RELACIONADOS CON ADICIONALES
    // ==========================================

    // Actualizar los adicionales permitidos para todos los productos
    @Transactional
    @Override
    public Integer updateAdicionalesDeTodosLosProductos() {
        List<Producto> productos = productoRepository.findAll();
        List<Adicional> adicionales = adicionalRepository.findAll();

        // Índice: categoria(normalizada) -> adicionales
        Map<String, List<Adicional>> adsPorCat = new HashMap<>();
        for (Adicional a : adicionales) {
            if (a.getCategoria() == null) continue;
            for (String c : a.getCategoria()) {
                if (c == null || c.isBlank()) continue;
                adsPorCat.computeIfAbsent(c.trim().toLowerCase(), k -> new ArrayList<>()).add(a);
            }
        }

        List<AdicionalesPermiXProducto> nuevos = new ArrayList<>();
        int creados = 0;

        for (Producto p : productos) {
            String catP = p.getCategoria();
            if (catP == null || catP.isBlank()) continue;
            String key = catP.trim().toLowerCase();

            List<Adicional> compatibles = adsPorCat.getOrDefault(key, List.of());
            if (compatibles.isEmpty()) continue;

            // IDs ya vinculados para evitar duplicados
            Set<Long> ya = p.getAdicionales().stream()
                    .map(rel -> rel.getAdicional().getId())
                    .collect(java.util.stream.Collectors.toSet());

            for (Adicional a : compatibles) {
                if (a.getId() == null || ya.contains(a.getId())) continue;
                nuevos.add(nuevoLink(p, a));
                ya.add(a.getId());
                creados++;
            }
        }

        if (!nuevos.isEmpty()) {
            adicionalesPermiXProductoRepository.saveAll(nuevos);
        }
        return creados;
    }

    private AdicionalesPermiXProducto nuevoLink(Producto p, Adicional a) {
        AdicionalesPermiXProducto ap = new AdicionalesPermiXProducto();
        ap.setProducto(p);
        ap.setAdicional(a);
        return ap;
    }

    // Rebuild de los Adicionales Permitos para todos los productos
    @Transactional
    @Override
    public Integer rebuildAdicionalesDeTodosLosProductos() {
        List<Producto> productos = productoRepository.findAll();
        List<Adicional> adicionales = adicionalRepository.findAll();

        // Índice: categoria(normalizada) -> adicionales
        Map<String, List<Adicional>> adsPorCat = new HashMap<>();
        for (Adicional a : adicionales) {
            if (a.getCategoria() == null) continue;
            for (String c : a.getCategoria()) {
                if (c == null || c.isBlank()) continue;
                adsPorCat.computeIfAbsent(c.trim().toLowerCase(), k -> new ArrayList<>()).add(a);
            }
        }

        // 1) Borrar todos los vínculos actuales
        adicionalesPermiXProductoRepository.deleteAllInBatch();

        // 2) Recalcular y crear nuevos vínculos
        List<AdicionalesPermiXProducto> nuevos = new ArrayList<>();
        int creados = 0;

        for (Producto p : productos) {
            String catP = p.getCategoria();
            if (catP == null || catP.isBlank()) continue;
            String key = catP.trim().toLowerCase();

            List<Adicional> compatibles = adsPorCat.getOrDefault(key, List.of());
            for (Adicional a : compatibles) {
                if (a.getId() == null) continue;
                nuevos.add(nuevoLink(p, a));
                creados++;
            }
        }

        if (!nuevos.isEmpty()) {
            adicionalesPermiXProductoRepository.saveAll(nuevos);
        }
        return creados;
    }


        
    
    // ==========================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // ==========================================
    
    @Override
    public List<Producto> findByNombre(String nombre) {
        try {
            if (nombre == null || nombre.trim().isEmpty()) return findAll();
            return productoRepository.findByNombreContainingIgnoreCase(nombre.trim());
        } catch (Exception e) {
            System.err.println("Error al buscar productos por nombre: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByCategoria(String categoria) {
        try {
            if (categoria == null || categoria.trim().isEmpty() || "todos".equalsIgnoreCase(categoria.trim())) {
                return findAll();
            }
            return productoRepository.findByCategoriaIgnoreCase(categoria.trim());
        } catch (Exception e) {
            System.err.println("Error al buscar productos por categoría: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> search(String termino) {
        try {
            if (termino == null || termino.trim().isEmpty()) return findAll();
            final String t = termino.trim().toLowerCase();
            // Filtrado en memoria porque tu repo NO tiene search(...)
            return findAll().stream()
                .filter(p -> {
                    if (p == null) return false;
                    boolean nombre = p.getNombre() != null && p.getNombre().toLowerCase().contains(t);
                    boolean desc   = p.getDescripcion() != null && p.getDescripcion().toLowerCase().contains(t);
                    boolean cat    = p.getCategoria() != null && p.getCategoria().toLowerCase().contains(t);
                    boolean ing    = p.getIngredientes() != null &&
                                     p.getIngredientes().stream().anyMatch(ingr -> ingr != null && ingr.toLowerCase().contains(t));
                    return nombre || desc || cat || ing;
                })
                .toList();
        } catch (Exception e) {
            System.err.println("Error en la búsqueda: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByNuevo(boolean nuevo) {
        try {
            return productoRepository.findByNuevo(nuevo);
        } catch (Exception e) {
            System.err.println("Error al buscar productos nuevos: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByPopular(boolean popular) {
        try {
            return productoRepository.findByPopular(popular);
        } catch (Exception e) {
            System.err.println("Error al buscar productos populares: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByStockBajo(int limite) {
        try {
            return productoRepository.findByStockLessThan(limite);
        } catch (Exception e) {
            System.err.println("Error al buscar productos con stock bajo: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByActivo(boolean activo) {
        try {
            return productoRepository.findByActivo(activo);
        } catch (Exception e) {
            System.err.println("Error al buscar productos activos: " + e.getMessage());
            return List.of();
        }
    }

    @Override
    @Transactional
    public List<Adicional> obtenerAdicionalesPermitidos(Long productoId){ 
        // (opcional) validar que el producto exista
        if (!productoRepository.existsById(productoId)) {
            throw new IllegalArgumentException("Producto no existe: " + productoId);
        }
        return adicionalesPermiXProductoRepository.findAdicionalesByProductoId(productoId);
    }

    // ==========================================
    // MÉTODOS DE ESTADÍSTICAS
    // ==========================================
    
    @Override
    public long countTotal() {
        try {
            return productoRepository.count();
        } catch (Exception e) {
            System.err.println("Error al contar productos totales: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByCategoria(String categoria) {
        try {
            if (categoria == null || categoria.isBlank()) return 0;
            return productoRepository.countByCategoriaIgnoreCase(categoria.trim());
        } catch (Exception e) {
            System.err.println("Error al contar productos por categoría: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByNuevo() {
        try {
            return productoRepository.countByNuevoTrue();
        } catch (Exception e) {
            System.err.println("Error al contar productos nuevos: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByPopular() {
        try {
            return productoRepository.countByPopularTrue();
        } catch (Exception e) {
            System.err.println("Error al contar productos populares: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByStockBajo() {
        try {
            return productoRepository.countByStockLessThan(5);
        } catch (Exception e) {
            System.err.println("Error al contar productos con stock bajo: " + e.getMessage());
            return 0;
        }
    }
    
    // ==========================================
    // MÉTODOS DE ACTUALIZACIÓN ESPECÍFICA
    // ==========================================
    
    @Override
    public Producto updateStock(Long id, Integer nuevoStock) throws IllegalArgumentException {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (productoOpt.isEmpty()) {
                throw new RuntimeException("Producto no encontrado con ID: " + id);
            }
            if (nuevoStock == null || nuevoStock < 0) {
                throw new IllegalArgumentException("El stock no puede ser negativo");
            }
            Producto producto = productoOpt.get();
            producto.setStock(nuevoStock);
            return save(producto);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar el stock: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Producto toggleNuevo(Long id) {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (productoOpt.isEmpty()) {
                throw new RuntimeException("Producto no encontrado con ID: " + id);
            }
            Producto producto = productoOpt.get();
            producto.setNuevo(!producto.isNuevo());
            return save(producto);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al cambiar estado nuevo: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Producto togglePopular(Long id) {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (productoOpt.isEmpty()) {
                throw new RuntimeException("Producto no encontrado con ID: " + id);
            }
            Producto producto = productoOpt.get();
            producto.setPopular(!producto.isPopular());
            return save(producto);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al cambiar estado popular: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Producto toggleActivo(Long id) {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (productoOpt.isEmpty()) {
                throw new RuntimeException("Producto no encontrado con ID: " + id);
            }
            Producto producto = productoOpt.get();
            producto.setActivo(!producto.isActivo());
            return save(producto);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al cambiar estado activo: " + e.getMessage(), e);
        }
    }
    
    // ==========================================
    // MÉTODOS ADICIONALES DE UTILIDAD
    // ==========================================
    
    @Override
    public List<Producto> searchAdvanced(String nombre, String categoria, 
                                         Boolean nuevo, Boolean popular, 
                                         Boolean stockBajo) {
        try {
            List<Producto> productos = findAll();
            return productos.stream()
                .filter(p -> {
                    if (p == null) return false;
                    
                    if (nombre != null && !nombre.trim().isEmpty()) {
                        String t = nombre.toLowerCase();
                        boolean match = (p.getNombre() != null && p.getNombre().toLowerCase().contains(t)) ||
                                        (p.getDescripcion() != null && p.getDescripcion().toLowerCase().contains(t));
                        if (!match) return false;
                    }
                    if (categoria != null && !categoria.trim().isEmpty() && !"todos".equalsIgnoreCase(categoria)) {
                        if (p.getCategoria() == null || !p.getCategoria().equalsIgnoreCase(categoria)) return false;
                    }
                    if (nuevo != null && !nuevo.equals(p.isNuevo())) return false;
                    if (popular != null && !popular.equals(p.isPopular())) return false;
                    if (stockBajo != null && stockBajo && !(p.getStock() != null && p.getStock() < 5)) return false;
                    return true;
                })
                .toList();
        } catch (Exception e) {
            System.err.println("Error en búsqueda avanzada: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findTopSelling(int limit) {
        try {
            return findByPopular(true).stream()
                .limit(Math.max(1, limit))
                .toList();
        } catch (Exception e) {
            System.err.println("Error al obtener productos más vendidos: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByPriceRange(double minPrice, double maxPrice) {
        try {
            if (minPrice < 0 || maxPrice < minPrice) {
                throw new IllegalArgumentException("Rango de precios inválido");
            }
            return productoRepository.findByPrecioBetween(minPrice, maxPrice);
        } catch (Exception e) {
            System.err.println("Error al buscar por rango de precio: " + e.getMessage());
            return List.of();
        }
    }


    // ==========================================
    // VALIDACIÓN
    // ==========================================
    
    private void validateProducto(Producto producto) {
        if (producto == null) throw new IllegalArgumentException("El producto no puede ser nulo");
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es requerido");
        }
        if (producto.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre del producto no puede exceder 100 caracteres");
        }
        if (producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (producto.getPrecio() > 1_000_000) {
            throw new IllegalArgumentException("El precio no puede exceder $1,000,000");
        }
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        if (producto.getCategoria() == null || producto.getCategoria().trim().isEmpty()) {
            throw new IllegalArgumentException("La categoría es requerida");
        }
        String[] categoriasPermitidas = {"hamburguesa", "acompañamiento", "bebida", "postre", "perro caliente"};
        boolean categoriaValida = false;
        for (String cat : categoriasPermitidas) {
            if (cat.equalsIgnoreCase(producto.getCategoria().trim())) {
                categoriaValida = true; break;
            }
        }
        if (!categoriaValida) {
            throw new IllegalArgumentException("Categoría no válida. Debe ser: hamburguesa, acompañamiento, bebida, postre o perro caliente");
        }
        if (producto.getDescripcion() != null && producto.getDescripcion().length() > 500) {
            throw new IllegalArgumentException("La descripción no puede exceder 500 caracteres");
        }
        producto.setNombre(producto.getNombre().trim());
        producto.setCategoria(producto.getCategoria().trim().toLowerCase());
        if (producto.getDescripcion() != null) {
            producto.setDescripcion(producto.getDescripcion().trim());
        }
    }
}
