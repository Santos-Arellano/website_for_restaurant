package restaurante.example.burgur.Service;

import restaurante.example.burgur.Model.Cupon;

import java.util.List;
import java.util.Optional;

public interface CuponService {
    Cupon crear(Cupon cupon);
    Cupon actualizar(Long id, Cupon cupon);
    void eliminar(Long id);
    List<Cupon> listar();
    Optional<Cupon> obtenerPorCodigo(String codigo);
    Optional<Cupon> obtenerPorId(Long id);
}