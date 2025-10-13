//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/AdicionalController
package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Service.AdicionalService;
import restaurante.example.burgur.Service.ProductoService;
import lombok.Data;

@RestController
@RequestMapping("adicionales")
public class AdicionalController {
    @Autowired
    private AdicionalService adicionalService;
    @Autowired
    private ProductoService productoService;

    // ==========================================
    // CRUD DE ADICIONALES (API REST)
    // ==========================================
    
    @GetMapping("")
    public ResponseEntity<List<Adicional>> obtenerTodosLosAdicionales() {
        try {
            return ResponseEntity.ok(adicionalService.findByActivoTrue());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
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
    
    @PostMapping("")
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
            productoService.rebuildAdicionalesDeTodosLosProductos();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Adicional creado correctamente",
                "adicional", savedAdicional
            ));
        } catch (IllegalArgumentException e) {
            return handleBadRequest(e.getMessage());
        } catch (Exception e) {
            return handleInternalServerError();
        }
    }
    
    @PutMapping("/{id}")
    // Retorna el adicional actualizado con sus categorías
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
            productoService.rebuildAdicionalesDeTodosLosProductos();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Adicional actualizado correctamente",
                "adicional", updatedAdicional
            ));
        } catch (IllegalArgumentException e) {
            return handleBadRequest(e.getMessage());
        } catch (Exception e) {
            return handleInternalServerError();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarAdicional(@PathVariable Long id) {
        try {
            if (!adicionalService.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false, 
                    "message", "Adicional no encontrado"
                ));
            }
            adicionalService.delete(id);
            productoService.rebuildAdicionalesDeTodosLosProductos();
            return ResponseEntity.ok(Map.of("success", true, "message", "Adicional eliminado correctamente"));
        } catch (IllegalArgumentException e) {
            return handleBadRequest(e.getMessage());
        } catch (Exception e) {
            return handleInternalServerError("Error al eliminar el adicional");
        }
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================

    // ================================
    // MÉTODOS VISTA ADMIN- ADICIONALES
    // ================================
    // 1). Retona todos los adicionales activos
    @GetMapping("/activos")
    public ResponseEntity<Map<String, Object>> obtenerAdicionalesActivos() {
        try {
            List<Adicional> adicionales = adicionalService.findByActivoTrue();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "adicionales", adicionales
            ));
        } catch (Exception e) {
            return handleInternalServerError("Error al obtener los adicionales activos");
        }
    }

    // 2). Retorna la cantidad de adicionales activos
    @GetMapping("/cantidadActivos")
    public ResponseEntity<Map<String, Object>> obtenerCantidadAdicionalesActivos() {
        try {
            List<Adicional> adicionales = adicionalService.findByActivoTrue();
            long cantidad = adicionales.size();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "cantidad", cantidad
            ));
        } catch (Exception e) {
            return handleInternalServerError("Error al obtener la cantidad de adicionales activos");
        }
    }

    // ==============================
    // MÉTODOS VISTA ADMIN- DASHBOARD
    // ==============================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        try {
            var adicionales = adicionalService.findAll();

            Map<String, Long> response = Map.of(
                "total", (long) adicionales.size(),
                "activos", adicionales.stream()
                                     .filter(a -> a != null && a.isActivo())
                                     .count()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================
    // MÉTODOS HELPER PARA MANEJO DE ERRORES
    // ==========================================
    
    private ResponseEntity<Map<String, Object>> handleBadRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", message));
    }
    
    private ResponseEntity<Map<String, Object>> handleInternalServerError() {
        return handleInternalServerError("Error interno del servidor");
    }
    
    private ResponseEntity<Map<String, Object>> handleInternalServerError(String message) {
        return ResponseEntity.internalServerError().body(Map.of("success", false, "message", message));
    }
    
    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    
    @Data
    public static class AdicionalRequest {
        private String nombre;
        private Double precio;
        private Boolean activo;
        private List<String> categoria;
    }
}