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
    
    //Obtener solo productos activos
    List<Producto> findByActivoTrue();
    

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
    


    //Proyectar los adicionales permitidos para un producto
    List<Adicional> obtenerAdicionalesPermitidos(Long productoId); 
    

    // ==========================================
    // MÉTODOS DE ESTADÍSTICAS
    // ==========================================
    
    /**
     * Contar total de productos
     */
    long countTotal();
    

    
    // ==========================================
    // MÉTODOS DE ACTUALIZACIÓN ESPECÍFICA
    // ==========================================
    




}