package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import restaurante.example.burgur.Model.Operador;
import restaurante.example.burgur.Service.OperadorService;
import lombok.Data;

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

    // ==========================================
    // AUTENTICACIÓN BÁSICA DE OPERADOR (por cédula)
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginOperador(@RequestBody LoginOperadorRequest request, HttpSession session) {
        try {
            if (request.getCedula() == null || request.getCedula().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "La cédula es requerida"
                ));
            }

            Operador operador = operadorService.obtenerOperadorPorCedula(request.getCedula());
            if (operador == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Operador no encontrado"
                ));
            }

            session.setAttribute("operador", operador);
            session.setAttribute("operadorId", operador.getId());
            session.setAttribute("operadorNombre", operador.getNombre());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Inicio de sesión de operador exitoso",
                "operador", Map.of(
                    "id", operador.getId(),
                    "nombre", operador.getNombre(),
                    "cedula", operador.getCedula(),
                    "disponible", operador.isDisponible()
                )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error interno del servidor"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logoutOperador(HttpSession session) {
        session.removeAttribute("operador");
        session.removeAttribute("operadorId");
        session.removeAttribute("operadorNombre");
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Sesión de operador cerrada correctamente"
        ));
    }

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> currentOperador(HttpSession session) {
        Operador operador = (Operador) session.getAttribute("operador");
        if (operador == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        return ResponseEntity.ok(Map.of(
            "authenticated", true,
            "operador", Map.of(
                "id", operador.getId(),
                "nombre", operador.getNombre(),
                "cedula", operador.getCedula(),
                "disponible", operador.isDisponible()
            )
        ));
    }

    // ==========================================
    // CLASE AUXILIAR
    // ==========================================
    @Data
    public static class LoginOperadorRequest {
        private String cedula;
    }
}