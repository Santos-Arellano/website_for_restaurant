package restaurante.example.burgur.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.CarritoItem;
import restaurante.example.burgur.Model.Domiciliario;
import restaurante.example.burgur.Model.Pedido;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Repository.AdiXItemCarritoRepository;
import restaurante.example.burgur.Repository.PedidoRepository;

@ExtendWith(MockitoExtension.class)
class PedidoServiceMocksTest {

    @Mock
    private PedidoRepository pedidoRepository;
    @Mock
    private DomiciliarioService domiciliarioService;
    // Dependencias no usadas en los métodos probados, pero presentes en el servicio
    @Mock
    private ProductoService productoService;
    @Mock
    private AdicionalService adicionalService;
    @Mock
    private AdiXItemCarritoRepository adiXItemCarritoRepository;

    @InjectMocks
    private PedidoServiceImpl pedidoService;

    private Carrito buildCarritoConItemsYEstadoFalse() {
        Carrito carrito = new Carrito();
        carrito.setId(100L);
        carrito.setEstado(false);

        CarritoItem item1 = new CarritoItem();
        item1.setCantidad(1);
        item1.setPrecioUnitario(15000.0);
        item1.setProducto(new Producto());
        item1.setCarrito(carrito);

        CarritoItem item2 = new CarritoItem();
        item2.setCantidad(1);
        item2.setPrecioUnitario(8000.0);
        item2.setProducto(new Producto());
        item2.setCarrito(carrito);

        List<CarritoItem> items = new ArrayList<>();
        items.add(item1);
        items.add(item2);
        carrito.setCarritoItems(items);
        return carrito;
    }

    @Test
    void pedidoService_crearPedido_guardaPedidoConEstadoRecibido() {
        // Arrange
        Carrito carrito = buildCarritoConItemsYEstadoFalse();

        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> {
            Pedido p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        // Act
        pedidoService.crearPedido(carrito);

        // Assert
        ArgumentCaptor<Pedido> captor = ArgumentCaptor.forClass(Pedido.class);
        verify(pedidoRepository, times(1)).save(captor.capture());
        Pedido capturado = captor.getValue();
        assertThat(capturado.getCarrito().getId()).isEqualTo(carrito.getId());
        assertThat(capturado.getEstado()).isEqualTo("Recibido");
        assertThat(capturado.getFechaCreacion()).isNotNull();
        assertThat(capturado.getFechaEntrega()).isNull();
        assertThat(capturado.getOperador()).isNull();
        assertThat(capturado.getDomiciliario()).isNull();
    }

    @Test
    void pedidoService_crearPedido_carritoNull_lanzaExcepcion() {
        assertThatThrownBy(() -> pedidoService.crearPedido(null))
            .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(pedidoRepository);
    }

    @Test
    void pedidoService_crearPedido_carritoSinItems_lanzaExcepcion() {
        Carrito carrito = new Carrito();
        carrito.setId(101L);
        carrito.setEstado(false);
        carrito.setCarritoItems(new ArrayList<>());

        assertThatThrownBy(() -> pedidoService.crearPedido(carrito))
            .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(pedidoRepository);
    }

    @Test
    void pedidoService_actualizarEstadoPedido_entregadoLiberaDomiciliarioYLlamaSave() {
        // Arrange
        Domiciliario dom = new Domiciliario();
        dom.setId(5L);
        dom.setDisponible(false);

        Pedido pedido = new Pedido();
        pedido.setId(2L);
        pedido.setEstado("Enviado");
        pedido.setDomiciliario(dom);

        // Act
        pedidoService.actualizarEstadoPedido(pedido, "ENTREGADO");

        // Assert
        assertThat(pedido.getFechaEntrega()).isNotNull();
        assertThat(dom.isDisponible()).isTrue();
        verify(domiciliarioService, times(1)).save(dom);
        verify(pedidoRepository, times(1)).save(pedido);
    }

    @Test
    void pedidoService_obtenerPedidosActivos_devuelveListaMockeada() {
        // Arrange
        Pedido p1 = new Pedido();
        p1.setId(1L);
        p1.setEstado("Recibido");
        Pedido p2 = new Pedido();
        p2.setId(2L);
        p2.setEstado("Enviado");
        when(pedidoRepository.findActivos()).thenReturn(Arrays.asList(p1, p2));

        // Act
        List<Pedido> activos = pedidoService.obtenerPedidosActivos();

        // Assert
        assertThat(activos).hasSize(2);
        assertThat(activos).extracting(Pedido::getEstado).containsExactlyInAnyOrder("Recibido", "Enviado");
        verify(pedidoRepository, times(1)).findActivos();
    }

    @Test
    void pedidoService_obtenerPedidosDeCliente_idInvalido_lanzaExcepcion() {
        assertThatThrownBy(() -> pedidoService.obtenerPedidosDeCliente(0L))
            .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(pedidoRepository);
    }

    @Test
    void pedidoService_asignarDomiciliario_valido_asignaYLlamaPersistencia() {
        // Arrange
        Long pedidoId = 10L;
        Long domiciliarioId = 20L;

        Pedido pedido = new Pedido();
        pedido.setId(pedidoId);
        pedido.setEstado("Enviado");

        Domiciliario dom = new Domiciliario();
        dom.setId(domiciliarioId);
        dom.setDisponible(true);

        when(pedidoRepository.findById(pedidoId)).thenReturn(Optional.of(pedido));
        when(domiciliarioService.obtenerDomiciliarioPorId(domiciliarioId)).thenReturn(dom);
        when(pedidoRepository.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Pedido actualizado = pedidoService.asignarDomiciliario(pedidoId, domiciliarioId);

        // Assert
        assertThat(actualizado.getDomiciliario()).isEqualTo(dom);
        assertThat(dom.isDisponible()).isFalse();
        verify(domiciliarioService, times(1)).save(dom);
        verify(pedidoRepository, times(1)).save(pedido);
    }
}