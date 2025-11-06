package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import restaurante.example.burgur.Model.Cupon;

import java.util.Optional;

public interface CuponRepository extends JpaRepository<Cupon, Long> {
    Optional<Cupon> findByCodigo(String codigo);
}