package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.ProdYAdiPedido;

@Repository
public interface ProdYAdiPedidoRepository extends JpaRepository<ProdYAdiPedido, Long> {
    
}
