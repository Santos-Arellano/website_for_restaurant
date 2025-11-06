package restaurante.example.burgur.Service.Impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurante.example.burgur.Model.Cupon;
import restaurante.example.burgur.Repository.CuponRepository;
import restaurante.example.burgur.Service.CuponService;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CuponServiceImpl implements CuponService {

    private final CuponRepository cuponRepository;

    public CuponServiceImpl(CuponRepository cuponRepository) {
        this.cuponRepository = cuponRepository;
    }

    @Override
    public Cupon crear(Cupon cupon) {
        return cuponRepository.save(cupon);
    }

    @Override
    public Cupon actualizar(Long id, Cupon cupon) {
        Cupon existente = cuponRepository.findById(id).orElseThrow(() -> new RuntimeException("Cupon no encontrado"));
        existente.setCodigo(cupon.getCodigo());
        existente.setTipo(cupon.getTipo());
        existente.setValor(cupon.getValor());
        existente.setDescripcion(cupon.getDescripcion());
        existente.setActivo(cupon.isActivo());
        return cuponRepository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        cuponRepository.deleteById(id);
    }

    @Override
    public List<Cupon> listar() {
        return cuponRepository.findAll();
    }

    @Override
    public Optional<Cupon> obtenerPorCodigo(String codigo) {
        return cuponRepository.findByCodigo(codigo);
    }

    @Override
    public Optional<Cupon> obtenerPorId(Long id) {
        return cuponRepository.findById(id);
    }
}