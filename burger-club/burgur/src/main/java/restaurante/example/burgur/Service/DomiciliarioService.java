package restaurante.example.burgur.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Domiciliario;

@Service
public interface DomiciliarioService {
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================

    // Crear o actualizar Domiciliario
    Domiciliario save(Domiciliario domiciliario);
    
    // Eliminar Domiciliario
    void eliminarDomiciliario(Long id);
    
    // Obtener Domiciliario por ID
    Optional<Domiciliario> obtenerDomiciliarioPorId(Long id);
    
    // Obtener todos los Domiciliarios
    List<Domiciliario> obtenerTodosLosDomiciliarios();
    
    // Obtener Domiciliarios disponibles
    List<Domiciliario> obtenerDomiciliariosDisponibles();
    
    // Verificar si un Domiciliario existe por ID
    boolean existeDomiciliarioPorId(Long id);
    
    // Contar total de domiciliarios
    long countTotal();

    // ==========================================
    // VALIDACIONES
    // ==========================================
    void validarDomiciliario(Domiciliario domiciliario);
}