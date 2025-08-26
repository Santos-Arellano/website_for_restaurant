// burger-club/burgur/src/main/java/restaurante/example/burgur/Config/DataBaseInit.java
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
        // Solo inicializar si la base de datos está vacía
        if (productoService.countTotal() == 0) {
            initializeData();
        } else {
            System.out.println("✅ Base de datos ya contiene datos. Saltando inicialización.");
        }
    }

    private void initializeData() {
        try {
            System.out.println("🚀 Inicializando base de datos...");
            
            // Crear adicionales primero
            createAdicionales();
            
            // Crear productos
            createProductos();
            
            // Crear clientes
            createClientes();
            
            // Vincular adicionales con productos
            int relacionesCreadas = productoService.rebuildAdicionalesDeTodosLosProductos();
            
            System.out.println("✅ Base de datos inicializada correctamente");
            System.out.println("📊 Estadísticas:");
            System.out.println("   - Productos: " + productoService.countTotal());
            System.out.println("   - Clientes: " + clienteService.obtenerTodosLosClientes().size());
            System.out.println("   - Adicionales: " + adicionalService.findAll().size());
            System.out.println("   - Relaciones producto-adicional: " + relacionesCreadas);
            
        } catch (Exception e) {
            System.err.println("❌ Error al inicializar base de datos: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void createAdicionales() {
        System.out.println("🍯 Creando adicionales...");
        
        List<Adicional> adicionales = Arrays.asList(
            new Adicional("Queso Extra", 3000, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Bacon", 4000, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Aguacate", 3500, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Papas Fritas", 5000, true, Arrays.asList("acompañamiento")),
            new Adicional("Anillos de Cebolla", 4500, true, Arrays.asList("acompañamiento")),
            new Adicional("Salsa BBQ", 1500, true, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Salsa Ranch", 1500, true, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Hielo Extra", 500, true, Arrays.asList("bebida")),
            new Adicional("Crema Batida", 2000, true, Arrays.asList("postre", "bebida")),
            new Adicional("Carne Extra", 5000, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Pepinillos", 1000, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Tomate Extra", 800, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Lechuga Extra", 700, true, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Salsa Picante", 1200, true, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Mayonesa Especial", 1000, true, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento"))
        );

        int created = 0;
        int errors = 0;
        
        for (Adicional adicional : adicionales) {
            try {
                adicionalService.save(adicional);
                created++;
                System.out.println("   ✓ Adicional creado: " + adicional.getNombre());
            } catch (Exception e) {
                errors++;
                System.err.println("   ✗ Error creando adicional " + adicional.getNombre() + ": " + e.getMessage());
            }
        }
        
        System.out.println("   📈 Adicionales creados: " + created + ", Errores: " + errors);
    }

    private void createProductos() {
        System.out.println("🍔 Creando productos...");
        
        List<Producto> productos = Arrays.asList(
            new Producto("Hamburguesa Classic", 
                        "Nuestra hamburguesa tradicional con carne 100% res, perfecta para los amantes de los sabores clásicos", 
                        18000.0, "hamburguesa", "/images/menu/BURGER.png", 25, true, false, true,
                        Arrays.asList("Carne de res", "Lechuga", "Tomate", "Cebolla", "Pan brioche", "Salsa especial")),
            
            new Producto("Hamburguesa BBQ Deluxe", 
                        "Hamburguesa premium con salsa BBQ artesanal y bacon crujiente", 
                        25000.0, "hamburguesa", "/images/menu/BBQ-especial.png", 20, false, true, true,
                        Arrays.asList("Carne de res", "Bacon", "Queso cheddar", "Salsa BBQ", "Pan artesanal", "Cebolla caramelizada")),
            
            new Producto("Hamburguesa Vegetariana", 
                        "Deliciosa hamburguesa vegetal con ingredientes frescos", 
                        16000.0, "hamburguesa", "/images/menu/BURGER.png", 15, true, false, true,
                        Arrays.asList("Hamburguesa de lentejas", "Aguacate", "Lechuga", "Tomate", "Pan integral")),
            
            new Producto("Perro Caliente Especial", 
                        "Perro caliente gourmet con ingredientes frescos y salsas especiales", 
                        12000.0, "perro caliente", "/images/menu/hot-dog.png", 30, false, false, true,
                        Arrays.asList("Salchicha premium", "Pan de perro", "Salsas especiales", "Cebolla", "Pepinillos")),
            
            new Producto("Perro Caliente Supremo", 
                        "La versión premium de nuestro perro caliente con todos los adicionales", 
                        15000.0, "perro caliente", "/images/menu/Hot-Dog-Supreme.png", 20, false, true, true,
                        Arrays.asList("Salchicha premium", "Bacon", "Queso", "Aguacate", "Salsas gourmet")),
            
            new Producto("Papas Fritas Grandes", 
                        "Papas fritas crujientes por fuera, suaves por dentro - porción grande", 
                        8000.0, "acompañamiento", "/images/menu/Fries.png", 50, false, true, true,
                        Arrays.asList("Papas frescas", "Sal marina")),
            
            new Producto("Papas Fritas Medianas", 
                        "Papas fritas crujientes - porción mediana", 
                        6000.0, "acompañamiento", "/images/menu/Fries.png", 60, false, false, true,
                        Arrays.asList("Papas frescas", "Sal marina")),
            
            new Producto("Anillos de Cebolla", 
                        "Crujientes anillos de cebolla empanizados", 
                        7000.0, "acompañamiento", "/images/menu/Fries.png", 40, false, false, true,
                        Arrays.asList("Cebolla", "Empanizado especial", "Aceite de girasol")),
            
            new Producto("Coca Cola 350ml", 
                        "Bebida gaseosa refrescante", 
                        4000.0, "bebida", "/images/menu/Coke.png", 100, false, false, true,
                        Arrays.asList("Bebida carbonatada")),
            
            new Producto("Agua Natural 500ml", 
                        "Agua pura y refrescante", 
                        2500.0, "bebida", "/images/menu/water.png", 80, false, false, true,
                        Arrays.asList("Agua natural")),
            
            new Producto("Jugo de Naranja Natural", 
                        "Jugo 100% natural de naranja recién exprimida", 
                        6000.0, "bebida", "/images/menu/orange-juice.png", 30, false, false, true,
                        Arrays.asList("Naranjas naturales")),
            
            new Producto("Malteada de Chocolate", 
                        "Cremosa malteada de chocolate con crema batida", 
                        12000.0, "postre", "/images/menu/Chocolate-milkshake.png", 15, true, false, true,
                        Arrays.asList("Helado de vainilla", "Chocolate", "Leche", "Crema batida")),
            
            new Producto("Malteada de Fresa", 
                        "Deliciosa malteada de fresa con trozos de fruta", 
                        12000.0, "postre", "/images/menu/Strawberry-milkshake.png", 15, false, false, true,
                        Arrays.asList("Helado de vainilla", "Fresas", "Leche", "Crema batida")),
            
            new Producto("Brownie con Helado", 
                        "Brownie casero tibio acompañado de helado de vainilla", 
                        10000.0, "postre", "/images/menu/Brownie.png", 20, false, true, true,
                        Arrays.asList("Brownie casero", "Helado de vainilla", "Salsa de chocolate"))
        );

        int created = 0;
        int errors = 0;
        
        for (Producto producto : productos) {
            try {
                productoService.save(producto);
                created++;
                System.out.println("   ✓ Producto creado: " + producto.getNombre());
            } catch (Exception e) {
                errors++;
                System.err.println("   ✗ Error creando producto " + producto.getNombre() + ": " + e.getMessage());
            }
        }
        
        System.out.println("   📈 Productos creados: " + created + ", Errores: " + errors);
    }

    private void createClientes() {
        System.out.println("👥 Creando clientes...");
        
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
                       "+573056789012", "Calle 100 #34-56, Bogotá", true),
            
            new Cliente("Carmen", "López", "carmen.lopez@email.com", "password123", 
                       "+573187654321", "Transversal 45 #67-89, Bogotá", true),
            
            new Cliente("Diego", "Herrera", "diego.herrera@email.com", "password123", 
                       "+573098765432", "Calle 127 #45-67, Bogotá", true),
            
            new Cliente("Sofía", "Torres", "sofia.torres@email.com", "password123", 
                       "+573123456789", "Carrera 30 #78-90, Bogotá", true),
            
            new Cliente("Miguel", "Vásquez", "miguel.vasquez@email.com", "password123", 
                       "+573234567890", "Avenida 19 #12-34, Bogotá", true),
            
            new Cliente("Admin", "Burger", "admin@burgerclub.com", "admin123", 
                       "+573999999999", "Oficina Central Burger Club", true)
        );

        int created = 0;
        int errors = 0;
        
        for (Cliente cliente : clientes) {
            try {
                clienteService.save(cliente);
                created++;
                System.out.println("   ✓ Cliente creado: " + cliente.getNombre() + " " + cliente.getApellido());
            } catch (Exception e) {
                errors++;
                System.err.println("   ✗ Error creando cliente " + cliente.getNombre() + ": " + e.getMessage());
            }
        }
        
        System.out.println("   📈 Clientes creados: " + created + ", Errores: " + errors);
    }
}
