package restaurante.example.burgur.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Operador;
import restaurante.example.burgur.Repository.OperadorRepository;

@Service
public class OperadorServiceImpl implements OperadorService {
    @Autowired
    private OperadorRepository operadorRepository;
    
        // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================

    @Override
    public List<Operador> obtenerTodosLosOperadores() {
        return operadorRepository.findAll();
    }

    @Override
    public Operador obtenerOperadorPorId(Long id) {
        Optional<Operador> operador = operadorRepository.findById(id);
        return operador.orElse(null);
    }

    @Override
    public Operador save(Operador operador) {
        return operadorRepository.save(operador);
    }

    @Override
    public void eliminarOperador(Long id) {
        if (!operadorRepository.existsById(id)) {
            throw new IllegalArgumentException("Operador con ID " + id + " no encontrado");
        }
        operadorRepository.deleteById(id);
    }

    // ==========================================
    // MÉTODOS ESPECÍFICOS DE NEGOCIO
    // ==========================================

    public List<Operador> obtenerOperadoresDisponibles() {
        return operadorRepository.findAll().stream()
                .filter(Operador::isDisponible)
                .toList();
    }

    public long countTotal() {
        return operadorRepository.count();
    }

    public void cambiarDisponibilidad(Long id, boolean disponible) {
        Operador operador = obtenerOperadorPorId(id);
        if (operador != null) {
            operador.setDisponible(disponible);
            operadorRepository.save(operador);
        } else {
            throw new IllegalArgumentException("Operador con ID " + id + " no encontrado");
        }
    }
    
}
