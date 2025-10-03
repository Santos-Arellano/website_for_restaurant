package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Operador;

@Service
public interface OperadorService {

    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
    public List<Operador> obtenerTodosLosOperadores();
    public Operador obtenerOperadorPorId(Long id);
    public Operador save(Operador operador);
    public void eliminarOperador(Long id);

    // ==========================================
    // MÉTODOS ESPECÍFICOS DE NEGOCIO
    // ==========================================
    public List<Operador> obtenerOperadoresDisponibles();
    public long countTotal();
    public void cambiarDisponibilidad(Long id, boolean disponible);


}
