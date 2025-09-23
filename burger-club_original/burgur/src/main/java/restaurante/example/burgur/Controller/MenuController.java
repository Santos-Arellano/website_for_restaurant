//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/MenuController.java
package restaurante.example.burgur.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Service.ProductoService;

@Controller
public class MenuController {
    
    @Autowired
    private ProductoService productoService;
    
    @GetMapping("/")
    public String inicio() {
        return "index";
    }
    
    @GetMapping("/menu")
    public String menu(Model model,
                      @RequestParam(value = "nombre", required = false) String nombre,
                      @RequestParam(value = "categoria", required = false) String categoria) {
        try {
            productoService.rebuildAdicionalesDeTodosLosProductos();
            List<Producto> productos;
            
            if (nombre != null && !nombre.trim().isEmpty()) {
                productos = productoService.findByNombre(nombre);
            } else if (categoria != null && !categoria.trim().isEmpty() && !"todos".equalsIgnoreCase(categoria)) {
                productos = productoService.findByCategoria(categoria);
            } else {
                productos = productoService.findByActivoTrue();
            }
            
            model.addAttribute("productos", productos);
            return "menu";
        } catch (Exception e) {
            model.addAttribute("productos", List.of());
            model.addAttribute("error", "Error al cargar el menú: " + e.getMessage());
            return "menu";
        }
    }
    
    @GetMapping("/menu/search")
    public String searchMenu(Model model,
                            @RequestParam(value = "nombre", required = false) String nombre) {
                                
        return menu(model, nombre, null);
    }
    
    @GetMapping("/menu/category")
    public String categoryMenu(Model model,
                              @RequestParam(value = "categoria", required = false) String categoria) {
        return menu(model, null, categoria);
    }
    
    @GetMapping("/api/menu/category-counts")
    @ResponseBody
    public ResponseEntity<Map<String, Long>> getCategoryCounts() {
        try {
            List<Producto> productosActivos = productoService.findByActivoTrue();
            
            Map<String, Long> categoryCounts = new HashMap<>();
            categoryCounts.put("hamburguesa", 
                productosActivos.stream()
                    .filter(p -> "hamburguesa".equalsIgnoreCase(p.getCategoria()))
                    .count());
            categoryCounts.put("acompañamiento", 
                productosActivos.stream()
                    .filter(p -> "acompañamiento".equalsIgnoreCase(p.getCategoria()))
                    .count());
            categoryCounts.put("perro caliente", 
                productosActivos.stream()
                    .filter(p -> "perro caliente".equalsIgnoreCase(p.getCategoria()))
                    .count());
            categoryCounts.put("bebida", 
                productosActivos.stream()
                    .filter(p -> "bebida".equalsIgnoreCase(p.getCategoria()))
                    .count());
            categoryCounts.put("postre", 
                productosActivos.stream()
                    .filter(p -> "postre".equalsIgnoreCase(p.getCategoria()))
                    .count());
            
            return ResponseEntity.ok(categoryCounts);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}