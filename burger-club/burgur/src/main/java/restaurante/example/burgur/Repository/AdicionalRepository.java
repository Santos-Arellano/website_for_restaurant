package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import restaurante.example.burgur.Model.Adicional;

public interface AdicionalRepository extends JpaRepository<Adicional, Long> {

    // ==========================================
    // MÉTODOS DE BÚSQUEDA
    // ==========================================
    // Verificar si un Adicional existe por nombre
    boolean existsByNombreIgnoreCase(String nombre);
    // Verificar si un Adicional existe por nombre y diferente ID
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    
    
}   
