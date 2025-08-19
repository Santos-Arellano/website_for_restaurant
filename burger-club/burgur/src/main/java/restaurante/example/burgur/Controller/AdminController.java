package restaurante.example.burgur.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import restaurante.example.burgur.Service.ProductoService;

/**
 * Controlador para las rutas de administración
 */
@Controller
@RequestMapping("/admin")
public class AdminController {
    
    @Autowired
    private ProductoService productoService;
    
    /**
     * Página principal de administración
     * Redirige al panel de productos
     */
    @GetMapping("")
    public String adminDashboard() {
        return "redirect:/admin/productos";
    }
    
    /**
     * Panel de administración de productos
     */
    @GetMapping("/productos")
    public String adminProductos(Model model) {
        try {
            // Obtener todos los productos
            var productos = productoService.findAll();
            productos = productos != null ? productos : java.util.List.of();
            
            // Calcular estadísticas
            long totalProductos = productos.size();
            long productosNuevos = productos.stream()
                .filter(p -> p != null && p.isNuevo())
                .count();
            long productosActivos = productos.stream()
                .filter(p -> p != null && p.isActivo())
                .count();
            long stockBajo = productos.stream()
                .filter(p -> p != null && p.getStock() != null && p.getStock() < 5)
                .count();
            
            // Agregar atributos al modelo
            model.addAttribute("productos", productos);
            model.addAttribute("totalProductos", totalProductos);
            model.addAttribute("productosNuevos", productosNuevos);
            model.addAttribute("productosActivos", productosActivos);
            model.addAttribute("stockBajo", stockBajo);
            
            return "admin/admin-products";
            
        } catch (Exception e) {
            System.err.println("Error en admin productos: " + e.getMessage());
            e.printStackTrace();
            
            // En caso de error, mostrar página con datos vacíos
            model.addAttribute("productos", java.util.List.of());
            model.addAttribute("totalProductos", 0);
            model.addAttribute("productosNuevos", 0);
            model.addAttribute("productosActivos", 0);
            model.addAttribute("stockBajo", 0);
            model.addAttribute("error", "Error al cargar los productos: " + e.getMessage());
            
            return "admin/admin-products";
        }
    }
    
    /**
     * Dashboard con estadísticas generales (opcional)
     */
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        try {
            // Estadísticas básicas
            long totalProductos = productoService.countTotal();
            long productosNuevos = productoService.countByNuevo();
            long productosPopulares = productoService.countByPopular();
            long stockBajo = productoService.countByStockBajo();
            
            model.addAttribute("totalProductos", totalProductos);
            model.addAttribute("productosNuevos", productosNuevos);
            model.addAttribute("productosPopulares", productosPopulares);
            model.addAttribute("stockBajo", stockBajo);
            
            return "admin/dashboard";
            
        } catch (Exception e) {
            System.err.println("Error en admin dashboard: " + e.getMessage());
            model.addAttribute("error", "Error al cargar las estadísticas");
            return "admin/dashboard";
        }
    }
}