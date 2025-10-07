package restaurante.example.burgur.Service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Repository.AdiXItemCarritoRepository;
import restaurante.example.burgur.Repository.CarritoItemRepository;
import restaurante.example.burgur.Repository.CarritoRepository;
import restaurante.example.burgur.Model.AdiXItemCarrito;
import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.CarritoItem;
import restaurante.example.burgur.Model.Cliente;

@Service
public class CarritoServiceImpl implements CarritoService {
    @Autowired
    private ProductoService productoService;
    @Autowired
    private AdiXItemCarritoRepository adiXItemCarritoRepository;
    @Autowired
    private CarritoItemRepository carritoItemRepository;
    @Autowired
    private CarritoRepository carritoRepository;
    
    @Override
    @Transactional
    // 1) Crear Carrito (Se crea cada vez que un cliente inicia una compra, si no tiene uno activo)
    public Carrito crearCarrito(Cliente cliente) {
        // 1. Validar que el cliente no sea null
        if (cliente == null || cliente.getId() == null) {
            throw new IllegalArgumentException("El cliente no puede ser null.");
        }

        // 2. Reviso si el cliente ya tiene un carrito activo
        Carrito carritoActivo = carritoRepository.findByClienteIdAndEstadoTrue(cliente.getId());
        if (carritoActivo != null)
            // Ya tiene un carrito activo - retorno ese mismo
            return carritoActivo;
        // 3. Crear un nuevo carrito
        Carrito nuevoCarrito = new Carrito(true);
        // Vincular el carrito con el cliente
        nuevoCarrito.setCliente(cliente);
        return carritoRepository.save(nuevoCarrito);
    }

    @Override
    @Transactional
    // 2) Añadir Producto al Carrito
    public Carrito añadirProductoAlCarrito(Producto producto, List<Adicional> adicionales, int cantidad, Carrito carrito, Cliente cliente) {
        // 1. Validar parámetros de entrada
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0.");
        }
        if (producto == null || producto.getId() == null) {
            throw new IllegalArgumentException("El producto no puede ser null.");
        }
        if (adicionales == null) {
            adicionales = new ArrayList<>(); // Lista vacía si es null
        }

        // filtrar nulos en la lista de adicionales
        //adicionales.removeIf(a -> a == null || a.getId() == null);

        // 2. Revisar si el producto existe
        if (!productoService.existsById(producto.getId())) {
            throw new IllegalArgumentException("El producto con ID " + producto.getId() + " no existe.");
        }

        // 3. Revisar si los adicionales existen y son permitidos para el producto (por ID)
        // List<Adicional> adicionalesPermitidos = productoService.obtenerAdicionalesPermitidos(producto.getId());
        // java.util.Set<Long> idsPermitidos = new java.util.HashSet<>();
        // for (Adicional ap : adicionalesPermitidos) {
        //     if (ap != null && ap.getId() != null) idsPermitidos.add(ap.getId());
        // }

        // for (Adicional adicional : adicionales) {
        //     Long idAdi = adicional.getId();
        //     if (!idsPermitidos.contains(idAdi)) {
        //         throw new IllegalArgumentException("El adicional con ID " + idAdi +
        //             " no está permitido para el producto con ID " + producto.getId());
        //     }
        // }

        // 4. Revisar/crear carrito
        if (carrito == null || carrito.getId() == null) {
            // Creamos un nuevo carrito si no existe
            carrito = crearCarrito(cliente);
        }
        if (carrito.getEstado() == false) {
            throw new IllegalStateException("El carrito está cerrado y no se puede modificar.");
        }

        // Revisar que el carrito pertenezca al cliente
        if (carrito.getCliente() == null || !carrito.getCliente().getId().equals(cliente.getId())) {
            throw new IllegalArgumentException("El carrito no pertenece al cliente especificado.");
        }

        // 5. Calcular costo de todos los adicionales pedidos (double como pediste)
        double costoAdicionales = 0;
        for (Adicional adicional : adicionales) {
            costoAdicionales += adicional.getPrecio();
        }

        // 6. Crear CarritoItem para el producto con sus adicionales
        CarritoItem prodYAdiPedido = new CarritoItem();
        prodYAdiPedido.setProducto(producto);
        prodYAdiPedido.setCantidad(cantidad);
        prodYAdiPedido.setPrecioUnitario(producto.getPrecio() + costoAdicionales);
        // Asociar el item al carrito
        prodYAdiPedido.setCarrito(carrito);
        
        // Guardar costo en Carrito
        carrito.setPrecioTotal((carrito.getPrecioTotal() + prodYAdiPedido.getPrecioUnitario()) * cantidad);

        // 7. Guardar el item para generar ID
        CarritoItem savedCarritoItem = carritoItemRepository.save(prodYAdiPedido);

        // 8. Crear y guardar AdiXItemCarrito para cada adicional (sin cantidad)
        List<AdiXItemCarrito> adicionalesRelacion = new ArrayList<>();
        for (Adicional adicional : adicionales) {
            AdiXItemCarrito adiXItemPedido = new AdiXItemCarrito();
            adiXItemPedido.setAdicional(adicional);
            adiXItemPedido.setCarritoItem(savedCarritoItem);

            AdiXItemCarrito savedAdiXItem = adiXItemCarritoRepository.save(adiXItemPedido);
            adicionalesRelacion.add(savedAdiXItem);
        }

