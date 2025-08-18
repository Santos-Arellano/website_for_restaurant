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
        
        // Actualizamos los productos existentes con stock y popular
        productos.put(1, new Producto(1, "New In The Club", 25000, 
            "Nuestra última creación gourmet con ingredientes premium y sabores únicos", 
            "/images/menu/new-in-the-club.png", true, "hamburguesa", 
            java.util.Arrays.asList("Carne premium", "Queso artesanal", "Salsa especial", "Vegetales frescos"), 
            true, 20, false)); // stock: 20, popular: false
            
        productos.put(2, new Producto(2, "Burger Clásica", 22000, 
            "La tradicional que todos aman, con carne jugosa y vegetales frescos", 
            "/images/menu/BURGER.png", true, "hamburguesa", 
            java.util.Arrays.asList("Carne de res", "Lechuga", "Tomate", "Cebolla", "Salsa burger"), 
            false, 10, true)); // stock: 10, popular: true
            
        productos.put(3, new Producto(3, "Bbq Especial", 26000, 
            "Con salsa BBQ casera, cebolla caramelizada y bacon crujiente", 
            "/images/menu/BBQ-especial.png", true, "hamburguesa", 
            java.util.Arrays.asList("Carne premium", "Salsa BBQ casera", "Bacon", "Cebolla caramelizada"), 
            false, 15, true)); // stock: 15, popular: true
            
        productos.put(4, new Producto(4, "Hot Dog Premium", 18000, 
            "Salchicha premium con ingredientes gourmet y salsas especiales", 
            "/images/menu/hot-dog.png", true, "perro caliente", 
            java.util.Arrays.asList("Salchicha premium", "Pan artesanal", "Salsas gourmet", "Vegetales"), 
            false, 25, false)); // stock: 25, popular: false
            
        productos.put(5, new Producto(5, "Papas Fritas", 8000, 
            "Crujientes y doradas, perfectas para acompañar", 
            "/images/menu/fries.png", true, "acompañamiento", 
            java.util.Arrays.asList("Papas frescas", "Sal marina", "Aceite premium"), 
            false, 12, false)); // stock: 12, popular: false
            
        productos.put(6, new Producto(6, "Acompañamientos Mix", 12000, 
            "Variedad de sides perfectos para complementar tu meal", 
            "/images/menu/sides.png", true, "acompañamiento", 
            java.util.Arrays.asList("Aros de cebolla", "Nuggets", "Papas", "Salsas"), 
            false, 30, false)); // stock: 30, popular: false
            
        productos.put(7, new Producto(7, "Bebidas", 6000, 
            "Refrescantes opciones para acompañar tu comida", 
            "/images/menu/drinks.png", true, "bebida", 
            java.util.Arrays.asList("Gaseosas", "Jugos naturales", "Agua", "Bebidas especiales"), 
            false, 50, false)); // stock: 50, popular: false
            
        productos.put(8, new Producto(8, "Postres Deliciosos", 10000, 
            "Dulce final perfecto para completar tu experiencia", 
            "/images/menu/desserts.png", true, "postre", 
            java.util.Arrays.asList("Brownies", "Helados", "Tortas", "Frutas"), 
            false, 8, false)); // stock: 8, popular: false
            
        productos.put(9, new Producto(9, "Cheese Burger", 24000, 
            "Doble queso derretido con carne jugosa", 
            "/images/menu/cheeseburger.png", true, "hamburguesa", 
            java.util.Arrays.asList("Carne doble", "Queso cheddar", "Queso suizo", "Vegetales"), 
            false, 18, true)); // stock: 18, popular: true
            
        productos.put(10, new Producto(10, "Veggie Burger", 23000, 
            "Opción vegetariana llena de sabor y nutrientes", 
            "/images/menu/veggieburger.png", true, "hamburguesa", 
            java.util.Arrays.asList("Proteína vegetal", "Vegetales asados", "Salsa verde", "Pan integral"), 
            true, 3, false)); // stock: 3 (bajo), popular: false
            
        // Agregar algunos productos más para mejor demostración
        productos.put(11, new Producto(11, "Crispy Chicken", 21000,
            "Pollo crujiente con salsa especial y vegetales frescos",
            "/images/menu/crispy-chicken.png", true, "hamburguesa",
            java.util.Arrays.asList("Pollo crujiente", "Salsa especial", "Lechuga", "Tomate"),
            false, 2, false)); // stock muy bajo
            
        productos.put(12, new Producto(12, "Malteadas Premium", 9000,
            "Malteadas cremosas en diferentes sabores",
            "/images/menu/milkshakes.png", true, "bebida",
            java.util.Arrays.asList("Leche premium", "Helado artesanal", "Saborizantes naturales"),
            true, 35, false)); // producto nuevo
    }
    
    // Consultas existentes
    public List<Producto> findAll() {
        return new ArrayList<>(productos.values());
    }
    
    // Nuevas consultas para administración
    public Producto findById(Integer id) {
        return productos.get(id);
    }
    
    public List<Producto> findByCategoria(String categoria) {
        return productos.values().stream()
            .filter(p -> p.getCategoria().equalsIgnoreCase(categoria))
            .collect(java.util.stream.Collectors.toList());
    }
    
    public List<Producto> findByNuevo(boolean nuevo) {
        return productos.values().stream()
            .filter(p -> p.isNuevo() == nuevo)
            .collect(java.util.stream.Collectors.toList());
    }
    
    public List<Producto> findByPopular(boolean popular) {
        return productos.values().stream()
            .filter(p -> p.isPopular() == popular)
            .collect(java.util.stream.Collectors.toList());
    }
    
    public List<Producto> findByStockBajo(int limite) {
        return productos.values().stream()
            .filter(p -> p.getStock() < limite)
            .collect(java.util.stream.Collectors.toList());
    }
    
    // Métodos CRUD simulados (en una implementación real usarías JPA)
    public Producto save(Producto producto) {
        if (producto.getId() == null) {
            // Generar nuevo ID
            int newId = productos.keySet().stream().mapToInt(Integer::intValue).max().orElse(0) + 1;
            producto.setId(newId);
        }
        productos.put(producto.getId(), producto);
        return producto;
    }
    
    public void deleteById(Integer id) {
        productos.remove(id);
    }
    
    public boolean existsById(Integer id) {
        return productos.containsKey(id);
    }
    
    // Métodos de búsqueda
    public List<Producto> search(String termino) {
        String terminoLower = termino.toLowerCase();
        return productos.values().stream()
            .filter(p -> 
                p.getNombre().toLowerCase().contains(terminoLower) ||
                p.getDescripcion().toLowerCase().contains(terminoLower) ||
                p.getCategoria().toLowerCase().contains(terminoLower)
            )
            .collect(java.util.stream.Collectors.toList());
    }
}