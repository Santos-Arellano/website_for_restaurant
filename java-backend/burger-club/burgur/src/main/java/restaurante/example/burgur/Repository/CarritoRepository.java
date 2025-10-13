package restaurante.example.burgur.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import restaurante.example.burgur.Model.Carrito;
@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    Carrito findByClienteIdAndEstadoTrue(Long id);
    
    @Query("SELECT c FROM Carrito c WHERE c.cliente.id = :clienteId AND c.estado = false AND c.pedido IS NULL ORDER BY c.id DESC")
    Carrito findTopByClienteIdAndEstadoFalseAndPedidoIsNullOrderByIdDesc(@Param("clienteId") Long clienteId);
    
}
