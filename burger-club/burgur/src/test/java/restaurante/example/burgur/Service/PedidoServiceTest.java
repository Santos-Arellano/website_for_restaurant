package restaurante.example.burgur.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.CarritoItem;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Model.Pedido;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Repository.CarritoRepository;
import restaurante.example.burgur.Repository.ClienteRepository;
import restaurante.example.burgur.Repository.PedidoRepository;
import restaurante.example.burgur.Repository.ProductoRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class PedidoServiceTest {
    
    @Autowired
    private PedidoService pedidoService;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private CarritoRepository carritoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    private Cliente cliente1;
    private Cliente cliente2;
    private Carrito carrito1;
    private Carrito carrito2;
    private Producto producto1;
    private Producto producto2;
    
    @BeforeEach
    public void setUp() {
        // Limpiar base de datos
        pedidoRepository.deleteAll();
        carritoRepository.deleteAll();
        clienteRepository.deleteAll();
        productoRepository.deleteAll();
        
        // Crear clientes de prueba
        cliente1 = new Cliente();
        cliente1.setNombre("Juan");
        cliente1.setApellido("Pérez");
        cliente1.setCorreo("juan@test.com");
        cliente1.setContrasena("password123");
        cliente1.setTelefono("3001234567");
        cliente1.setDireccion("Calle 123 #45-67");
        cliente1.setActivo(true);
        cliente1 = clienteRepository.save(cliente1);
        
        cliente2 = new Cliente();
        cliente2.setNombre("María");
        cliente2.setApellido("García");
        cliente2.setCorreo("maria@test.com");
        cliente2.setContrasena("password456");
        cliente2.setTelefono("3009876543");
        cliente2.setDireccion("Carrera 10 #20-30");
        cliente2.setActivo(true);
        cliente2 = clienteRepository.save(cliente2);
        
        // Crear productos de prueba
        producto1 = new Producto();
        producto1.setNombre("Hamburguesa Clásica");
        producto1.setDescripcion("Deliciosa hamburguesa");
        producto1.setPrecio(15000.0);
        producto1.setCategoria("Hamburguesas");
        producto1.setStock(50);
        producto1.setActivo(true);
        producto1 = productoRepository.save(producto1);
        
        producto2 = new Producto();
        producto2.setNombre("Papas Fritas");
        producto2.setDescripcion("Papas crujientes");
        producto2.setPrecio(8000.0);
        producto2.setCategoria("Acompañamientos");
        producto2.setStock(100);
        producto2.setActivo(true);
        producto2 = productoRepository.save(producto2);
        
        // Crear carritos de prueba con items
        carrito1 = new Carrito();
        carrito1.setEstado(false); // Inactivo (listo para pedido)
        carrito1.setPrecioTotal(23000.0);
        carrito1.setCliente(cliente1);
        
        CarritoItem item1 = new CarritoItem();
        item1.setCantidad(1);
        item1.setPrecioUnitario(15000.0);
        item1.setProducto(producto1);
        item1.setCarrito(carrito1);
        
        CarritoItem item2 = new CarritoItem();
        item2.setCantidad(1);
        item2.setPrecioUnitario(8000.0);
        item2.setProducto(producto2);
        item2.setCarrito(carrito1);
        
        List<CarritoItem> items1 = new ArrayList<>();
        items1.add(item1);
        items1.add(item2);
        carrito1.setCarritoItems(items1);
        carrito1 = carritoRepository.save(carrito1);
        
        // Carrito 2 para cliente 2
        carrito2 = new Carrito();
        carrito2.setEstado(false);
        carrito2.setPrecioTotal(15000.0);
        carrito2.setCliente(cliente2);
        
        CarritoItem item3 = new CarritoItem();
        item3.setCantidad(1);
        item3.setPrecioUnitario(15000.0);
        item3.setProducto(producto1);
        item3.setCarrito(carrito2);
        
        List<CarritoItem> items2 = new ArrayList<>();
        items2.add(item3);
        carrito2.setCarritoItems(items2);
        carrito2 = carritoRepository.save(carrito2);
    }
    
    // ==========================================
    // PRUEBAS PARA crearPedido
    // ==========================================
    
    @Test
    void pedidoService_crearPedido_pedidoCreado() {
        // Act - Crear pedido desde carrito
        pedidoService.crearPedido(carrito1);
        
        // Assert - Verificar que se creó el pedido
        List<Pedido> pedidos = pedidoRepository.findAll();
        assertThat(pedidos).hasSize(1);
        
        Pedido pedidoCreado = pedidos.get(0);
        assertThat(pedidoCreado).isNotNull();
        assertThat(pedidoCreado.getId()).isNotNull();
        assertThat(pedidoCreado.getCarrito().getId()).isEqualTo(carrito1.getId());
        assertThat(pedidoCreado.getEstado()).isEqualTo("Recibido");
        assertThat(pedidoCreado.getFechaCreacion()).isNotNull();
        assertThat(pedidoCreado.getFechaEntrega()).isNull();
        assertThat(pedidoCreado.getOperador()).isNull();
        assertThat(pedidoCreado.getDomiciliario()).isNull();
    }
    
    @Test
    void pedidoService_crearPedido_carritoNullLanzaExcepcion() {
        // Act & Assert - Intentar crear pedido con carrito null
        assertThatThrownBy(() -> pedidoService.crearPedido(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El carrito no puede ser null");
    }
    
    @Test
    void pedidoService_crearPedido_carritoSinItemsLanzaExcepcion() {
        // Arrange - Crear carrito sin items
        Carrito carritoVacio = new Carrito();
        carritoVacio.setEstado(false);
        carritoVacio.setPrecioTotal(0.0);
        carritoVacio.setCliente(cliente1);
        carritoVacio.setCarritoItems(new ArrayList<>());
        carritoVacio = carritoRepository.save(carritoVacio);
        
        // Act & Assert - Intentar crear pedido con carrito sin items
        Carrito finalCarritoVacio = carritoVacio;
        assertThatThrownBy(() -> pedidoService.crearPedido(finalCarritoVacio))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El carrito no tiene items");
    }
    
    @Test
    void pedidoService_crearPedido_carritoActivoLanzaExcepcion() {
        // Arrange - Activar el carrito
        carrito1.setEstado(true); // Activo
        carrito1 = carritoRepository.save(carrito1);
        
        // Act & Assert - Intentar crear pedido con carrito activo
        assertThatThrownBy(() -> pedidoService.crearPedido(carrito1))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El carrito debe estar inactivo para crear un pedido");
    }
    
    // ==========================================
    // PRUEBAS PARA save (guardarPedido)
    // ==========================================
    
    @Test
    void pedidoService_save_pedidoGuardado() {
        // Arrange - Crear un pedido
        Pedido pedido = new Pedido();
        pedido.setFechaCreacion(LocalDateTime.now());
        pedido.setEstado("Recibido");
        pedido.setCarrito(carrito1);
        
        // Act - Guardar el pedido
        Pedido pedidoGuardado = pedidoService.save(pedido);
        
        // Assert - Verificar que se guardó correctamente
        assertThat(pedidoGuardado).isNotNull();
        assertThat(pedidoGuardado.getId()).isNotNull();
        assertThat(pedidoGuardado.getEstado()).isEqualTo("Recibido");
        assertThat(pedidoGuardado.getCarrito().getId()).isEqualTo(carrito1.getId());
    }
       
    // ==========================================
    // PRUEBAS PARA actualizarEstadoPedido
    // ==========================================
    
    @Test
    void pedidoService_actualizarEstadoPedido_estadoActualizado() {
        // Arrange - Crear un pedido
        pedidoService.crearPedido(carrito1);
        Pedido pedido = pedidoRepository.findAll().get(0);
        
        // Act - Actualizar estado
        pedidoService.actualizarEstadoPedido(pedido, "Cocinando");
        
        // Assert - Verificar actualización
        Pedido pedidoActualizado = pedidoRepository.findById(pedido.getId()).get();
        assertThat(pedidoActualizado.getEstado()).isEqualTo("Cocinando");
    }
    
    @Test
    void pedidoService_actualizarEstadoPedido_pedidoNullLanzaExcepcion() {
        // Act & Assert - Intentar actualizar con pedido null
        assertThatThrownBy(() -> pedidoService.actualizarEstadoPedido(null, "Cocinando"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El pedido no puede ser null");
    }
    
    @Test
    void pedidoService_actualizarEstadoPedido_estadoInvalidoLanzaExcepcion() {
        // Arrange - Crear un pedido
        pedidoService.crearPedido(carrito1);
        Pedido pedido = pedidoRepository.findAll().get(0);
        
        // Act & Assert - Intentar actualizar con estado inválido
        assertThatThrownBy(() -> pedidoService.actualizarEstadoPedido(pedido, "EstadoInvalido"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Estado inválido");
    }
    
    @Test
    void pedidoService_actualizarEstadoPedido_entregadoActualizaFecha() {
        // Arrange - Crear un pedido
        pedidoService.crearPedido(carrito1);
        Pedido pedido = pedidoRepository.findAll().get(0);
        
        // Act - Actualizar a estado ENTREGADO
        pedidoService.actualizarEstadoPedido(pedido, "ENTREGADO");
        
        // Assert - Verificar que se actualizó la fecha de entrega
        Pedido pedidoActualizado = pedidoRepository.findById(pedido.getId()).get();
        assertThat(pedidoActualizado.getEstado()).isEqualTo("ENTREGADO");
        assertThat(pedidoActualizado.getFechaEntrega()).isNotNull();
    }
    
    // ==========================================
    // PRUEBAS PARA obtenerPedidosActivos
    // ==========================================
    
    @Test
    void pedidoService_obtenerPedidosActivos_pedidosRecibidosYCocinando() {
        // Arrange - Crear pedidos con diferentes estados
        pedidoService.crearPedido(carrito1);
        pedidoService.crearPedido(carrito2);
        
        
        List<Pedido> todosPedidos = pedidoRepository.findAll();
        Pedido pedido1 = todosPedidos.get(0);
        Pedido pedido2 = todosPedidos.get(1);
        
        // Actualizar estados
        pedidoService.actualizarEstadoPedido(pedido1, "Recibido");
        pedidoService.actualizarEstadoPedido(pedido2, "Enviado");
        
        // Act - Obtener pedidos activos
        List<Pedido> pedidosActivos = pedidoService.obtenerPedidosActivos();
        
        // Assert - Verificar que se obtienen los pedidos activos
        assertThat(pedidosActivos).hasSize(2);
        assertThat(pedidosActivos).extracting(Pedido::getEstado)
            .containsExactlyInAnyOrder("Enviado", "Recibido");
    }
    
    @Test
    void pedidoService_obtenerPedidosActivos_excluyeEntregadosYCancelados() {
        // Arrange - Crear pedidos con diferentes estados
        pedidoService.crearPedido(carrito1);
        pedidoService.crearPedido(carrito2);
        
        List<Pedido> todosPedidos = pedidoRepository.findAll();
        Pedido pedido1 = todosPedidos.get(0);
        Pedido pedido2 = todosPedidos.get(1);
        
        // Actualizar estados a ENTREGADO y CANCELADO
        pedidoService.actualizarEstadoPedido(pedido1, "ENTREGADO");
        pedidoService.actualizarEstadoPedido(pedido2, "CANCELADO");
        
        // Act - Obtener pedidos activos
        List<Pedido> pedidosActivos = pedidoService.obtenerPedidosActivos();
        
        // Assert - Verificar que no se obtienen pedidos entregados ni cancelados
        assertThat(pedidosActivos).isEmpty();
    }
    
    // ==========================================
    // PRUEBAS PARA obtenerPedidosDeCliente
    // ==========================================
    
    @Test
    void pedidoService_obtenerPedidosDeCliente_pedidosDelCliente() {
        // Arrange - Crear pedidos para ambos clientes
        pedidoService.crearPedido(carrito1); // Cliente 1
        pedidoService.crearPedido(carrito2); // Cliente 2
        
        // Act - Obtener pedidos del cliente 1
        List<Pedido> pedidosCliente1 = pedidoService.obtenerPedidosDeCliente(cliente1.getId());
        
        // Assert - Verificar que solo se obtienen los pedidos del cliente 1
        assertThat(pedidosCliente1).hasSize(1);
        assertThat(pedidosCliente1.get(0).getCarrito().getCliente().getId()).isEqualTo(cliente1.getId());
    }
    
    @Test
    void pedidoService_obtenerPedidosDeCliente_clienteIdInvalidoLanzaExcepcion() {
        // Act & Assert - Intentar obtener pedidos con ID inválido
        assertThatThrownBy(() -> pedidoService.obtenerPedidosDeCliente(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El ID del cliente no es válido");
        
        assertThatThrownBy(() -> pedidoService.obtenerPedidosDeCliente(0L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El ID del cliente no es válido");
    }
    
    @Test
    void pedidoService_obtenerPedidosDeCliente_clienteSinPedidos() {
        // Arrange - Crear un nuevo cliente sin pedidos
        Cliente cliente3 = new Cliente();
        cliente3.setNombre("Pedro");
        cliente3.setApellido("López");
        cliente3.setCorreo("pedro@test.com");
        cliente3.setContrasena("password789");
        cliente3.setTelefono("3005555555");
        cliente3.setDireccion("Avenida 50 #60-70");
        cliente3.setActivo(true);
        cliente3 = clienteRepository.save(cliente3);
        
        // Act - Obtener pedidos del cliente sin pedidos
        List<Pedido> pedidosCliente3 = pedidoService.obtenerPedidosDeCliente(cliente3.getId());
        
        // Assert - Verificar que la lista está vacía
        assertThat(pedidosCliente3).isEmpty();
    }
}

