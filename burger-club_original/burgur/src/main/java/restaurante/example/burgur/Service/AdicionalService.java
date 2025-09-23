//burger-club/burgur/src/main/java/restaurante/example/burgur/Service/AdicionalService.java
package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Adicional;

@Service
public interface AdicionalService {
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    
    // Crear o actualizar un adicional
    Adicional save(Adicional adicional);
    // Eliminar un adicional por su ID
    void delete(Long id);
    // Obtener un adicional por su ID
    Adicional findById(Long id);
    // Obtener todos los adicionales
    List<Adicional> findAll();
    // Obtener solo adicionales activos
    List<Adicional> findByActivoTrue();
    // Verificar si un adicional existe por su ID
    boolean existsById(Long id);
}
