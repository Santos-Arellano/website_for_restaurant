//burger-club/burgur/src/main/java/restaurante/example/burgur/Repository/AdicionalRepository.java
package restaurante.example.burgur.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Adicional;

@Repository
public interface AdicionalRepository extends JpaRepository<Adicional, Long> {
    
    // ==========================================
    // MÉTODOS DE BÚSQUEDA
    // ==========================================
    
    // Verificar si un Adicional existe por nombre (case-insensitive)
    boolean existsByNombreIgnoreCase(String nombre);
    
    // Verificar si un Adicional existe por nombre y diferente ID (para updates)
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
    
    // Buscar adicional por nombre (case-insensitive)
    Adicional findByNombreIgnoreCase(String nombre);
    
    // Buscar adicionales activos
    List<Adicional> findByActivoTrue();
    
    // Buscar adicionales por precio menor que
    List<Adicional> findByPrecioLessThan(Double precio);
    
    // Buscar adicionales por precio entre
    List<Adicional> findByPrecioBetween(Double min, Double max);
    
    // Contar adicionales activos
    long countByActivoTrue();
}