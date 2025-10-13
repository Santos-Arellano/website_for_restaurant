//burger-club/burgur/src/main/java/restaurante/example/burgur/Service/AdicionalServiceImpl.java
package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Repository.AdicionalRepository;

@Service
@Transactional
public class AdicionalServiceImpl implements AdicionalService {

    @Autowired
    private AdicionalRepository adicionalRepository;

    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    
    @Override
    @Transactional
    public Adicional save(Adicional adicional) {
        try {
            // 1) Validación + normalización (incluye null checks)
            validateAdicional(adicional);

            // 2) Reglas de unicidad por nombre (case-insensitive)
            validateUniqueness(adicional);

            // 3) Preparar para persistencia
            prepareForPersistence(adicional);

            // 4) Guardar con manejo de errores de BD
            return adicionalRepository.save(adicional);
            
        } catch (DataIntegrityViolationException e) {
            // Manejar violaciones de integridad de BD
            throw new IllegalArgumentException("Error de integridad de datos: " + e.getMostSpecificCause().getMessage());
        } catch (Exception e) {
            // Manejar otros errores inesperados
            System.err.println("Error inesperado al guardar adicional: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error interno al guardar el adicional: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(Long id) {
        try {
            validateDeleteRequest(id);
            handleAdicionalDeletion(id);
            
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("No se puede eliminar el adicional porque está siendo usado por productos");
        } catch (Exception e) {
            System.err.println("Error al eliminar adicional: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error interno al eliminar adicional: " + e.getMessage(), e);
        }
    }

    @Override
    public Adicional findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        
        return adicionalRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("No existe el adicional con ID: " + id));
    }

    @Override
    public List<Adicional> findAll() {
        return adicionalRepository.findAll();
    }
    
    @Override
    public List<Adicional> findByActivoTrue() {
        return adicionalRepository.findByActivoTrue();
    }

    @Override
    public boolean existsById(Long id) {
        return id != null && adicionalRepository.existsById(id);
    }

    // ==========================================
    // MÉTODOS DE VALIDACIÓN Y PREPARACIÓN
    // ==========================================

    private void validateAdicional(Adicional adicional) {
        if (adicional == null) {
            throw new IllegalArgumentException("El adicional no puede ser nulo");
        }
        validateNombreAdicional(adicional);
        validatePrecioAdicional(adicional);
        validateCategoriasAdicional(adicional);
    }

    private void validateUniqueness(Adicional adicional) {
        if (adicional.getId() == null) {
            // CREAR - verificar que no existe
            validateCreateUniqueness(adicional);
        } else {
            // ACTUALIZAR - verificar existencia y unicidad
            validateUpdateUniqueness(adicional);
        }
    }

    private void validateCreateUniqueness(Adicional adicional) {
        if (adicionalRepository.existsByNombreIgnoreCase(adicional.getNombre())) {
            throw new IllegalArgumentException("Ya existe un adicional con el nombre: " + adicional.getNombre());
        }
    }

    private void validateUpdateUniqueness(Adicional adicional) {
        if (!adicionalRepository.existsById(adicional.getId())) {
            throw new IllegalArgumentException("No existe adicional con ID: " + adicional.getId());
        }
        if (adicionalRepository.existsByNombreIgnoreCaseAndIdNot(adicional.getNombre(), adicional.getId())) {
            throw new IllegalArgumentException("Ya existe otro adicional con el nombre: " + adicional.getNombre());
        }
    }

    private void validateDeleteRequest(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        if (!adicionalRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe el adicional con ID: " + id);
        }
    }

    private void handleAdicionalDeletion(Long id) {
        Adicional adicional = adicionalRepository.findById(id).orElse(null);
        if (hasActiveRelationships(adicional)) {
            deactivateAdicional(adicional);
        } else {
            adicionalRepository.deleteById(id);
        }
    }

    private boolean hasActiveRelationships(Adicional adicional) {
        return adicional != null && adicional.getProductos() != null && !adicional.getProductos().isEmpty();
    }

    private void deactivateAdicional(Adicional adicional) {
        adicional.setActivo(false);
        adicionalRepository.save(adicional);
        System.out.println("Adicional desactivado en lugar de eliminado debido a relaciones existentes");
    }
    
    private void validateNombreAdicional(Adicional adicional) {
        if (adicional.getNombre() == null || adicional.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del adicional es requerido");
        }
        
        if (adicional.getNombre().trim().length() > 100) {
            throw new IllegalArgumentException("El nombre del adicional no puede exceder 100 caracteres");
        }
    }
    
    private void validatePrecioAdicional(Adicional adicional) {
        if (adicional.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        
        if (adicional.getPrecio() > 500_000) {
            throw new IllegalArgumentException("El precio no puede exceder $500,000");
        }
    }
    
    private void validateCategoriasAdicional(Adicional adicional) {
        if (adicional.getCategoria() == null || adicional.getCategoria().isEmpty()) {
            throw new IllegalArgumentException("Debe asignarse al menos una categoría al adicional");
        }

        String[] categoriasPermitidas = {
            "hamburguesa", "acompañamiento", "bebida", "postre", "perro caliente"
        };
        
        for (String cat : adicional.getCategoria()) {
            validateSingleCategoria(cat, categoriasPermitidas);
        }
    }
    
    private void validateSingleCategoria(String cat, String[] categoriasPermitidas) {
        if (cat == null || cat.trim().isEmpty()) {
            throw new IllegalArgumentException("Una categoría del adicional está vacía o nula");
        }
        
        boolean categoriaValida = false;
        String catNormalizada = cat.trim().toLowerCase();
        
        for (String permitida : categoriasPermitidas) {
            if (permitida.equals(catNormalizada)) {
                categoriaValida = true;
                break;
            }
        }
        
        if (!categoriaValida) {
            throw new IllegalArgumentException(
                "Categoría no válida: '" + cat + "'. Debe ser una de: hamburguesa, acompañamiento, bebida, postre, perro caliente"
            );
        }
    }

    private void prepareForPersistence(Adicional adicional) {
        // Normalizar nombre
        if (adicional.getNombre() != null) {
            adicional.setNombre(adicional.getNombre().trim());
        }

        // Normalizar y limpiar categorías
        if (adicional.getCategoria() != null) {
            List<String> categoriasLimpias = adicional.getCategoria().stream()
                .filter(cat -> cat != null && !cat.trim().isEmpty())
                .map(cat -> cat.trim().toLowerCase())
                .distinct() // Eliminar duplicados
                .sorted() // Ordenar para consistencia
                .toList();
            
            adicional.setCategoria(categoriasLimpias);
        }

        // Asegurar que precio no sea negativo
        if (adicional.getPrecio() < 0) {
            adicional.setPrecio(0);
        }

        // Log para debugging
        System.out.println("Preparando adicional para persistencia: " + adicional.toString());
    }

    // ==========================================
    // MÉTODOS ADICIONALES DE UTILIDAD
    // ==========================================
}