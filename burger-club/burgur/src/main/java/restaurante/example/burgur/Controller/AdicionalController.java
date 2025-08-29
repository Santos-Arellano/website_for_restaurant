//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/AdicionalController
package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Service.AdicionalService;

@Controller
@RequestMapping("/admin/adicionales")
public class AdicionalController {
    
    @Autowired
    private AdicionalService adicionalService;
    
    // ==========================================
    // VISTAS DE ADMINISTRACIÓN
    // ==========================================
    
    @GetMapping("")
    public String administrarAdicionales(Model model) {
        try {
            List<Adicional> adicionales = adicionalService.findAll();
            
            long totalAdicionales = adicionales.size();
            long adicionalesActivos = adicionales.stream()
                .filter(a -> a != null && a.isActivo())
                .count();
            
            model.addAttribute("adicionales", adicionales);
            model.addAttribute("totalAdicionales", totalAdicionales);
            model.addAttribute("adicionalesActivos", adicionalesActivos);
            
            return "admin/admin-adicionales";
        } catch (Exception e) {
            model.addAttribute("adicionales", List.of());
            model.addAttribute("error", "Error al cargar adicionales: " + e.getMessage());
            return "admin/admin-adicionales";
        }
    }
    
    // ==========================================
    // API REST
    // ==========================================
    
    @GetMapping("/api")
    @ResponseBody
    public ResponseEntity<List<Adicional>> obtenerTodosLosAdicionales() {
        try {
            return ResponseEntity.ok(adicionalService.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Adicional> obtenerAdicionalPorId(@PathVariable Long id) {
        try {
            Adicional adicional = adicionalService.findById(id);
            return ResponseEntity.ok(adicional);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/api")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearAdicional(@RequestBody AdicionalRequest request) {
        try {
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El nombre es requerido"));
            }
            if (request.getPrecio() == null || request.getPrecio() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El precio debe ser mayor a 0"));
            }
            if (request.getCategoria() == null || request.getCategoria().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Debe seleccionar al menos una categoría"));
            }
            
            Adicional adicional = new Adicional();
            adicional.setNombre(request.getNombre());
            adicional.setPrecio(request.getPrecio());
            adicional.setActivo(request.getActivo() != null ? request.getActivo() : true);
            adicional.setCategoria(request.getCategoria());
            
            Adicional savedAdicional = adicionalService.save(adicional);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Adicional creado correctamente",
                "adicional", savedAdicional
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error interno del servidor"));
        }
    }
    
    @PutMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarAdicional(
            @PathVariable Long id, @RequestBody AdicionalRequest request) {
        try {
            if (!adicionalService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El nombre es requerido"));
            }
            if (request.getPrecio() == null || request.getPrecio() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El precio debe ser mayor a 0"));
            }
            
            Adicional adicional = adicionalService.findById(id);
            adicional.setNombre(request.getNombre());
            adicional.setPrecio(request.getPrecio());
            adicional.setActivo(request.getActivo() != null ? request.getActivo() : true);
            if (request.getCategoria() != null && !request.getCategoria().isEmpty()) {
                adicional.setCategoria(request.getCategoria());
            }
            
            Adicional updatedAdicional = adicionalService.save(adicional);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Adicional actualizado correctamente",
                "adicional", updatedAdicional
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error interno del servidor"));
        }
    }
    
    @DeleteMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarAdicional(@PathVariable Long id) {
        try {
            if (!adicionalService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            adicionalService.delete(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Adicional eliminado correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error al eliminar el adicional"));
        }
    }
    
    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    
    public static class AdicionalRequest {
        private String nombre;
        private Double precio;
        private Boolean activo;
        private List<String> categoria;
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public Double getPrecio() { return precio; }
        public void setPrecio(Double precio) { this.precio = precio; }
        
        public Boolean getActivo() { return activo; }
        public void setActivo(Boolean activo) { this.activo = activo; }
        
        public List<String> getCategoria() { return categoria; }
        public void setCategoria(List<String> categoria) { this.categoria = categoria; }
    }
}