package restaurante.example.burgur.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.AdiXItemCarrito;
import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.Pedido;
import restaurante.example.burgur.Model.CarritoItem;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Repository.AdiXItemCarritoRepository;
import restaurante.example.burgur.Repository.PedidoRepository;
import restaurante.example.burgur.Model.Domiciliario;

@Service
public class PedidoServiceImpl implements PedidoService {
    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ProductoService productoService;
    @Autowired
    private AdicionalService adicionalService;
    @Autowired
    private AdiXItemCarritoRepository adiXItemCarritoRepository;
    @Autowired
    private DomiciliarioService domiciliarioService;

    
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================    

    //Crear Pedido
    @Override
    public void crearPedido(Carrito carrito) {
        //1) Validar que el carrito no sea null
        if (carrito == null || carrito.getId() == null) {
            throw new IllegalArgumentException("El carrito no puede ser null.");
        }

        // 2) Validar que el carrito tenga items
        if (carrito.getCarritoItems() == null || carrito.getCarritoItems().isEmpty()) {
            throw new IllegalArgumentException("El carrito no tiene items.");
        }

        // 3) Validar que el carrito esté inactivo
        if (carrito.getEstado()) {
            throw new IllegalArgumentException("El carrito debe estar inactivo para crear un pedido.");
        }

        //2) Crear Pedido
        Pedido nuevoPedido = new Pedido();
        nuevoPedido.setFechaCreacion(LocalDateTime.now());
        nuevoPedido.setFechaEntrega(null);
        nuevoPedido.setEstado("Cocinando");
        nuevoPedido.setCarrito(carrito);
        // Se le asignan null a domiciliario y operador, ya que se asignarán posteriormente
        nuevoPedido.setOperador(null);
        nuevoPedido.setDomiciliario(null);
        save(nuevoPedido);
    }

    // Guardar Pedido
    @Override
    public Pedido save(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    //Actualizar Estado Pedido
    @Override
    public void actualizarEstadoPedido(Pedido pedido, String nuevoEstado) {
        // 1) Validar parámetros de entrada
        if (pedido == null || pedido.getId() == null) {
            throw new IllegalArgumentException("El pedido no puede ser null.");
        }
        if (nuevoEstado == null || nuevoEstado.isEmpty()) {
            throw new IllegalArgumentException("El nuevo estado no puede ser null o vacío.");
        }
        // 2) Actualizar estado del pedido
        pedido.setEstado(nuevoEstado);

        // Normalizar estado para comparaciones
        String estadoUpper = nuevoEstado.trim().toUpperCase();

        // Si el nuevo estado es "ENTREGADO", se actualiza la fecha de entrega y se libera el domiciliario
        if (estadoUpper.equals("ENTREGADO")) {
            pedido.setFechaEntrega(LocalDateTime.now());
            Domiciliario dom = pedido.getDomiciliario();
            if (dom != null) {
                dom.setDisponible(true);
                domiciliarioService.save(dom);
            }
        }

        // Si el estado es "ENVIADO" o "EN_CAMINO", asignar un domiciliario disponible si no tiene
        if (estadoUpper.equals("ENVIADO") || estadoUpper.equals("EN_CAMINO")) {
            if (pedido.getDomiciliario() == null) {
                List<Domiciliario> disponibles = domiciliarioService.obtenerDomiciliariosDisponibles();
                if (disponibles == null || disponibles.isEmpty()) {
                    throw new IllegalStateException("No hay domiciliarios disponibles para asignar.");
                }
                Domiciliario asignado = disponibles.get(0);
                asignado.setDisponible(false);
                domiciliarioService.save(asignado);
                pedido.setDomiciliario(asignado);
            }
        }

        // Si el estado es "CANCELADO", liberar domiciliario si estaba asignado
        if (estadoUpper.equals("CANCELADO")) {
            Domiciliario dom = pedido.getDomiciliario();
            if (dom != null) {
                dom.setDisponible(true);
                domiciliarioService.save(dom);
            }
        }

        pedidoRepository.save(pedido);

    }

    @Override
    public List<Pedido> obtenerTodosLosPedidos() {
        // Devuelve lista vacía si no hay datos; el controller decide el status
        return pedidoRepository.findAll();
    }

    // Métodos adicionales como obtenerPedidosActivos() y obtenerPedidosDeCliente()
    // no están definidos en la interfaz PedidoService de este proyecto.
    // Se eliminan para evitar errores de compilación. Si se requieren,
    // deben añadirse primero a la interfaz y al PedidoRepository.

    //Obtener Pedido por ID
    @Override
    public Pedido obtenerPedidoPorId(Long id) {
        // 1) Validar parámetro de entrada
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("El ID del pedido no puede ser null o menor o igual a cero.");
        }

        // 2) Buscar el pedido por ID
        if(pedidoRepository.findById(id).isPresent()){
            return pedidoRepository.findById(id).get();
        } else {
            throw new IllegalArgumentException("El pedido con ID " + id + " no existe.");
        }
    }

    // (Método duplicado eliminado) obtenerTodosLosPedidos()



}
