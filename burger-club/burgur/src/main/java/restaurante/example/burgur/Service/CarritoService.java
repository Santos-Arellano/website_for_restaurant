package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Carrito;
import restaurante.example.burgur.Model.CarritoItem;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Model.Producto;

@Service
public interface CarritoService {
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================    

    //Crear Carrito
    Carrito crearCarrito(Cliente cliente);

    //Añadir Producto al Carrito
    Carrito añadirProductoAlCarrito(Producto producto, List<Adicional> adicionales, int cantidad, Carrito carrito, Cliente cliente);

    //Carrito Activo del cliente
    public Carrito carritoActivoCliente(Cliente cliente);

    //Borrar Producto del Carrito
    Carrito borrarProductoDelCarrito(CarritoItem carritoItem, Carrito carrito);

    //Vaciar Carrito
    Carrito vaciarCarrito(Carrito carrito);
    

    // ==========================================
    // Enviar Carrito a Pedido
    // ==========================================
    Carrito enviarCarritoAPedido(Carrito carrito);
    
    // Último carrito cerrado sin pedido del cliente
    Carrito ultimoCarritoCerradoSinPedido(Cliente cliente);
    
}
