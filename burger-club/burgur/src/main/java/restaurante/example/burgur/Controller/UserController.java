//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/UserController.java
package restaurante.example.burgur.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Service.ClienteService;
import lombok.Data;

@RestController
@RequestMapping("/user")
public class UserController {
    
    @Autowired
    private ClienteService clienteService;

    // ==========================================
    // API DE USUARIO
    // ==========================================
    
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody ProfileUpdateRequest request, HttpSession session) {
        try {
            Cliente cliente = (Cliente) session.getAttribute("cliente");
            
            if (cliente == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "No hay sesión activa"
                ));
            }
            
            // Validaciones básicas
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El nombre es requerido"
                ));
            }
            
            if (request.getApellido() == null || request.getApellido().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El apellido es requerido"
                ));
            }
            
            if (request.getCorreo() == null || request.getCorreo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El correo electrónico es requerido"
                ));
            }
            
            // Obtener cliente actualizado de la base de datos
            Cliente clienteActual = clienteService.obtenerClientePorId(cliente.getId());
            if (clienteActual == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cliente no encontrado"
                ));
            }
            
            // Actualizar datos
            clienteActual.setNombre(request.getNombre().trim());
            clienteActual.setApellido(request.getApellido().trim());
            clienteActual.setCorreo(request.getCorreo().trim());
            clienteActual.setTelefono(request.getTelefono() != null ? request.getTelefono().trim() : null);
            clienteActual.setDireccion(request.getDireccion() != null ? request.getDireccion().trim() : null);
            
            // Actualizar contraseña si se proporciona
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                if (request.getPassword().length() < 8) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "La contraseña debe tener al menos 8 caracteres"
                    ));
                }
                clienteActual.setContrasena(request.getPassword());
            }
            
            Cliente clienteGuardado = clienteService.save(clienteActual);
            
            // Actualizar sesión
            session.setAttribute("cliente", clienteGuardado);
            session.setAttribute("clienteNombre", clienteGuardado.getNombre());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Perfil actualizado correctamente",
                "cliente", Map.of(
                    "id", clienteGuardado.getId(),
                    "nombre", clienteGuardado.getNombre(),
                    "apellido", clienteGuardado.getApellido(),
                    "correo", clienteGuardado.getCorreo(),
                    "telefono", clienteGuardado.getTelefono() != null ? clienteGuardado.getTelefono() : "",
                    "direccion", clienteGuardado.getDireccion() != null ? clienteGuardado.getDireccion() : ""
                )
            ));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error interno del servidor"
            ));
        }
    }
    
    @PutMapping("/password")
    public ResponseEntity<Map<String, Object>> updatePassword(@RequestBody Map<String, String> passwordData, HttpSession session) {
        try {
            Cliente cliente = (Cliente) session.getAttribute("cliente");
            
            if (cliente == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "No hay sesión activa"
                ));
            }
            
            String newPassword = passwordData.get("newPassword");
            
            // Validar nueva contraseña
            if (newPassword == null || newPassword.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "La nueva contraseña debe tener al menos 8 caracteres"
                ));
            }
            
            // Obtener cliente actualizado de la base de datos
            Cliente clienteActual = clienteService.obtenerClientePorId(cliente.getId());
            if (clienteActual == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Cliente no encontrado"
                ));
            }
            
            // Actualizar contraseña
            clienteActual.setContrasena(newPassword);
            Cliente clienteGuardado = clienteService.save(clienteActual);
            
            // Actualizar sesión
            session.setAttribute("cliente", clienteGuardado);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Contraseña actualizada correctamente"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error interno del servidor"
            ));
        }
    }
    
    @DeleteMapping("/account")
    public ResponseEntity<Map<String, Object>> deleteAccount(@RequestBody AccountDeletionRequest request, HttpSession session) {
        try {
            Cliente cliente = (Cliente) session.getAttribute("cliente");
            
            if (cliente == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "No hay sesión activa"
                ));
            }
            
            // Validar contraseña para confirmar eliminación
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "La contraseña es requerida para eliminar la cuenta"
                ));
            }
            
            // Verificar contraseña
            try {
                clienteService.iniciarSesion(cliente.getCorreo(), request.getPassword());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Contraseña incorrecta"
                ));
            }
            
            // Desactivar cuenta en lugar de eliminar físicamente
            Cliente clienteActual = clienteService.obtenerClientePorId(cliente.getId());
            if (clienteActual != null) {
                clienteActual.setActivo(false);
                clienteService.save(clienteActual);
            }
            
            // Cerrar sesión
            session.invalidate();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cuenta eliminada correctamente. Lamentamos verte partir."
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Error interno del servidor"
            ));
        }
    }
    
    // ==========================================
    // CLASES DE REQUEST
    // ==========================================
    
    @Data
    public static class ProfileUpdateRequest {
        private String nombre;
        private String apellido;
        private String correo;
        private String telefono;
        private String direccion;
        private String password;
    }
    
    @Data
    public static class AccountDeletionRequest {
        private String password;
    }
}