package restaurante.example.burgur.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import restaurante.example.burgur.Model.Operador;
import restaurante.example.burgur.Service.OperadorService;

@RestController
@RequestMapping("/operadores")
public class OperadorController {

    @Autowired
    private OperadorService operadorService;

    // ==========================================
    // ENDPOINTS BÁSICOS CRUD
    // ==========================================

    @GetMapping("")
    public ResponseEntity<List<Operador>> obtenerTodos() {
        return ResponseEntity.ok(operadorService.obtenerTodosLosOperadores());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Operador> obtenerPorId(@PathVariable Long id) {
        Operador operador = operadorService.obtenerOperadorPorId(id);
        if (operador == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(operador);
    }

    @PostMapping("")
    public ResponseEntity<Operador> crear(@RequestBody Operador operador) {
        Operador creado = operadorService.save(operador);
        return ResponseEntity.ok(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Operador> actualizar(@PathVariable Long id, @RequestBody Operador operador) {
        Operador existente = operadorService.obtenerOperadorPorId(id);
        if (existente == null) {
            return ResponseEntity.notFound().build();
        }
        operador.setId(id);
        Operador actualizado = operadorService.save(operador);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        operadorService.eliminarOperador(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // MÉTODOS ESPECÍFICOS DE NEGOCIO
    // ==========================================

    @GetMapping("/disponibles")
    public ResponseEntity<List<Operador>> obtenerDisponibles() {
        return ResponseEntity.ok(operadorService.obtenerOperadoresDisponibles());
    }

    @GetMapping("/stats")
    public ResponseEntity<Long> countTotal() {
        return ResponseEntity.ok(operadorService.countTotal());
    }
}