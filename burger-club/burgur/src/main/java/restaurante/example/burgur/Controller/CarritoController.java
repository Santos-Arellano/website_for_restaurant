package restaurante.example.burgur.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.CarritoItem;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Service.CarritoService;
import restaurante.example.burgur.Service.ClienteService;
import restaurante.example.burgur.Service.ProductoService;
import restaurante.example.burgur.Service.AdicionalService;

@RestController
@RequestMapping("/carrito")
public class CarritoController {

    @Autowired
    private CarritoService carritoService;
    @Autowired
    private ClienteService clienteService;
    @Autowired
    private ProductoService productoService;
    @Autowired
    private AdicionalService adicionalService;

    // Obtener carrito activo del cliente
    @GetMapping("/activo/{clienteId}")
    public ResponseEntity<Carrito> obtenerCarritoActivo(@PathVariable Long clienteId) {
        Cliente cliente = clienteService.obtenerClientePorId(clienteId);
        Carrito carrito = carritoService.carritoActivoCliente(cliente);
        return ResponseEntity.ok(carrito);
    }

    // Añadir producto al carrito
    @PostMapping("/agregar")
    public ResponseEntity<Carrito> agregarProducto(
            @RequestParam Long clienteId,
            @RequestParam Long productoId,
            @RequestParam(required = false) List<Long> adicionalesIds,
            @RequestParam(defaultValue = "1") int cantidad,
            @RequestParam(required = false) Long carritoId
    ) {
        Cliente cliente = clienteService.obtenerClientePorId(clienteId);
        Carrito carrito = null;
        if (carritoId != null) {
            carrito = new Carrito();
            carrito.setId(carritoId);
        }
        Producto producto = productoService.findById(productoId).orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        List<Adicional> adicionales = java.util.Collections.emptyList();
        if (adicionalesIds != null && !adicionalesIds.isEmpty()) {
            adicionales = adicionalesIds.stream()
                    .map(id -> adicionalService.findById(id))
                    .filter(a -> a != null)
                    .toList();
        }
        Carrito actualizado = carritoService.añadirProductoAlCarrito(producto, adicionales, cantidad, carrito, cliente);
        return ResponseEntity.ok(actualizado);
    }

    // Borrar item del carrito
    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Carrito> borrarItem(
            @PathVariable Long itemId,
            @RequestParam Long clienteId
    ) {
        Cliente cliente = clienteService.obtenerClientePorId(clienteId);
        Carrito carrito = carritoService.carritoActivoCliente(cliente);
        CarritoItem item = new CarritoItem();
        item.setId(itemId);
        Carrito actualizado = carritoService.borrarProductoDelCarrito(item, carrito);
        return ResponseEntity.ok(actualizado);
    }

    // Vaciar carrito
    @PostMapping("/vaciar")
    public ResponseEntity<Carrito> vaciar(
            @RequestParam Long clienteId
    ) {
        Cliente cliente = clienteService.obtenerClientePorId(clienteId);
        Carrito carrito = carritoService.carritoActivoCliente(cliente);
        Carrito actualizado = carritoService.vaciarCarrito(carrito);
        return ResponseEntity.ok(actualizado);
    }

    // Enviar carrito a pedido (cerrar)
    @PostMapping("/enviar")
    public ResponseEntity<Carrito> enviarAPedido(
            @RequestParam Long clienteId
    ) {
        Cliente cliente = clienteService.obtenerClientePorId(clienteId);
        Carrito carrito = carritoService.carritoActivoCliente(cliente);
        Carrito cerrado = carritoService.enviarCarritoAPedido(carrito);
        return ResponseEntity.ok(cerrado);
    }
}