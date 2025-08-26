//burger-club/burgur/src/main/java/restaurante/example/burgur/Service/ProductoService.java
package restaurante.example.burgur.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Producto;
@Service
public interface ProductoService {
    
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================    

    //Obtener todos los productos
    List<Producto> findAll();
    

    //Buscar producto por ID
    Optional<Producto> findById(Long id);
    
    //Guardar producto (crear o actualizar)
    Producto save(Producto producto);
    
    //Eliminar producto por ID
    void deleteById(Long id);

    //Verificar si existe un producto por ID
    boolean existsById(Long id);

    // ==========================================
    // MÉTODOS RELACIONADOS CON ADICIONALES
    // ==========================================
    
    // Actualizar los adicionales permitidos para todos los productos
    Integer updateAdicionalesDeTodosLosProductos();
    // Rebuild de los Adicionales Permitidos para todos los productos
    Integer rebuildAdicionalesDeTodosLosProductos();

    // ==========================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // ==========================================
    
    //Buscar productos por nombre (búsqueda parcial)
    List<Producto> findByNombre(String nombre);
    
    
    //Buscar productos por categoría
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

    //Proyectar los adicionales permitidos para un producto
    List<Adicional> obtenerAdicionalesPermitidos(Long productoId); 
    

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
    Producto updateStock(Long id, Integer nuevoStock);
    
    /**
     * Cambiar estado de producto nuevo
     */
    Producto toggleNuevo(Long id);
    
    /**
     * Cambiar estado de producto popular
     */
    Producto togglePopular(Long id);

    /**
     * Cambiar estado activo del producto
     */
    Producto toggleActivo(Long id);

    // ==========================================
    // MÉTODOS ADICIONALES DE UTILIDAD
    // ==========================================

    // Búsqueda avanzada de productos
    List<Producto> searchAdvanced(String nombre, String categoria,
                                   Boolean nuevo, Boolean popular,
                                   Boolean stockBajo);

    // Obtener productos más vendidos
    List<Producto> findTopSelling(int limit);

    // Obtener productos por rango de precio
    List<Producto> findByPriceRange(double minPrice, double maxPrice);



}