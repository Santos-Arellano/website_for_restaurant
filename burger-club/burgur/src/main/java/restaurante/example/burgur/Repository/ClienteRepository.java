//burger-club/burgur/src/main/java/restaurante/example/burgur/Repository/ClienteRepository.java
package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Cliente;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    // ==========================================
    // MÉTODOS DE BÚSQUEDA
    // ==========================================

    // Verificar si un Cliente existe por correo
    boolean existsByCorreoIgnoreCase(String correo);
    // Verificar si un Cliente existe por correo y diferente ID
    boolean existsByCorreoIgnoreCaseAndIdNot(String correo, Long id);
    Cliente findByCorreoIgnoreCase(String email);
    

}
