package restaurante.example.burgur.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Model.Pedido;
import restaurante.example.burgur.Service.CarritoService;
import restaurante.example.burgur.Service.ClienteService;
import restaurante.example.burgur.Service.PedidoService;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;
    @Autowired
    private CarritoService carritoService;
    @Autowired
    private ClienteService clienteService;

    // Crear pedido desde carrito cerrado
    @PostMapping("/crear")
    public ResponseEntity<String> crearPedidoDesdeCarrito(@RequestParam Long clienteId) {
        Cliente cliente = clienteService.obtenerClientePorId(clienteId);
        Carrito carrito = carritoService.carritoActivoCliente(cliente);
        // Si el carrito activo no tiene items, tomamos el último cerrado sin pedido
        if (carrito.getCarritoItems() == null || carrito.getCarritoItems().isEmpty()) {
            carrito = carritoService.ultimoCarritoCerradoSinPedido(cliente);
        } else if (carrito.getEstado()) {
            // Si tiene items y está activo, lo cerramos
            carrito = carritoService.enviarCarritoAPedido(carrito);
        }
        pedidoService.crearPedido(carrito);
        return ResponseEntity.ok("Pedido creado exitosamente");
    }

    // Listar pedidos
    @GetMapping("")
    public ResponseEntity<List<Pedido>> listarPedidos() {
        return ResponseEntity.ok(pedidoService.obtenerTodosLosPedidos());
    }

    // Obtener pedido por ID
    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(@PathVariable Long id) {
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        return ResponseEntity.ok(pedido);
    }

    // Actualizar estado del pedido
    @PostMapping("/{id}/estado")
    public ResponseEntity<String> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado
    ) {
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        pedidoService.actualizarEstadoPedido(pedido, estado);
        return ResponseEntity.ok("Estado actualizado a " + estado);
    }
}
