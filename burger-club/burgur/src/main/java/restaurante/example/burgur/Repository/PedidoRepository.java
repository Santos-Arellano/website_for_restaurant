package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    // Pedidos activos: estados distintos de ENTREGADO y CANCELADO (case-insensitive)
    @Query("SELECT p FROM Pedido p WHERE UPPER(p.estado) <> 'ENTREGADO' AND UPPER(p.estado) <> 'CANCELADO'")
    java.util.List<Pedido> findActivos();

    // Pedidos por cliente (navegación por relaciones carrito -> cliente)
    java.util.List<Pedido> findByCarritoClienteId(Long clienteId);

}
