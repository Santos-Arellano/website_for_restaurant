package restaurante.example.burgur.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Entities.Producto;
import restaurante.example.burgur.Repository.ProductoRepository;

@Service
public class ProductoServiceImpl implements ProductoService {
    
    @Autowired
    private ProductoRepository productoRepository;
    
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    
    @Override
    public List<Producto> findAll() {
        try {
            List<Producto> productos = productoRepository.findAll();
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error al obtener todos los productos: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public Optional<Producto> findById(Integer id) {
        try {
            if (id == null) {
                return Optional.empty();
            }
            Producto producto = productoRepository.findById(id);
            return Optional.ofNullable(producto);
        } catch (Exception e) {
            System.err.println("Error al buscar producto por ID " + id + ": " + e.getMessage());
            return Optional.empty();
        }
    }
    
    @Override
    public Producto save(Producto producto) {
        try {
            // Validaciones básicas
            validateProducto(producto);
            
            return productoRepository.save(producto);
        } catch (IllegalArgumentException e) {
            throw e; // Re-lanzar errores de validación
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar el producto: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void deleteById(Integer id) {
        try {
            if (id == null) {
                throw new IllegalArgumentException("El ID no puede ser nulo");
            }
            
            if (!productoRepository.existsById(id)) {
                throw new RuntimeException("Producto no encontrado con ID: " + id);
            }
            
            productoRepository.deleteById(id);
        } catch (IllegalArgumentException | RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el producto: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean existsById(Integer id) {
        try {
            return id != null && productoRepository.existsById(id);
        } catch (Exception e) {
            System.err.println("Error al verificar existencia del producto " + id + ": " + e.getMessage());
            return false;
        }
    }
    
    // ==========================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // ==========================================
    
    @Override
    public List<Producto> findByNombre(String nombre) {
        try {
            if (nombre == null || nombre.trim().isEmpty()) {
                return findAll();
            }
            List<Producto> productos = productoRepository.findByNombre(nombre.trim());
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error al buscar productos por nombre: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByCategoria(String categoria) {
        try {
            if (categoria == null || categoria.trim().isEmpty() || 
                "todos".equalsIgnoreCase(categoria.trim())) {
                return findAll();
            }
            List<Producto> productos = productoRepository.findByCategoria(categoria.trim());
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error al buscar productos por categoría: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> search(String termino) {
        try {
            if (termino == null || termino.trim().isEmpty()) {
                return findAll();
            }
            List<Producto> productos = productoRepository.search(termino.trim());
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error en la búsqueda: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByNuevo(boolean nuevo) {
        try {
            List<Producto> productos = productoRepository.findByNuevo(nuevo);
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error al buscar productos nuevos: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByPopular(boolean popular) {
        try {
            List<Producto> productos = productoRepository.findByPopular(popular);
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error al buscar productos populares: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByStockBajo(int limite) {
        try {
            List<Producto> productos = productoRepository.findByStockBajo(limite);
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error al buscar productos con stock bajo: " + e.getMessage());
            return List.of();
        }
    }
    
    @Override
    public List<Producto> findByActivo(boolean activo) {
        try {
            List<Producto> productos = productoRepository.findByActivo(activo);
            return productos != null ? productos : List.of();
        } catch (Exception e) {
            System.err.println("Error al buscar productos activos: " + e.getMessage());
            return List.of();
        }
    }
    
    // ==========================================
    // MÉTODOS DE ESTADÍSTICAS
    // ==========================================
    
    @Override
    public long countTotal() {
        try {
            return findAll().size();
        } catch (Exception e) {
            System.err.println("Error al contar productos totales: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByCategoria(String categoria) {
        try {
            return findByCategoria(categoria).size();
        } catch (Exception e) {
            System.err.println("Error al contar productos por categoría: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByNuevo() {
        try {
            return findByNuevo(true).size();
        } catch (Exception e) {
            System.err.println("Error al contar productos nuevos: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByPopular() {
        try {
            return findByPopular(true).size();
        } catch (Exception e) {
            System.err.println("Error al contar productos populares: " + e.getMessage());
            return 0;
        }
    }
    
    @Override
    public long countByStockBajo() {
        try {
            return findByStockBajo(5).size(); // Considera stock bajo si es menor a 5
        } catch (Exception e) {
            System.err.println("Error al contar productos con stock bajo: " + e.getMessage());
            return 0;
        }
    }
    
    // ==========================================
    // MÉTODOS DE ACTUALIZACIÓN ESPECÍFICA
    // ==========================================
    
    @Override
    public Producto updateStock(Integer id, Integer nuevoStock) {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (!productoOpt.isPresent()) {
                throw new RuntimeException("Producto no encontrado con ID: " + id);
            }
            
            if (nuevoStock == null || nuevoStock < 0) {
                throw new IllegalArgumentException("El stock no puede ser negativo");
            }
            
            Producto producto = productoOpt.get();
            producto.setStock(nuevoStock);
            return save(producto);
        } catch (IllegalArgumentException | RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar el stock: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Producto toggleNuevo(Integer id) {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (!productoOpt.isPresent()) {
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
    public Producto togglePopular(Integer id) {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (!productoOpt.isPresent()) {
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
    public Producto toggleActivo(Integer id) {
        try {
            Optional<Producto> productoOpt = findById(id);
            if (!productoOpt.isPresent()) {
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
    
    /**
     * Búsqueda avanzada con múltiples filtros
     */
    public List<Producto> searchAdvanced(String nombre, String categoria, 
                                       Boolean nuevo, Boolean popular, 
                                       Boolean stockBajo) {
        try {
            List<Producto> productos = findAll();
            
            return productos.stream()
                .filter(p -> {
                    if (p == null) return false;
                    
                    // Filtro por nombre
                    if (nombre != null && !nombre.trim().isEmpty()) {
                        String nombreLower = nombre.toLowerCase();
                        boolean matchesName = (p.getNombre() != null && p.getNombre().toLowerCase().contains(nombreLower)) ||
                                            (p.getDescripcion() != null && p.getDescripcion().toLowerCase().contains(nombreLower));
                        if (!matchesName) return false;
                    }
                    
                    // Filtro por categoría
                    if (categoria != null && !categoria.trim().isEmpty() && 
                        !"todos".equalsIgnoreCase(categoria)) {
                        if (p.getCategoria() == null || !p.getCategoria().equalsIgnoreCase(categoria)) return false;
                    }
                    
                    // Filtro por nuevo
                    if (nuevo != null && p.isNuevo() != nuevo) return false;
                    
                    // Filtro por popular
                    if (popular != null && p.isPopular() != popular) return false;
                    
                    // Filtro por stock bajo
                    if (stockBajo != null && stockBajo && !p.isStockBajo()) return false;
                    
                    return true;
                })
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error en búsqueda avanzada: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Obtener productos más vendidos (simulado)
     */
    public List<Producto> findTopSelling(int limit) {
        try {
            return findByPopular(true).stream()
                .limit(Math.max(1, limit))
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al obtener productos más vendidos: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Obtener productos por rango de precio
     */
    public List<Producto> findByPriceRange(double minPrice, double maxPrice) {
        try {
            if (minPrice < 0 || maxPrice < minPrice) {
                throw new IllegalArgumentException("Rango de precios inválido");
            }
            
            return findAll().stream()
                .filter(p -> p != null && p.getPrecio() >= minPrice && p.getPrecio() <= maxPrice)
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error al buscar por rango de precio: " + e.getMessage());
            return List.of();
        }
    }
    
    /**
     * Validar datos del producto antes de guardar
     */
    private void validateProducto(Producto producto) {
        if (producto == null) {
            throw new IllegalArgumentException("El producto no puede ser nulo");
        }
        
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es requerido");
        }
        
        if (producto.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre del producto no puede exceder 100 caracteres");
        }
        
        if (producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        
        if (producto.getPrecio() > 1000000) {
            throw new IllegalArgumentException("El precio no puede exceder $1,000,000");
        }
        
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        
        if (producto.getCategoria() == null || producto.getCategoria().trim().isEmpty()) {
            throw new IllegalArgumentException("La categoría es requerida");
        }
        
        // Validar categorías permitidas
        String[] categoriasPermitidas = {"hamburguesa", "acompañamiento", "bebida", "postre", "perro caliente"};
        boolean categoriaValida = false;
        for (String cat : categoriasPermitidas) {
            if (cat.equalsIgnoreCase(producto.getCategoria().trim())) {
                categoriaValida = true;
                break;
            }
        }
        
        if (!categoriaValida) {
            throw new IllegalArgumentException("Categoría no válida. Debe ser: hamburguesa, acompañamiento, bebida, postre o perro caliente");
        }
        
        if (producto.getDescripcion() != null && producto.getDescripcion().length() > 500) {
            throw new IllegalArgumentException("La descripción no puede exceder 500 caracteres");
        }
        
        // Normalizar datos
        producto.setNombre(producto.getNombre().trim());
        producto.setCategoria(producto.getCategoria().trim().toLowerCase());
        if (producto.getDescripcion() != null) {
            producto.setDescripcion(producto.getDescripcion().trim());
        }
    }
}