package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.Data;
import restaurante.example.burgur.Model.Domiciliario;
import restaurante.example.burgur.Service.DomiciliarioService;

@RestController
@RequestMapping("/api/domiciliarios")
public class DomiciliarioController {

    @Autowired
    private DomiciliarioService domiciliarioService;
    
    // ==========================================
    // ENDPOINTS BÁSICOS CRUD
    // ==========================================
    
    @GetMapping
    public ResponseEntity<List<Domiciliario>> obtenerTodos() {
        return ResponseEntity.ok(domiciliarioService.obtenerTodosLosDomiciliarios());
    }
    
    @GetMapping("/disponibles")
    public ResponseEntity<List<Domiciliario>> obtenerDisponibles() {
        return ResponseEntity.ok(domiciliarioService.obtenerDomiciliariosDisponibles());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Domiciliario> obtenerPorId(@PathVariable Long id) {
        Optional<Domiciliario> domiciliario = domiciliarioService.obtenerDomiciliarioPorId(id);
        return domiciliario.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Domiciliario> crear(@RequestBody DomiciliarioRequest request) {
        try {
            Domiciliario domiciliario = new Domiciliario(
                request.getNombre(),
                request.getCedula(),
                request.getDisponible() != null ? request.getDisponible() : true
            );
            
            Domiciliario creado = domiciliarioService.save(domiciliario);
            return ResponseEntity.status(HttpStatus.CREATED).body(creado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Domiciliario> actualizar(@PathVariable Long id, @RequestBody DomiciliarioRequest request) {
        try {
            Optional<Domiciliario> domiciliarioOpt = domiciliarioService.obtenerDomiciliarioPorId(id);
            if (domiciliarioOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Domiciliario domiciliario = domiciliarioOpt.get();
            domiciliario.setNombre(request.getNombre());
            domiciliario.setCedula(request.getCedula());
            
            if (request.getDisponible() != null) {
                domiciliario.setDisponible(request.getDisponible());
            }
            
            Domiciliario actualizado = domiciliarioService.save(domiciliario);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            domiciliarioService.eliminarDomiciliario(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    
    @Data
    public static class DomiciliarioRequest {
        private String nombre;
        private String cedula;
        private Boolean disponible;
    }
}