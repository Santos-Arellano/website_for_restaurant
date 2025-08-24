package restaurante.example.burgur.Model;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Controller;

import jakarta.transaction.Transactional;
import restaurante.example.burgur.Repository.AdicionalRepository;
import restaurante.example.burgur.Repository.ProductoRepository;

@Controller
@Transactional
public class DataBaseInit implements ApplicationRunner{

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private AdicionalRepository adicionalRepository;

    // Creación de Productos Iniciales y Adicionales Iniciales
    public void run(ApplicationArguments args) throws Exception {
        productoRepository.save(new Producto("New In The Club", 25000,
                "Nuestra última creación gourmet con ingredientes premium y sabores únicos",
                "/images/menu/new-in-the-club.png", true, "hamburguesa",
                java.util.Arrays.asList("Carne premium", "Queso artesanal", "Salsa especial", "Vegetales frescos"),
            true, 20, false)); // stock: 20, popular: false

        productoRepository.save(new Producto("Burger Clásica", 22000,
            "La tradicional que todos aman, con carne jugosa y vegetales frescos",
            "/images/menu/BURGER.png", true, "hamburguesa",
            java.util.Arrays.asList("Carne de res", "Lechuga", "Tomate", "Cebolla", "Salsa burger"),
            false, 10, true)); // stock: 10, popular: true

        productoRepository.save(new Producto("Bbq Especial", 26000,
            "Con salsa BBQ casera, cebolla caramelizada y bacon crujiente",
            "/images/menu/BBQ-especial.png", true, "hamburguesa",
            java.util.Arrays.asList("Carne premium", "Salsa BBQ casera", "Bacon", "Cebolla caramelizada"),
            false, 15, true)); // stock: 15, popular: true
            
        productoRepository.save(new Producto("Hot Dog Premium", 18000, 
            "Salchicha premium con ingredientes gourmet y salsas especiales", 
            "/images/menu/hot-dog.png", true, "perro caliente", 
            java.util.Arrays.asList("Salchicha premium", "Pan artesanal", "Salsas gourmet", "Vegetales"), 
            false, 25, false)); // stock: 25, popular: false
            
        productoRepository.save(new Producto("Papas Fritas", 8000, 
            "Crujientes y doradas, perfectas para acompañar", 
            "/images/menu/fries.png", true, "acompañamiento", 
            java.util.Arrays.asList("Papas frescas", "Sal marina", "Aceite premium"), 
            false, 12, false)); // stock: 12, popular: false

        productoRepository.save(new Producto("Acompañamientos Mix", 12000,
            "Variedad de sides perfectos para complementar tu meal",
            "/images/menu/sides.png", true, "acompañamiento",
            java.util.Arrays.asList("Aros de cebolla", "Nuggets", "Papas", "Salsas"),
            false, 30, false)); // stock: 30, popular: false

        productoRepository.save(new Producto("Bebidas", 6000,
            "Refrescantes opciones para acompañar tu comida",
            "/images/menu/drinks.png", true, "bebida",
            java.util.Arrays.asList("Gaseosas", "Jugos naturales", "Agua", "Bebidas especiales"), 
            false, 50, false)); // stock: 50, popular: false

        productoRepository.save(new Producto("Postres Deliciosos", 10000,
            "Dulce final perfecto para completar tu experiencia",
            "/images/menu/desserts.png", true, "postre", 
            java.util.Arrays.asList("Brownies", "Helados", "Tortas", "Frutas"), 
            false, 8, false)); // stock: 8, popular: false
            
        productoRepository.save(new Producto("Cheese Burger", 24000, 
            "Doble queso derretido con carne jugosa", 
            "/images/menu/cheeseburger.png", true, "hamburguesa", 
            java.util.Arrays.asList("Carne doble", "Queso cheddar", "Queso suizo", "Vegetales"), 
            false, 18, true)); // stock: 18, popular: true
            
        productoRepository.save( new Producto("Veggie Burger", 23000, 
            "Opción vegetariana llena de sabor y nutrientes", 
            "/images/menu/veggieburger.png", true, "hamburguesa", 
            java.util.Arrays.asList("Proteína vegetal", "Vegetales asados", "Salsa verde", "Pan integral"), 
            true, 3, false)); // stock: 3 (bajo), popular: false

        productoRepository.save( new Producto("Crispy Chicken", 21000,
            "Pollo crujiente con salsa especial y vegetales frescos",
            "/images/menu/crispy-chicken.png", true, "hamburguesa",
            java.util.Arrays.asList("Pollo crujiente", "Salsa especial", "Lechuga", "Tomate"),
            false, 2, false)); // stock muy bajo

        productoRepository.save( new Producto("Malteadas Premium", 9000,
            "Malteadas cremosas en diferentes sabores",
            "/images/menu/milkshakes.png", true, "bebida",
            java.util.Arrays.asList("Leche premium", "Helado artesanal", "Saborizantes naturales"),
            true, 35, false)); // producto nuevo

        adicionalRepository.save(new Adicional("Queso extra", 3000, true, java.util.Arrays.asList("hamburguesa", "perro caliente")));
        adicionalRepository.save(new Adicional("Bacon crujiente", 4000, true, java.util.Arrays.asList("hamburguesa", "perro caliente")));
        adicionalRepository.save(new Adicional("Guacamole", 5000, true, java.util.Arrays.asList("hamburguesa", "perro caliente")));
        adicionalRepository.save(new Adicional("Salsa BBQ", 2000, true, java.util.Arrays.asList("hamburguesa", "perro caliente")));
        adicionalRepository.save(new Adicional("Cebolla caramelizada", 3000, true, java.util.Arrays.asList("hamburguesa", "perro caliente")));
    }
}
