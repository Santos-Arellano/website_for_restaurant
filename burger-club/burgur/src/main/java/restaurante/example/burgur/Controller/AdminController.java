//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/AdminController.java
package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import restaurante.example.burgur.Service.ProductoService;
import restaurante.example.burgur.Service.ClienteService;
import restaurante.example.burgur.Service.AdicionalService;
import restaurante.example.burgur.Service.DomiciliarioService;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ProductoService productoService;
    
    @Autowired
    private ClienteService clienteService;
    
    @Autowired
    private AdicionalService adicionalService;
    
    @Autowired
    private DomiciliarioService domiciliarioService;
    
    @GetMapping("")
    public String redirectToProductos() {
        return "redirect:/menu/admin";
    }
    
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        try {
            var productos = productoService.findAll();
            var clientes = clienteService.obtenerTodosLosClientes();
            var adicionales = adicionalService.findAll();
            
            model.addAttribute("totalProductos", productos.size());
            model.addAttribute("productosNuevos", productos.stream().filter(p -> p != null && p.isNuevo()).count());
            model.addAttribute("productosActivos", productos.stream().filter(p -> p != null && p.isActivo()).count());
            model.addAttribute("stockBajo", productos.stream().filter(p -> p != null && p.isStockBajo()).count());
            
            model.addAttribute("totalClientes", clientes.size());
            model.addAttribute("clientesActivos", clientes.stream().filter(c -> c != null && c.isActivo()).count());
            
            model.addAttribute("totalAdicionales", adicionales.size());
            model.addAttribute("adicionalesActivos", adicionales.stream().filter(a -> a != null && a.isActivo()).count());
            
            return "admin/dashboard";
        } catch (Exception e) {
            model.addAttribute("error", "Error al cargar las estadísticas");
            return "admin/dashboard";
        }
    }
    
    // Eliminado el método adminClientes para evitar conflicto con ClienteController
    
    @GetMapping("/domiciliarios")
    public String adminDomiciliarios(Model model) {
        try {
            var domiciliarios = domiciliarioService.obtenerTodosLosDomiciliarios();
            model.addAttribute("domiciliarios", domiciliarios);
            model.addAttribute("totalDomiciliarios", domiciliarios.size());
            model.addAttribute("domiciliariosDisponibles", domiciliarios.stream().filter(d -> d != null && d.isDisponible()).count());
            return "admin/admin-domiciliarios";
        } catch (Exception e) {
            model.addAttribute("error", "Error al cargar los domiciliarios");
            return "admin/admin-domiciliarios";
        }
    }
    
    // ==========================================
    // API PARA ACTUALIZAR ADICIONALES
    // ==========================================
    
    @PostMapping("/rebuild-adicionales")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> rebuildAdicionales() {
        try {
            Integer count = productoService.rebuildAdicionalesDeTodosLosProductos();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Adicionales reconstruidos correctamente",
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error al reconstruir adicionales: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/update-adicionales")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateAdicionales() {
        try {
            Integer count = productoService.updateAdicionalesDeTodosLosProductos();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Adicionales actualizados correctamente",
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error al actualizar adicionales: " + e.getMessage()
            ));
        }
    }
}