//burger-club/burgur/src/main/java/restaurante/example/burgur/Service/AdicionalServiceImpl.java
package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Repository.AdicionalRepository;

@Service
public class AdicionalServiceImpl implements AdicionalService {

    @Autowired
    private AdicionalRepository adicionalRepository;

    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    @Override
    // Crear o actualizar un adicional
    public Adicional save(Adicional adicional) {
        // 1) Validación + normalización (incluye null checks)
        validateAdicional(adicional);

        // 2) Reglas de unicidad por nombre (case-insensitive)
        if (adicional.getId() == null) {
            // CREAR
            if (adicionalRepository.existsByNombreIgnoreCase(adicional.getNombre())) {
                throw new IllegalArgumentException("Ya existe un adicional con el nombre: " + adicional.getNombre());
            }
        } else {
            // ACTUALIZAR
            if (!adicionalRepository.existsById(adicional.getId())) {
                throw new IllegalArgumentException("No existe adicional con ID: " + adicional.getId());
            }
            if (adicionalRepository.existsByNombreIgnoreCaseAndIdNot(adicional.getNombre(), adicional.getId())) {
                throw new IllegalArgumentException("Ya existe otro adicional con el nombre: " + adicional.getNombre());
            }
        }

        // 3) JPA decide INSERT/UPDATE
        return adicionalRepository.save(adicional);
    }

    @Override
    public void delete(Long id) {
        if (!adicionalRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe el adicional con ID: " + id);
        }
        adicionalRepository.deleteById(id);
    }

    @Override
    public Adicional findById(Long id) {
        if (!adicionalRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe el adicional con ID: " + id);
        }
        return adicionalRepository.findById(id).orElse(null);
    }

    @Override
    public List<Adicional> findAll() {
        // Devuelve lista vacía si no hay datos; el controller decide el status
        return adicionalRepository.findAll();
    }

    @Override
    public boolean existsById(Long id) {
        return adicionalRepository.existsById(id);
    }

    // ==========================================
    // VALIDACIÓN
    // ==========================================
    private void validateAdicional(Adicional adicional) {
        if (adicional == null) {
            throw new IllegalArgumentException("El adicional no puede ser nulo");
        }

        // Nombre
        if (adicional.getNombre() == null || adicional.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del adicional es requerido");
        }
        if (adicional.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre del adicional no puede exceder 100 caracteres");
        }

        // Precio
        if (adicional.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        if (adicional.getPrecio() > 500_000) {
            throw new IllegalArgumentException("El precio no puede exceder $500,000");
        }

        // Categorías (lista)
        if (adicional.getCategoria() == null || adicional.getCategoria().isEmpty()) {
            throw new IllegalArgumentException("Debe asignarse al menos una categoría al adicional");
        }
        String[] categoriasPermitidas = {"hamburguesa", "acompañamiento", "bebida", "postre", "perro caliente"};
        for (String cat : adicional.getCategoria()) {
            if (cat == null || cat.trim().isEmpty()) {
                throw new IllegalArgumentException("Una categoría del adicional está vacía o nula");
            }
            boolean categoriaValida = false;
            for (String permitida : categoriasPermitidas) {
                if (permitida.equalsIgnoreCase(cat.trim())) {
                    categoriaValida = true;
                    break;
                }
            }
            if (!categoriaValida) {
                throw new IllegalArgumentException(
                    "Categoría no válida: " + cat + ". Debe ser: hamburguesa, acompañamiento, bebida, postre o perro caliente"
                );
            }
        }

        // Normalización
        adicional.setNombre(adicional.getNombre().trim());
        List<String> categoriasNormalizadas = adicional.getCategoria().stream()
            .map(c -> c.trim().toLowerCase())
            .toList();
        adicional.setCategoria(categoriasNormalizadas);
    }
}