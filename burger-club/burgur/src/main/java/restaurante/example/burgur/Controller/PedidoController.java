package restaurante.example.burgur.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

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

    // Listar pedidos activos (no entregados ni cancelados)
    @GetMapping("/activos")
    public ResponseEntity<List<Pedido>> listarPedidosActivos() {
        return ResponseEntity.ok(pedidoService.obtenerPedidosActivos());
    }

    // Obtener pedido por ID
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(@PathVariable Long id) {
        try {
            Pedido pedido = pedidoService.obtenerPedidoPorId(id);
            return ResponseEntity.ok(pedido);
        } catch (IllegalArgumentException e) {
            // Pedido no encontrado o ID inválido
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Error inesperado en el servidor
            return ResponseEntity.internalServerError().build();
        }
    }

    // Listar pedidos por cliente
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Pedido>> listarPedidosPorCliente(@PathVariable Long clienteId) {
        try {
            return ResponseEntity.ok(pedidoService.obtenerPedidosDeCliente(clienteId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Actualizar estado del pedido
    @PostMapping("/{id}/estado")
    public ResponseEntity<String> actualizarEstado(
            @PathVariable Long id,
            @RequestParam String estado,
            HttpSession session
    ) {
        Pedido pedido = pedidoService.obtenerPedidoPorId(id);
        // Si hay un operador en sesión, asignarlo al pedido
        Object opObj = session != null ? session.getAttribute("operador") : null;
        if (opObj instanceof restaurante.example.burgur.Model.Operador operador) {
            pedido.setOperador(operador);
        }
        pedidoService.actualizarEstadoPedido(pedido, estado);
        return ResponseEntity.ok("Estado actualizado a " + estado);
    }

    // Asignar domiciliario al pedido (solo cuando estado es ENVIADO)
    @PostMapping("/{id}/domiciliario")
    public ResponseEntity<Pedido> asignarDomiciliario(
            @PathVariable Long id,
            @RequestParam Long domiciliarioId
    ) {
        try {
            Pedido actualizado = pedidoService.asignarDomiciliario(id, domiciliarioId);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