        // 9. Actualizar la lista de adicionales en el objeto principal
        savedCarritoItem.setAdicionalesPorProducto(adicionalesRelacion);

        // 10. Guardar nuevamente para actualizar las relaciones (opcional con cascade)
        carritoItemRepository.save(savedCarritoItem);

        // 11. Agregar el CarritoItem al Carrito
        List<CarritoItem> items = carrito.getCarritoItems();
        if (items == null) {
            items = new ArrayList<>();
        }
        items.add(savedCarritoItem);
        carrito.setCarritoItems(items);

        carritoRepository.save(carrito);

        return carrito;
    }

    @Override
    public Carrito carritoActivoCliente(Cliente cliente){
        // 1. Validar que el cliente no sea null
        if (cliente == null || cliente.getId() == null) {
            throw new IllegalArgumentException("El cliente no puede ser null.");
        }

        // 2. Reviso si el cliente ya tiene un carrito activo
        Carrito carritoActivo = carritoRepository.findByClienteIdAndEstadoTrue(cliente.getId());
        if (carritoActivo == null) {
            // No tiene un carrito activo - creo uno nuevo
            carritoActivo = crearCarrito(cliente);
        }
        return carritoActivo;
    }

    // Borrar Producto del Carrito
    @Override
    @Transactional
    public Carrito borrarProductoDelCarrito(CarritoItem carritoItem, Carrito carrito){
        // 1. Validar parámetros de entrada
        if (carritoItem == null || carritoItem.getId() == null) {
            throw new IllegalArgumentException("El CarritoItem no puede ser null.");
        }
        if (carrito == null || carrito.getId() == null) {
            throw new IllegalArgumentException("El Carrito no puede ser null.");
        }
        if (carrito.getEstado() == false) {
            throw new IllegalStateException("El carrito está cerrado y no se puede modificar.");
        }

        // 2. Verificar que el CarritoItem pertenezca al Carrito
        if (!carrito.getCarritoItems().contains(carritoItem)) {
            throw new IllegalArgumentException("El CarritoItem no pertenece al Carrito especificado.");
        }

        // 3. Eliminar los AdiXItemCarrito asociados al CarritoItem
        List<AdiXItemCarrito> adicionalesRelacion = carritoItem.getAdicionalesPorProducto();
        if (adicionalesRelacion != null && !adicionalesRelacion.isEmpty()) {
            adiXItemCarritoRepository.deleteAll(adicionalesRelacion);
        }

        // 4. Eliminar el CarritoItem
        carritoItemRepository.delete(carritoItem);

        // 5. Actualizar la lista de CarritoItems en el Carrito
        List<CarritoItem> items = carrito.getCarritoItems();
        items.remove(carritoItem);
        carrito.setCarritoItems(items);

        return carrito;
    }

    @Override
    @Transactional
    public Carrito vaciarCarrito(Carrito carrito){
        // 1. Validar parámetro de entrada
        if (carrito == null || carrito.getId() == null) {
            throw new IllegalArgumentException("El Carrito no puede ser null.");
        }
        if (carrito.getEstado() == false) {
            throw new IllegalStateException("El carrito está cerrado y no se puede modificar.");
        }

        // 2. Eliminar todos los CarritoItems y sus AdiXItemCarrito asociados
        List<CarritoItem> items = carrito.getCarritoItems();
        if (items != null && !items.isEmpty()) {
            for (CarritoItem item : items) {
                // Eliminar los AdiXItemCarrito asociados
                List<AdiXItemCarrito> adicionalesRelacion = item.getAdicionalesPorProducto();
                if (adicionalesRelacion != null && !adicionalesRelacion.isEmpty()) {
                    adiXItemCarritoRepository.deleteAll(adicionalesRelacion);
                }
                // Eliminar el CarritoItem
                carritoItemRepository.delete(item);
            }
        }

        // 3. Limpiar la lista de CarritoItems en el Carrito
        carrito.setCarritoItems(new ArrayList<>());

        return carrito;
    }

    @Override
    @Transactional
    public Carrito enviarCarritoAPedido(Carrito carrito){
        // 1. Validar parámetro de entrada
        if (carrito == null || carrito.getId() == null) {
            throw new IllegalArgumentException("El Carrito no puede ser null.");
        }
        if (carrito.getEstado() == false) {
            throw new IllegalStateException("El carrito ya está cerrado.");
        }
        if (carrito.getCarritoItems() == null || carrito.getCarritoItems().isEmpty()) {
            throw new IllegalStateException("El carrito está vacío y no se puede enviar a pedido.");
        }

        // 2. Cambiar el estado del carrito a inactivo (cerrado)
        carrito.setEstado(false);

        // 3. Guardar los cambios en el carrito
        return carritoRepository.save(carrito);
    }

    @Override
    public Carrito ultimoCarritoCerradoSinPedido(Cliente cliente) {
        // 1. Validar parámetro de entrada
        if (cliente == null || cliente.getId() == null) {
            throw new IllegalArgumentException("El cliente no puede ser null.");
        }
        // 2. Buscar el último carrito cerrado sin pedido
        Carrito ultimo = carritoRepository.findTopByClienteIdAndEstadoFalseAndPedidoIsNullOrderByIdDesc(cliente.getId());
        if (ultimo == null) {
            throw new IllegalArgumentException("No hay carritos cerrados pendientes de pedido para el cliente.");
        }
        return ultimo;
    }
}
