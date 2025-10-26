package restaurante.example.burgur.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

import restaurante.example.burgur.Model.Pedido;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Pedidos activos: estados distintos de ENTREGADO y CANCELADO (case-insensitive)
    @Query("SELECT p FROM Pedido p WHERE UPPER(p.estado) <> 'ENTREGADO' AND UPPER(p.estado) <> 'CANCELADO'")
    List<Pedido> findActivos();

    // Pedidos por cliente (navegación por relaciones carrito -> cliente)
    List<Pedido> findByCarritoClienteId(Long clienteId);

    // Pedidos por operador (para desvincular antes de eliminar operador)
    List<Pedido> findByOperadorId(Long operadorId);

    @Modifying
    @Transactional
    @Query("UPDATE Pedido p SET p.operador = null WHERE p.operador.id = :operadorId")
    void clearOperadorByOperadorId(@Param("operadorId") Long operadorId);
}
