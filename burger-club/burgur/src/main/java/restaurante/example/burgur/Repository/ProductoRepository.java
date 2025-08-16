package restaurante.example.burgur.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;
import restaurante.example.burgur.Entities.Producto;

@Repository
public class ProductoRepository {
    // Simular Base de Datos
    private Map<Integer, Producto> productos;
    public ProductoRepository() {
    productos = new java.util.HashMap<>();
    productos.put(1, new Producto(1, "New In The Club", 25000, "Nuestra última creación gourmet con ingredientes premium y sabores únicos", "/images/menu/new-in-the-club.png", true, "burgers", java.util.Arrays.asList("Carne premium", "Queso artesanal", "Salsa especial", "Vegetales frescos"), true));
    productos.put(2, new Producto(2, "Burger Clásica", 22000, "La tradicional que todos aman, con carne jugosa y vegetales frescos", "/images/menu/BURGER.png", true, "burgers", java.util.Arrays.asList("Carne de res", "Lechuga", "Tomate", "Cebolla", "Salsa burger"), false));
    productos.put(3, new Producto(3, "Bbq Especial", 26000, "Con salsa BBQ casera, cebolla caramelizada y bacon crujiente", "/images/menu/BBQ-especial.png", true, "burgers", java.util.Arrays.asList("Carne premium", "Salsa BBQ casera", "Bacon", "Cebolla caramelizada"), false));
    productos.put(4, new Producto(4, "Hot Dog Premium", 18000, "Salchicha premium con ingredientes gourmet y salsas especiales", "/images/menu/hot-dog.png", true, "burgers", java.util.Arrays.asList("Salchicha premium", "Pan artesanal", "Salsas gourmet", "Vegetales"), false));
    productos.put(5, new Producto(5, "Papas Fritas", 8000, "Crujientes y doradas, perfectas para acompañar", "/images/menu/fries.png", true, "sides", java.util.Arrays.asList("Papas frescas", "Sal marina", "Aceite premium"), false));
    productos.put(6, new Producto(6, "Acompañamientos Mix", 12000, "Variedad de sides perfectos para complementar tu meal", "/images/menu/sides.png", true, "sides", java.util.Arrays.asList("Aros de cebolla", "Nuggets", "Papas", "Salsas"), false));
    productos.put(7, new Producto(7, "Bebidas", 6000, "Refrescantes opciones para acompañar tu comida", "/images/menu/drinks.png", true, "drinks", java.util.Arrays.asList("Gaseosas", "Jugos naturales", "Agua", "Bebidas especiales"), false));
    productos.put(8, new Producto(8, "Postres Deliciosos", 10000, "Dulce final perfecto para completar tu experiencia", "/images/menu/desserts.png", true, "desserts", java.util.Arrays.asList("Brownies", "Helados", "Tortas", "Frutas"), false));
    productos.put(9, new Producto(9, "Cheese Burger", 24000, "Doble queso derretido con carne jugosa", "/images/menu/cheeseburger.png", true, "burgers", java.util.Arrays.asList("Carne doble", "Queso cheddar", "Queso suizo", "Vegetales"), false));
    productos.put(10, new Producto(10, "Veggie Burger", 23000, "Opción vegetariana llena de sabor y nutrientes", "/images/menu/veggieburger.png", true, "burgers", java.util.Arrays.asList("Proteína vegetal", "Vegetales asados", "Salsa verde", "Pan integral"), true));
    }
    // Consultas
    public List<Producto> findAll() {
        return new ArrayList<>(productos.values());
    }

}
