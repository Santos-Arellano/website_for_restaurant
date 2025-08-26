//burger-club/burgur/src/main/java/restaurante/example/burgur/Config/DataBaseInit.java
package restaurante.example.burgur.Config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Service.AdicionalService;
import restaurante.example.burgur.Service.ClienteService;
import restaurante.example.burgur.Service.ProductoService;

@Component
public class DataBaseInit implements CommandLineRunner {

    @Autowired
    private ProductoService productoService;
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private AdicionalService adicionalService;

    @Override
    public void run(String... args) throws Exception {
        initializeData();
    }

    private void initializeData() {
        try {
            // Crear adicionales primero
            createAdicionales();
            
            // Crear productos
            createProductos();
            
            // Crear clientes
            createClientes();
            
            // Vincular adicionales con productos
            productoService.rebuildAdicionalesDeTodosLosProductos();
            
            System.out.println("✅ Base de datos inicializada correctamente");
        } catch (Exception e) {
            System.err.println("❌ Error al inicializar base de datos: " + e.getMessage());
        }
    }

    private void createAdicionales() {
        List<Adicional> adicionales = Arrays.asList(
            new Adicional("Queso Extra", 3000, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Bacon", 4000, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Aguacate", 3500, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Papas Fritas", 5000, true, Arrays.asList("acompañamiento")),
            new Adicional("Anillos de Cebolla", 4500, true, Arrays.asList("acompañamiento")),
            new Adicional("Salsa BBQ", 1500, true, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Salsa Ranch", 1500, true, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Hielo Extra", 500, true, Arrays.asList("bebida")),
            new Adicional("Crema Batida", 2000, true, Arrays.asList("postre", "bebida"))
        );

        adicionales.forEach(adicional -> {
            try {
                adicionalService.save(adicional);
                System.out.println("Adicional creado: " + adicional.getNombre());
            } catch (Exception e) {
                System.err.println("Error creando adicional " + adicional.getNombre() + ": " + e.getMessage());
            }
        });
    }

    private void createProductos() {
        List<Producto> productos = Arrays.asList(
            new Producto("Hamburguesa Classic", "Nuestra hamburguesa tradicional con carne 100% res", 
                        18000.0, "hamburguesa", "/images/menu/BURGER.png", 25, true, false, true,
                        Arrays.asList("Carne de res", "Lechuga", "Tomate", "Cebolla", "Pan brioche")),
            
            new Producto("Hamburguesa BBQ Deluxe", "Hamburguesa premium con salsa BBQ y bacon", 
                        25000.0, "hamburguesa", "/images/menu/BBQ-especial.png", 20, false, true, true,
                        Arrays.asList("Carne de res", "Bacon", "Queso cheddar", "Salsa BBQ", "Pan artesanal")),
            
            new Producto("Perro Caliente Especial", "Perro caliente con ingredientes frescos", 
                        12000.0, "perro caliente", "/images/menu/hot-dog.png", 30, false, false, true,
                        Arrays.asList("Salchicha premium", "Pan de perro", "Salsas especiales")),
            
            new Producto("Papas Fritas Grandes", "Papas fritas crujientes porción grande", 
                        8000.0, "acompañamiento", "/images/menu/Fries.png", 50, false, true, true,
                        Arrays.asList("Papas frescas", "Sal marina")),
            
            new Producto("Coca Cola 350ml", "Bebida gaseosa refrescante", 
                        4000.0, "bebida", "/images/menu/Drinks.png", 100, false, false, true,
                        Arrays.asList("Bebida carbonatada")),
            
            new Producto("Malteada de Chocolate", "Deliciosa malteada cremosa", 
                        12000.0, "postre", "/images/menu/milkshakes.png", 15, true, false, true,
                        Arrays.asList("Helado de vainilla", "Chocolate", "Leche", "Crema batida"))
        );

        productos.forEach(producto -> {
            try {
                productoService.save(producto);
                System.out.println("Producto creado: " + producto.getNombre());
            } catch (Exception e) {
                System.err.println("Error creando producto " + producto.getNombre() + ": " + e.getMessage());
            }
        });
    }

    private void createClientes() {
        // CORREGIDO: Números de teléfono sin espacios
        List<Cliente> clientes = Arrays.asList(
            new Cliente("Juan", "Pérez", "juan.perez@email.com", "password123", 
                       "+573001234567", "Carrera 15 #45-67, Bogotá", true),
            
            new Cliente("María", "González", "maria.gonzalez@email.com", "password123", 
                       "+573109876543", "Calle 80 #12-34, Bogotá", true),
            
            new Cliente("Carlos", "Rodríguez", "carlos.rodriguez@email.com", "password123", 
                       "+573204567890", "Avenida 68 #23-45, Bogotá", true),
            
            new Cliente("Ana", "Martínez", "ana.martinez@email.com", "password123", 
                       "+573152345678", "Carrera 7 #56-78, Bogotá", true),
            
            new Cliente("Luis", "García", "luis.garcia@email.com", "password123", 
                       "+573056789012", "Calle 100 #34-56, Bogotá", true)
        );

        clientes.forEach(cliente -> {
            try {
                clienteService.save(cliente);
                System.out.println("Cliente creado: " + cliente.getNombre() + " " + cliente.getApellido());
            } catch (Exception e) {
                System.err.println("Error creando cliente " + cliente.getNombre() + ": " + e.getMessage());
            }
        });
    }
}