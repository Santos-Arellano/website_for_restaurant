//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/AuthController.java
package restaurante.example.burgur.Controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Service.ClienteService;

@Controller
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private ClienteService clienteService;
    
    // ==========================================
    // VISTAS DE AUTENTICACIÓN
    // ==========================================
    
    @GetMapping("/login")
    public String showLogin(Model model, HttpSession session) {
        // Si ya está logueado, redirigir al menú
        if (session.getAttribute("cliente") != null) {
            return "redirect:/menu";
        }
        return "auth/login";
    }
    
    @GetMapping("/register")
    public String showRegister(Model model, HttpSession session) {
        // Si ya está logueado, redirigir al menú
        if (session.getAttribute("cliente") != null) {
            return "redirect:/menu";
        }
        return "auth/register";
    }
    
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }
    
    // ==========================================
    // API DE AUTENTICACIÓN
    // ==========================================
    
    @PostMapping("/api/login")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request, HttpSession session) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El correo electrónico es requerido"
                ));
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "La contraseña es requerida"
                ));
            }
            
            Cliente cliente = clienteService.iniciarSesion(request.getEmail(), request.getPassword());
            
            // Guardar cliente en sesión
            session.setAttribute("cliente", cliente);
            session.setAttribute("clienteId", cliente.getId());
            session.setAttribute("clienteNombre", cliente.getNombre());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Inicio de sesión exitoso",
                "cliente", Map.of(
                    "id", cliente.getId(),
                    "nombre", cliente.getNombre(),
                    "apellido", cliente.getApellido(),
                    "correo", cliente.getCorreo()
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
    
    @PostMapping("/api/register")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request, HttpSession session) {
        try {
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
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El correo electrónico es requerido"
                ));
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "La contraseña es requerida"
                ));
            }
            
            if (request.getConfirmPassword() == null || !request.getPassword().equals(request.getConfirmPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Las contraseñas no coinciden"
                ));
            }
            
            // Crear nuevo cliente
            Cliente nuevoCliente = new Cliente();
            nuevoCliente.setNombre(request.getNombre());
            nuevoCliente.setApellido(request.getApellido());
            nuevoCliente.setCorreo(request.getEmail());
            nuevoCliente.setContrasena(request.getPassword());
            nuevoCliente.setTelefono(request.getTelefono());
            nuevoCliente.setDireccion(request.getDireccion());
            nuevoCliente.setActivo(true);
            
            Cliente clienteGuardado = clienteService.save(nuevoCliente);
            
            // Iniciar sesión automáticamente
            session.setAttribute("cliente", clienteGuardado);
            session.setAttribute("clienteId", clienteGuardado.getId());
            session.setAttribute("clienteNombre", clienteGuardado.getNombre());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registro exitoso. ¡Bienvenido a Burger Club!",
                "cliente", Map.of(
                    "id", clienteGuardado.getId(),
                    "nombre", clienteGuardado.getNombre(),
                    "apellido", clienteGuardado.getApellido(),
                    "correo", clienteGuardado.getCorreo()
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
    
    @GetMapping("/api/current")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Cliente cliente = (Cliente) session.getAttribute("cliente");
        
        if (cliente == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        
        return ResponseEntity.ok(Map.of(
            "authenticated", true,
            "cliente", Map.of(
                "id", cliente.getId(),
                "nombre", cliente.getNombre(),
                "apellido", cliente.getApellido(),
                "correo", cliente.getCorreo()
            )
        ));
    }
    
    // ==========================================
    // CLASES DE REQUEST
    // ==========================================
    
    public static class LoginRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class RegisterRequest {
        private String nombre;
        private String apellido;
        private String email;
        private String password;
        private String confirmPassword;
        private String telefono;
        private String direccion;
        
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public String getApellido() { return apellido; }
        public void setApellido(String apellido) { this.apellido = apellido; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
        
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
    }
}