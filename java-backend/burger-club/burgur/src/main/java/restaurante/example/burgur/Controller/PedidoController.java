package restaurante.example.burgur.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Model.Pedido;
import restaurante.example.burgur.Model.Operador;
import restaurante.example.burgur.Model.Domiciliario;
import restaurante.example.burgur.Service.CarritoService;
import restaurante.example.burgur.Service.ClienteService;
import restaurante.example.burgur.Service.PedidoService;
import restaurante.example.burgur.Service.DomiciliarioService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;
    @Autowired
    private CarritoService carritoService;
    @Autowired
    private ClienteService clienteService;
    @Autowired
    private DomiciliarioService domiciliarioService;

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
    public ResponseEntity<List<Pedido>> listarActivos() {
        return ResponseEntity.ok(pedidoService.obtenerPedidosActivos());
    }

    // Listar pedidos por cliente
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Pedido>> listarPorCliente(@PathVariable Long clienteId) {
        try {
            return ResponseEntity.ok(pedidoService.obtenerPedidosDeCliente(clienteId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener pedido por ID
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(@PathVariable Long id) {
        try {
            Pedido pedido = pedidoService.obtenerPedidoPorId(id);
            return ResponseEntity.ok(pedido);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
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
        // Asignar operador desde la sesión si existe
        Object op = session != null ? session.getAttribute("operador") : null;
        if (op instanceof Operador) {
            pedido.setOperador((Operador) op);
        }
        pedidoService.actualizarEstadoPedido(pedido, estado);
        return ResponseEntity.ok("Estado actualizado a " + estado);
    }

    // Asignar domiciliario manualmente a un pedido
    @PostMapping("/{id}/domiciliario")
    public ResponseEntity<?> asignarDomiciliario(
            @PathVariable Long id,
            @RequestParam Long domiciliarioId
    ) {
        try {
            Pedido pedido = pedidoService.obtenerPedidoPorId(id);
            if (pedido == null) {
                return ResponseEntity.notFound().build();
            }

            if (!domiciliarioService.existeDomiciliarioPorId(domiciliarioId)) {
                return ResponseEntity.badRequest().body("Domiciliario no encontrado");
            }
            Domiciliario dom = domiciliarioService.obtenerDomiciliarioPorId(domiciliarioId);
            if (dom == null) {
                return ResponseEntity.badRequest().body("Domiciliario no encontrado");
            }
            if (!dom.isActivo()) {
                return ResponseEntity.badRequest().body("El domiciliario está inactivo");
            }
            if (!dom.isDisponible()) {
                return ResponseEntity.badRequest().body("El domiciliario no está disponible");
            }

            // Liberar el anterior si es distinto
            Domiciliario anterior = pedido.getDomiciliario();
            if (anterior != null && !anterior.getId().equals(dom.getId())) {
                anterior.setDisponible(true);
                domiciliarioService.save(anterior);
            }

            // Asignar y marcar como no disponible
            pedido.setDomiciliario(dom);
            dom.setDisponible(false);
            domiciliarioService.save(dom);

            Pedido actualizado = pedidoService.save(pedido);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error interno del servidor");
        }
    }
}
