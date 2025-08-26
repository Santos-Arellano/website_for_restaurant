//burger-club/burgur/src/main/java/restaurante/example/burgur/Repository/ProductoRepository.java
package restaurante.example.burgur.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // ==========================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // ==========================================

    // nombre contiene (case-insensitive)
    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    // categoría exacta (case-insensitive)
    List<Producto> findByCategoriaIgnoreCase(String categoria);

    // por nuevo / popular / activo
    List<Producto> findByNuevo(boolean nuevo);
    List<Producto> findByPopular(boolean popular);
    List<Producto> findByActivo(boolean activo);

    // stock < limite
    List<Producto> findByStockLessThan(Integer limite);

    // rango de precio
    List<Producto> findByPrecioBetween(Double min, Double max);

    // ==========================================
    // MÉTODOS DE ESTADÍSTICAS Y AGREGACIONES
    // ==========================================

    long countByCategoriaIgnoreCase(String categoria);
    long countByNuevoTrue();
    long countByPopularTrue();
    long countByStockLessThan(Integer limite);

    // conteo por categoría
    @Query("SELECT p.categoria, COUNT(p) FROM Producto p GROUP BY p.categoria")
    List<Object[]> getCategoriaCount();

    // estadísticas de stock
    @Query("SELECT SUM(p.stock), AVG(p.stock), MIN(p.stock), MAX(p.stock) FROM Producto p")
    Object[] getStockStats();

    // ==========================================
    // ORDENAMIENTOS
    // ==========================================

    List<Producto> findAllByOrderByPrecioAsc();
    List<Producto> findAllByOrderByPrecioDesc();
    List<Producto> findAllByOrderByStockAsc();
    List<Producto> findAllByOrderByStockDesc();

    // ==========================================
    // MÉTODOS DE UTILIDAD
    // ==========================================

    // verificar si existe con el mismo nombre pero distinto id
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long excludeId);
}