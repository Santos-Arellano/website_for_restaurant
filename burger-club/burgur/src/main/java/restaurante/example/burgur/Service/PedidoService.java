package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.Pedido;
import restaurante.example.burgur.Model.Producto;
@Service
public interface PedidoService {
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================

    //Crear Pedido
    void crearPedido(Carrito carrito);

    // Guardar Pedido
    Pedido save(Pedido pedido);

    //Actualizar Estado Pedido
    void actualizarEstadoPedido(Pedido pedido, String nuevoEstado);

    //Obtener Pedido por ID
    Pedido obtenerPedidoPorId(Long id);


    //Obtener todos los Pedidos
    List<Pedido> obtenerTodosLosPedidos();

    //Obtener pedidos activos (no entregados ni cancelados)
    List<Pedido> obtenerPedidosActivos();

    //Obtener pedidos de un cliente
    List<Pedido> obtenerPedidosDeCliente(Long clienteId);

    // //Eliminar Pedido por ID
    // void eliminarPedido(Long id);

}
