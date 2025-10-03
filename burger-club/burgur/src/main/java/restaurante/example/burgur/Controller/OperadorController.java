package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.Data;
import restaurante.example.burgur.Model.Operador;
import restaurante.example.burgur.Service.OperadorService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/operadores")
public class OperadorController {
    @Autowired
    private OperadorService operadorService;

    // ==========================================
    // CRUD DE OPERADORES (API REST)
    // ==========================================

    // Obtener todos los operadores
    @GetMapping("/list")
    public ResponseEntity<List<Operador>> obtenerTodosLosOperadores() {
        try {
            return ResponseEntity.ok(operadorService.obtenerTodosLosOperadores());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener un operador por ID
    @GetMapping("/{id}")
    public ResponseEntity<Operador> obtenerOperadorPorId(@PathVariable Long id) {
        try {
            Operador operador = operadorService.obtenerOperadorPorId(id);
            return ResponseEntity.ok(operador);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Crear un nuevo operador
    @PostMapping("")
    public ResponseEntity<Map<String, Operador>> crearOperador(@RequestBody OperadorRequest request) {
        try {
            Operador operador = new Operador();
            operador.setNombre(request.getNombre());
            operador.setCedula(request.getCedula());
            operador.setDisponible(request.isDisponible());

            Operador savedOperador = operadorService.save(operador);
            return ResponseEntity.ok(Map.of("operador", savedOperador));
        } catch (Exception e) {
         return ResponseEntity.internalServerError().build();
        }
    }

    // Actualizar un operador
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Operador>> actualizarOperador(@PathVariable Long id, @RequestBody OperadorRequest request) {
        try {
            Operador existingOperador = operadorService.obtenerOperadorPorId(id);
            existingOperador.setNombre(request.getNombre());
            existingOperador.setCedula(request.getCedula());
            existingOperador.setDisponible(request.isDisponible());

            Operador updatedOperador = operadorService.save(existingOperador);
            return ResponseEntity.ok(Map.of("operador", updatedOperador));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    //Eliminar un operador
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> eliminarOperador(@PathVariable Long id) {
        try {
            operadorService.eliminarOperador(id);
            return ResponseEntity.ok(Map.of("deleted", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================
    // MÉTODOS ESPECÍFICOS DE NEGOCIO
    // ==========================================
    @GetMapping("/disponibles")
    public ResponseEntity<List<Operador>> obtenerOperadoresDisponibles() {
        try {
            List<Operador> operadoresDisponibles = operadorService.obtenerOperadoresDisponibles();
            return ResponseEntity.ok(operadoresDisponibles);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countTotalOperadores() {
        try {
            long total = operadorService.countTotal();
            return ResponseEntity.ok(Map.of("total", total));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/disponibilidad")
    public ResponseEntity<Map<String, Operador>> cambiarDisponibilidad(@PathVariable Long id, @RequestBody Map<String, Boolean> request) {
        try {
            if (!request.containsKey("disponible")) {
                return ResponseEntity.badRequest().build();
            }
            boolean disponible = request.get("disponible");
            operadorService.cambiarDisponibilidad(id, disponible);
            Operador updatedOperador = operadorService.obtenerOperadorPorId(id);
            return ResponseEntity.ok(Map.of("operador", updatedOperador));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    @Data
    static class OperadorRequest {
        private String nombre;
        private String cedula;
        private boolean disponible;
    }

    
}
