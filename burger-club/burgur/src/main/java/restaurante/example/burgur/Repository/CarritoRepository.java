package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Carrito;
@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    Carrito findByClienteIdAndEstadoTrue(Long id);
    
}
