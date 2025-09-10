package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

}
