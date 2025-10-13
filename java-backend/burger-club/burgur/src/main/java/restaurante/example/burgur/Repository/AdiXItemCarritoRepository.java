package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.AdiXItemCarrito;

@Repository
public interface AdiXItemCarritoRepository extends JpaRepository<AdiXItemCarrito, Long> {
    
}
