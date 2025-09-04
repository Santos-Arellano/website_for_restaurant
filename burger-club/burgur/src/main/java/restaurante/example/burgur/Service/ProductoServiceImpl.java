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
        return productoRepository.findAll();
    }
    
    @Override
    public Optional<Producto> findById(Long id) {
        if (id == null) return Optional.empty();
        return productoRepository.findById(id);
    }
    
    @Override
    public Producto save(Producto producto) {
        try {
            validateProducto(producto);
            return productoRepository.save(producto);
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar el producto: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void deleteById(Long id) throws IllegalArgumentException {
        if (id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        if (!productoRepository.existsById(id)) {
            throw new IllegalArgumentException("Producto no encontrado con ID: " + id);
        }
        try {
            productoRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el producto: " + e.getMessage(), e);
        }
    }
    
    @Override
    public boolean existsById(Long id) {
        return id != null && productoRepository.existsById(id);
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
        
        Map<String, List<Adicional>> adsPorCat = buildAdicionalesPorCategoria(adicionales);
        List<AdicionalesPermiXProducto> nuevos = createNewProductAdicionalesLinks(productos, adsPorCat, false);
        
        if (!nuevos.isEmpty()) {
            adicionalesPermiXProductoRepository.saveAll(nuevos);
        }
        return nuevos.size();
    }

    private AdicionalesPermiXProducto nuevoLink(Producto p, Adicional a) {
        AdicionalesPermiXProducto ap = new AdicionalesPermiXProducto();
        ap.setProducto(p);
        ap.setAdicional(a);
        return ap;
    }
    
    private Map<String, List<Adicional>> buildAdicionalesPorCategoria(List<Adicional> adicionales) {
        Map<String, List<Adicional>> adsPorCat = new HashMap<>();
        for (Adicional a : adicionales) {
            if (a.getCategoria() == null) continue;
            for (String c : a.getCategoria()) {
                if (c == null || c.isBlank()) continue;
                adsPorCat.computeIfAbsent(c.trim().toLowerCase(), k -> new ArrayList<>()).add(a);
            }
        }
        return adsPorCat;
    }
    
    private List<AdicionalesPermiXProducto> createNewProductAdicionalesLinks(
            List<Producto> productos, 
            Map<String, List<Adicional>> adsPorCat, 
            boolean isRebuild) {
        List<AdicionalesPermiXProducto> nuevos = new ArrayList<>();
        
        for (Producto p : productos) {
            String catP = p.getCategoria();
            if (catP == null || catP.isBlank()) continue;
            String key = catP.trim().toLowerCase();
            
            List<Adicional> compatibles = adsPorCat.getOrDefault(key, List.of());
            if (!isRebuild && compatibles.isEmpty()) continue;
            
            Set<Long> ya = null;
            if (!isRebuild) {
                // IDs ya vinculados para evitar duplicados (solo en update)
                ya = p.getAdicionales().stream()
                        .map(rel -> rel.getAdicional().getId())
                        .collect(java.util.stream.Collectors.toSet());
            }
            
            for (Adicional a : compatibles) {
                if (a.getId() == null) continue;
                if (!isRebuild && ya != null && ya.contains(a.getId())) continue;
                
                nuevos.add(nuevoLink(p, a));
                if (!isRebuild && ya != null) {
                    ya.add(a.getId());
                }
            }
        }
        
        return nuevos;
    }

    // Rebuild de los Adicionales Permitos para todos los productos
    @Transactional
    @Override
    public Integer rebuildAdicionalesDeTodosLosProductos() {
        List<Producto> productos = productoRepository.findAll();
        List<Adicional> adicionales = adicionalRepository.findAll();
        
        Map<String, List<Adicional>> adsPorCat = buildAdicionalesPorCategoria(adicionales);
        
        // 1) Borrar todos los vínculos actuales
        adicionalesPermiXProductoRepository.deleteAllInBatch();
        
        // 2) Recalcular y crear nuevos vínculos
        List<AdicionalesPermiXProducto> nuevos = createNewProductAdicionalesLinks(productos, adsPorCat, true);
        
        if (!nuevos.isEmpty()) {
            adicionalesPermiXProductoRepository.saveAll(nuevos);
        }
        return nuevos.size();
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
    @Transactional
    public List<Adicional> obtenerAdicionalesPermitidos(Long productoId){ 
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
    

    

    

    

    
    // ==========================================
    // MÉTODOS DE ACTUALIZACIÓN ESPECÍFICA
    // ==========================================
    

    

    

    

    
    // ==========================================
    // MÉTODOS ADICIONALES DE UTILIDAD
    // ==========================================
    

    

    



    // ==========================================
    // VALIDACIÓN
    // ==========================================
    
    private void validateProducto(Producto producto) {
        if (producto == null) throw new IllegalArgumentException("El producto no puede ser nulo");
        
        validateNombre(producto);
        validatePrecio(producto);
        validateStock(producto);
        validateCategoria(producto);
        validateDescripcion(producto);
        
        // Normalizar datos
        normalizeProductoData(producto);
    }
    
    private void validateNombre(Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es requerido");
        }
        if (producto.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre del producto no puede exceder 100 caracteres");
        }
    }
    
    private void validatePrecio(Producto producto) {
        if (producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (producto.getPrecio() > 1_000_000) {
            throw new IllegalArgumentException("El precio no puede exceder $1,000,000");
        }
    }
    
    private void validateStock(Producto producto) {
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
    }
    
    private void validateCategoria(Producto producto) {
        if (producto.getCategoria() == null || producto.getCategoria().trim().isEmpty()) {
            throw new IllegalArgumentException("La categoría es requerida");
        }
        
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
    }
    
    private void validateDescripcion(Producto producto) {
        if (producto.getDescripcion() != null && producto.getDescripcion().length() > 500) {
            throw new IllegalArgumentException("La descripción no puede exceder 500 caracteres");
        }
    }
    
    private void normalizeProductoData(Producto producto) {
        producto.setNombre(producto.getNombre().trim());
        producto.setCategoria(producto.getCategoria().trim().toLowerCase());
        if (producto.getDescripcion() != null) {
            producto.setDescripcion(producto.getDescripcion().trim());
        }
    }
}
