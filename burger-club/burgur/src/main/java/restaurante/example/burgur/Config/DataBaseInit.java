// burger-club/burgur/src/main/java/restaurante/example/burgur/Config/DataBaseInit.java
package restaurante.example.burgur.Config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Model.Domiciliario;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Service.AdicionalService;
import restaurante.example.burgur.Service.ClienteService;
import restaurante.example.burgur.Service.DomiciliarioService;
import restaurante.example.burgur.Service.ProductoService;

@Component
public class DataBaseInit implements CommandLineRunner {

    @Autowired
    private ProductoService productoService;
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private AdicionalService adicionalService;
    
    @Autowired
    private DomiciliarioService domiciliarioService;

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
            
            // Crear domiciliarios
            createDomiciliarios();
            
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
            new Adicional("Queso Extra", 3000.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Bacon", 4000.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Aguacate", 3500.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Papas Fritas", 5000.0, Arrays.asList("acompañamiento")),
            new Adicional("Anillos de Cebolla", 4500.0, Arrays.asList("acompañamiento")),
            new Adicional("Salsa BBQ", 1500.0, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Salsa Ranch", 1500.0, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Hielo Extra", 500.0, Arrays.asList("bebida")),
            new Adicional("Crema Batida", 2000.0, Arrays.asList("postre", "bebida")),
            new Adicional("Carne Extra", 5000.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Pepinillos", 1000.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Tomate Extra", 800.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Lechuga Extra", 700.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Salsa Picante", 1200.0, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Mayonesa Especial", 1000.0, Arrays.asList("hamburguesa", "perro caliente", "acompañamiento")),
            new Adicional("Queso Cheddar", 2500.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Champiñones", 3000.0, Arrays.asList("hamburguesa", "perro caliente")),
            new Adicional("Yuca Frita", 4800.0, Arrays.asList("acompañamiento")),
            new Adicional("Jarabe de Chocolate", 1800.0, Arrays.asList("postre", "bebida")),
            new Adicional("Limón", 600.0, Arrays.asList("bebida"))
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
            new Producto(null, "Hamburguesa Classic", 
                        "Nuestra hamburguesa tradicional con carne 100% res, perfecta para los amantes de los sabores clásicos", 
                        18000.0, "hamburguesa", "/images/menu/BURGER.png", 25, true, false, true,
                        Arrays.asList("Carne de res", "Lechuga", "Tomate", "Cebolla", "Pan brioche", "Salsa especial"), null,null),
            
            new Producto(null, "Hamburguesa BBQ Deluxe", 
                        "Hamburguesa premium con salsa BBQ artesanal y bacon crujiente", 
                        25000.0, "hamburguesa", "/images/menu/BBQ-especial.png", 20, false, true, true,
                        Arrays.asList("Carne de res", "Bacon", "Queso cheddar", "Salsa BBQ", "Pan artesanal", "Cebolla caramelizada"), null ,null),
            
            new Producto(null, "Hamburguesa Vegetariana", 
                        "Deliciosa hamburguesa vegetal con ingredientes frescos", 
                        16000.0, "hamburguesa", "/images/menu/veggieburger.png", 15, true, false, true,
                        Arrays.asList("Hamburguesa de lentejas", "Aguacate", "Lechuga", "Tomate", "Pan integral"), null,null),
            
            new Producto(null, "Perro Caliente Especial", 
                        "Perro caliente gourmet con ingredientes frescos y salsas especiales", 
                        12000.0, "perro caliente", "/images/menu/hot-dog.png", 30, false, false, true,
                        Arrays.asList("Salchicha premium", "Pan de perro", "Salsas especiales", "Cebolla", "Pepinillos"), null,null),
            
            new Producto(null, "Perro Caliente Supremo", 
                        "La versión premium de nuestro perro caliente con todos los adicionales", 
                        15000.0, "perro caliente", "/images/menu/Hot-Dog-Supreme.png", 20, false, true, true,
                        Arrays.asList("Salchicha premium", "Bacon", "Queso", "Aguacate", "Salsas gourmet"), null,null),
            
            new Producto(null, "Papas Fritas Grandes", 
                        "Papas fritas crujientes por fuera, suaves por dentro - porción grande", 
                        8000.0, "acompañamiento", "/images/menu/Fries.png", 50, false, true, true,
                        Arrays.asList("Papas frescas", "Sal marina"), null,null),
            
            new Producto(null, "Papas Fritas Medianas", 
                        "Papas fritas crujientes - porción mediana", 
                        6000.0, "acompañamiento", "/images/menu/Fries.png", 60, false, false, true,
                        Arrays.asList("Papas frescas", "Sal marina"), null,null),
            
            new Producto(null, "Anillos de Cebolla", 
                        "Crujientes anillos de cebolla empanizados", 
                        7000.0, "acompañamiento", "/images/menu/aros-cebolla.png", 40, false, false, true,
                        Arrays.asList("Cebolla", "Empanizado especial", "Aceite de girasol"), null,null),
            
            new Producto(null, "Coca Cola 350ml", 
                        "Bebida gaseosa refrescante", 
                        4000.0, "bebida", "/images/menu/Coke.png", 100, false, false, true,
                        Arrays.asList("Bebida carbonatada"), null,null),

            new Producto(null, "Agua Natural 500ml", 
                        "Agua pura y refrescante", 
                        2500.0, "bebida", "/images/menu/water.png", 80, false, false, true,
                        Arrays.asList("Agua natural"), null,null),

            new Producto(null, "Jugo de Naranja Natural", 
                        "Jugo 100% natural de naranja recién exprimida", 
                        6000.0, "bebida", "/images/menu/orange-juice.png", 30, false, false, true,
                        Arrays.asList("Naranjas naturales"), null,null),

            new Producto(null, "Malteada de Chocolate", 
                        "Cremosa malteada de chocolate con crema batida", 
                        12000.0, "postre", "/images/menu/Chocolate-milkshake.png", 15, true, false, true,
                        Arrays.asList("Helado de vainilla", "Chocolate", "Leche", "Crema batida"), null,null),

            new Producto(null, "Malteada de Fresa", 
                        "Deliciosa malteada de fresa con trozos de fruta", 
                        12000.0, "postre", "/images/menu/Strawberry-milkshake.png", 15, false, false, true,
                        Arrays.asList("Helado de vainilla", "Fresas", "Leche", "Crema batida"), null,null),

            new Producto(null, "Brownie con Helado", 
                        "Brownie casero tibio acompañado de helado de vainilla", 
                        10000.0, "postre", "/images/menu/Brownie.png", 20, false, true, true,
                        Arrays.asList("Brownie casero", "Helado de vainilla", "Salsa de chocolate"), null,null),

            // Nuevas
            new Producto(null, "Hamburguesa Doble Cheese",
                "Doble carne, doble queso cheddar, para los que comen con ganas",
                28000.0, "hamburguesa", "/images/menu/double-cheese.png", 18, false, true, true,
                Arrays.asList("Doble carne de res", "Queso cheddar", "Pan brioche", "Salsa especial"), null,null),
            new Producto(null, "Hamburguesa Chipotle",
                "Sabor ahumado y picante suave con mayonesa chipotle",
                22000.0, "hamburguesa", "/images/menu/chipotle-burger.png", 15, false, true, true,
                Arrays.asList("Carne de res", "Queso pepper jack", "Lechuga", "Mayonesa chipotle"), null,null),
            new Producto(null, "Hamburguesa Angus Premium",
                "Carne Angus, queso suizo y cebolla caramelizada",
                30000.0, "hamburguesa", "/images/menu/angus.png", 10, false, true, true,
                Arrays.asList("Carne Angus", "Queso suizo", "Cebolla caramelizada", "Pan artesanal"), null,null),
            new Producto(null, "Hamburguesa Pollo Crispy",
                "Pechuga de pollo empanizada, crujiente, con lechuga y salsa tártara",
                19000.0, "hamburguesa", "/images/menu/chicken-crispy.png", 20, false, false, true,
                Arrays.asList("Pechuga empanizada", "Lechuga", "Salsa tártara", "Pan brioche"), null,null),
            new Producto(null, "Hamburguesa Blue Cheese",
                "Con salsa de queso azul y rúcula para un toque gourmet",
                26000.0, "hamburguesa", "/images/menu/blue-cheese.png", 12, false, false, true,
                Arrays.asList("Carne de res", "Queso azul", "Rúcula", "Cebolla"), null,null),
            new Producto(null, "Hamburguesa Mexicana",
                "Con guacamole, jalapeños y salsa picante casera",
                23000.0, "hamburguesa", "/images/menu/mex-burger.png", 16, false, true, true,
                Arrays.asList("Carne de res", "Guacamole", "Jalapeños", "Queso", "Cebolla"), null,null),
            new Producto(null, "Hamburguesa Mini (Kids)",
                "Porción pequeña ideal para niños, con queso y papas pequeñas",
                12000.0, "hamburguesa", "/images/menu/kids-burger.png", 30, true, false, true,
                Arrays.asList("Carne de res pequeña", "Queso", "Pan pequeño"), null,null),
            new Producto(null, "Perro Callejero",
                "Estilo clásico callejero con salsa de la casa y cebolla picada",
                10000.0, "perro caliente", "/images/menu/street-dog.png", 40, false, true, true,
                Arrays.asList("Salchicha", "Pan de perro", "Salsa de la casa", "Cebolla"), null,null),
            new Producto(null, "Perro Picante",
                "Con salsa picante, jalapeños y toque de limón",
                11000.0, "perro caliente", "/images/menu/spicy-dog.png", 35, false, true, true,
                Arrays.asList("Salchicha", "Pan", "Salsa picante", "Jalapeños", "Limón"), null,null),
            new Producto(null, "Perro con Queso Fundido",
                "Salchicha bañada en queso fundido estilo comfort food",
                13000.0, "perro caliente", "/images/menu/cheese-dog.png", 25, false, false, true,
                Arrays.asList("Salchicha premium", "Queso fundido", "Pan"), null,null),
            new Producto(null, "Perro Veggie",
                "Salchicha vegetal con toppings frescos y pan integral",
                12500.0, "perro caliente", "/images/menu/veggie-dog.png", 20, true, false, true,
                Arrays.asList("Salchicha vegetal", "Lechuga", "Tomate", "Pan integral"), null,null),
            new Producto(null, "Yuca Frita",
                "Yuca crocante, servida con salsa de ajo",
                4800.0, "acompañamiento", "/images/menu/yuca-frita.png", 35, false, false, true,
                Arrays.asList("Yuca", "Sal", "Salsa de ajo"), null,null),
            new Producto(null, "Mozzarella Sticks",
                "Palitos de queso empanizados, acompañados de salsa marinara",
                9000.0, "acompañamiento", "/images/menu/mozzarella.png", 30, false, false, true,
                Arrays.asList("Queso mozzarella", "Empanizado", "Salsa marinara"), null,null),
            new Producto(null, "Ensalada César",
                "Ensalada fresca con aderezo César y crutones",
                9000.0, "acompañamiento", "/images/menu/caesar-salad.png", 25, true, false, true,
                Arrays.asList("Lechuga romana", "Aderezo César", "Crutones", "Queso parmesano"), null,null),
            new Producto(null, "Aros de Yuca",
                "Aros crujientes de yuca con toque especiado",
                7500.0, "acompañamiento", "/images/menu/yuca-rings.png", 28, false, false, true,
                Arrays.asList("Yuca", "Empanizado", "Especias"), null,null),
            new Producto(null, "Ensalada de Papas",
                "Porción de ensalada de papas estilo casero",
                6500.0, "acompañamiento", "/images/menu/potato-salad.png", 30, false, false, true,
                Arrays.asList("Papas", "Mayonesa", "Cebolla", "Perejil"), null,null),
            new Producto(null, "Combo Acompañamiento (Papas + Aros)",
                "Mitad papas fritas + mitad aros de cebolla, para compartir",
                12000.0, "acompañamiento", "/images/menu/combo-fries-aros.png", 20, false, true, true,
                Arrays.asList("Papas fritas", "Aros de cebolla"), null,null),
            new Producto(null, "Pan con Ajo",
                "Rebanadas de pan tostado con mantequilla de ajo",
                4000.0, "acompañamiento", "/images/menu/garlic-bread.png", 50, false, false, true,
                Arrays.asList("Pan", "Mantequilla de ajo"), null,null),
            new Producto(null, "Limonada Natural",
                "Limonada casera con limón natural y hielo",
                4500.0, "bebida", "/images/menu/lemonade.png", 60, false, false, true,
                Arrays.asList("Limón", "Agua", "Azúcar"), null,null),
            new Producto(null, "Té Helado",
                "Té negro helado, ideal para acompañar comidas",
                4200.0, "bebida", "/images/menu/iced-tea.png", 50, false, false, true,
                Arrays.asList("Té negro", "Hielo", "Azúcar opcional"), null,null),
            new Producto(null, "Malteada Vainilla",
                "Malteada clásica de vainilla con crema",
                12000.0, "bebida", "/images/menu/vanilla-milkshake.png", 20, true, false, true,
                Arrays.asList("Helado de vainilla", "Leche", "Crema"), null,null),
            new Producto(null, "Cerveza Artesanal 330ml",
                "Selección rotativa de cerveza artesanal (si aplica legalmente)",
                9000.0, "bebida", "/images/menu/beer.png", 40, false, false, true,
                Arrays.asList("Cerveza artesanal"), null,null),
            new Producto(null, "Cheesecake",
                "Porción de cheesecake casero con base de galleta",
                11000.0, "postre", "/images/menu/cheesecake.png", 12, false, true, true,
                Arrays.asList("Queso crema", "Galleta", "Mermelada"), null,null),
            new Producto(null, "Tiramisú",
                "Tiramisú clásico en porción individual",
                12000.0, "postre", "/images/menu/tiramisu.png", 10, false, true, true,
                Arrays.asList("Queso mascarpone", "Café", "Bizcocho"), null,null),
            new Producto(null, "Helado Copa",
                "Copa con dos bolas de helado y toppings a elección",
                8000.0, "postre", "/images/menu/ice-cream-cup.png", 25, true, false, true,
                Arrays.asList("Helado", "Toppings"), null,null),
            new Producto(null, "Galletas Calientes",
                "Galletas recién horneadas, suaves por dentro",
                6000.0, "postre", "/images/menu/cookies.png", 30, false, false, true,
                Arrays.asList("Harina", "Azúcar", "Mantequilla", "Chispas de chocolate"), null,null)
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

    private void createDomiciliarios() {
        System.out.println("🚚 Creando domiciliarios...");
        
        List<Domiciliario> domiciliarios = Arrays.asList(
            new Domiciliario("Carlos Ramírez", "1098765432", true),
            new Domiciliario("Laura Mendoza", "1076543210", true),
            new Domiciliario("Andrés Gómez", "1054321098", true),
            new Domiciliario("Juliana Vargas", "1032109876", true),
            new Domiciliario("Roberto Sánchez", "1010987654", false),
            new Domiciliario("Camila Rodríguez", "1098765431", true)
        );

        int created = 0;
        int errors = 0;
        
        for (Domiciliario domiciliario : domiciliarios) {
            try {
                domiciliarioService.save(domiciliario);
                created++;
                System.out.println("   ✓ Domiciliario creado: " + domiciliario.getNombre());
            } catch (Exception e) {
                errors++;
                System.err.println("   ✗ Error creando domiciliario " + domiciliario.getNombre() + ": " + e.getMessage());
            }
        }
        
        System.out.println("   📈 Domiciliarios creados: " + created + ", Errores: " + errors);
    }
    
    private void createClientes() {
        System.out.println("👥 Creando clientes...");
        
        List<Cliente> clientes = Arrays.asList(
            new Cliente(null,"Juan", "Pérez", "juan.perez@email.com", "password123", 
                       "+573001234567", "Carrera 15 #45-67, Bogotá", true, null),
            
            new Cliente(null,"María", "González", "maria.gonzalez@email.com", "password123", 
                       "+573109876543", "Calle 80 #12-34, Bogotá", true, null),
            
            new Cliente(null,"Carlos", "Rodríguez", "carlos.rodriguez@email.com", "password123", 
                       "+573204567890", "Avenida 68 #23-45, Bogotá", true, null),
            
            new Cliente(null,"Ana", "Martínez", "ana.martinez@email.com", "password123", 
                       "+573152345678", "Carrera 7 #56-78, Bogotá", true, null),
            
            new Cliente(null,"Luis", "García", "luis.garcia@email.com", "password123", 
                       "+573056789012", "Calle 100 #34-56, Bogotá", true, null),
            
            new Cliente(null,"Carmen", "López", "carmen.lopez@email.com", "password123", 
                       "+573187654321", "Transversal 45 #67-89, Bogotá", true, null),
            
            new Cliente(null,"Diego", "Herrera", "diego.herrera@email.com", "password123", 
                       "+573098765432", "Calle 127 #45-67, Bogotá", true, null),
            
            new Cliente(null,"Sofía", "Torres", "sofia.torres@email.com", "password123", 
                       "+573123456789", "Carrera 30 #78-90, Bogotá", true, null),
            new Cliente(null,"Miguel", "Vásquez", "miguel.vasquez@email.com", "password123", 
                       "+573234567890", "Avenida 19 #12-34, Bogotá", true, null),
            new Cliente(null,"Admin", "Burger", "admin@burgerclub.com", "admin123", 
                       "+573999999999", "Oficina Central Burger Club", true, null)
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
