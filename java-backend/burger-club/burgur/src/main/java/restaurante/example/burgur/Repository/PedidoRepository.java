package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Query("SELECT p FROM Pedido p WHERE UPPER(p.estado) NOT IN ('ENTREGADO','CANCELADO') ORDER BY p.fechaCreacion DESC")
    java.util.List<Pedido> findActivos();

    @Query("SELECT p FROM Pedido p WHERE p.carrito.cliente.id = :clienteId ORDER BY p.fechaCreacion DESC")
    java.util.List<Pedido> findByCarritoClienteId(@Param("clienteId") Long clienteId);

}
