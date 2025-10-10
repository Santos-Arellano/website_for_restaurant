package restaurante.example.burgur.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.AdiXItemCarrito;
import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.Pedido;
import restaurante.example.burgur.Model.CarritoItem;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Repository.AdiXItemCarritoRepository;
import restaurante.example.burgur.Repository.PedidoRepository;

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

        // Si el nuevo estado es "Entregado", se actualiza la fecha de entrega
        if (nuevoEstado.equalsIgnoreCase("Entregado")) {
            pedido.setFechaEntrega(LocalDateTime.now());
        }
        pedidoRepository.save(pedido);

    }

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

    // Obtener todos los Pedidos
    @Override
    public List<Pedido> obtenerTodosLosPedidos() {
        // Devuelve lista vacía si no hay datos; el controller decide el status
        return pedidoRepository.findAll();
    }



}
