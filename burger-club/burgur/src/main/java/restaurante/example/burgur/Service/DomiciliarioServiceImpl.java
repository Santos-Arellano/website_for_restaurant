package restaurante.example.burgur.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Domiciliario;
import restaurante.example.burgur.Repository.DomiciliarioRepository;

@Service
public class DomiciliarioServiceImpl implements DomiciliarioService {

    @Autowired
    private DomiciliarioRepository domiciliarioRepository;
    
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    
    @Override
    public Domiciliario save(Domiciliario domiciliario) {
        // Validación y normalización
        validarDomiciliario(domiciliario);
        
        // Guardar en la base de datos
        return domiciliarioRepository.save(domiciliario);
    }
    
    @Override
    public void eliminarDomiciliario(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El ID del domiciliario no puede ser nulo");
        }
        
        if (!domiciliarioRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe un domiciliario con el ID: " + id);
        }
        
        domiciliarioRepository.deleteById(id);
    }
    
    @Override
    public Optional<Domiciliario> obtenerDomiciliarioPorId(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return domiciliarioRepository.findById(id);
    }
    
    @Override
    public List<Domiciliario> obtenerTodosLosDomiciliarios() {
        return domiciliarioRepository.findAll();
    }
    
    @Override
    public List<Domiciliario> obtenerDomiciliariosDisponibles() {
        return domiciliarioRepository.findAll().stream()
                .filter(Domiciliario::isDisponible)
                .toList();
    }
    
    @Override
    public boolean existeDomiciliarioPorId(Long id) {
        return id != null && domiciliarioRepository.existsById(id);
    }
    
    @Override
    public long countTotal() {
        return domiciliarioRepository.count();
    }
    
    // ==========================================
    // VALIDACIONES
    // ==========================================
    
    @Override
    public void validarDomiciliario(Domiciliario domiciliario) {
        if (domiciliario == null) {
            throw new IllegalArgumentException("El domiciliario no puede ser nulo");
        }
        
        // Validar nombre
        if (domiciliario.getNombre() == null || domiciliario.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del domiciliario es obligatorio");
        }
        
        if (domiciliario.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre del domiciliario no puede exceder 100 caracteres");
        }
        
        // Validar cédula
        if (domiciliario.getCedula() == null || domiciliario.getCedula().trim().isEmpty()) {
            throw new IllegalArgumentException("La cédula del domiciliario es obligatoria");
        }
        
        if (domiciliario.getCedula().length() > 20) {
            throw new IllegalArgumentException("La cédula del domiciliario no puede exceder 20 caracteres");
        }
        
        // Normalizar datos
        domiciliario.setNombre(domiciliario.getNombre().trim());
        domiciliario.setCedula(domiciliario.getCedula().trim());
    }
}