package restaurante.example.burgur.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import restaurante.example.burgur.Entities.Producto;

public interface ProductoService {
    
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    
    /**
     * Obtener todos los productos
     */
    List<Producto> findAll();
    
    /**
     * Buscar producto por ID
     */
    Optional<Producto> findById(Integer id);
    
    /**
     * Guardar producto (crear o actualizar)
     */
    Producto save(Producto producto);
    
    /**
     * Eliminar producto por ID
     */
    void deleteById(Integer id);
    
    /**
     * Verificar si existe un producto por ID
     */
    boolean existsById(Integer id);
    
    // ==========================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // ==========================================
    
    /**
     * Buscar productos por nombre (búsqueda parcial)
     */
    List<Producto> findByNombre(String nombre);
    
    /**
     * Buscar productos por categoría
     */
    List<Producto> findByCategoria(String categoria);
    
    /**
     * Buscar productos por múltiples criterios
     * Busca en nombre, descripción e ingredientes
     */
    List<Producto> search(String termino);
    
    /**
     * Obtener productos nuevos
     */
    List<Producto> findByNuevo(boolean nuevo);
    
    /**
     * Obtener productos populares
     */
    List<Producto> findByPopular(boolean popular);
    
    /**
     * Obtener productos con stock bajo
     */
    List<Producto> findByStockBajo(int limite);
    
    /**
     * Obtener productos activos
     */
    List<Producto> findByActivo(boolean activo);
    
    // ==========================================
    // MÉTODOS DE ESTADÍSTICAS
    // ==========================================
    
    /**
     * Contar total de productos
     */
    long countTotal();
    
    /**
     * Contar productos por categoría
     */
    long countByCategoria(String categoria);
    
    /**
     * Contar productos nuevos
     */
    long countByNuevo();
    
    /**
     * Contar productos populares
     */
    long countByPopular();
    
    /**
     * Contar productos con stock bajo
     */
    long countByStockBajo();
    
    // ==========================================
    // MÉTODOS DE ACTUALIZACIÓN ESPECÍFICA
    // ==========================================
    
    /**
     * Actualizar solo el stock de un producto
     */
    Producto updateStock(Integer id, Integer nuevoStock);
    
    /**
     * Cambiar estado de producto nuevo
     */
    Producto toggleNuevo(Integer id);
    
    /**
     * Cambiar estado de producto popular
     */
    Producto togglePopular(Integer id);
    
    /**
     * Cambiar estado activo del producto
     */
    Producto toggleActivo(Integer id);
}