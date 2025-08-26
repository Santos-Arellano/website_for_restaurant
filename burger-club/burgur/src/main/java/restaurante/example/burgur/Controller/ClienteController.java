//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/ClienteController.java
package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Service.ClienteService;

@Controller
@RequestMapping("/admin/clientes")
public class ClienteController {
    
    @Autowired
    private ClienteService clienteService;
    
    // ==========================================
    // VISTAS DE ADMINISTRACIÓN
    // ==========================================
    
    @GetMapping("")
    public String administrarClientes(Model model) {
        try {
            List<Cliente> clientes = clienteService.obtenerTodosLosClientes();
            
            long totalClientes = clientes.size();
            long clientesActivos = clientes.stream()
                .filter(c -> c != null && c.isActivo())
                .count();
            
            model.addAttribute("clientes", clientes);
            model.addAttribute("totalClientes", totalClientes);
            model.addAttribute("clientesActivos", clientesActivos);
            
            return "admin/admin-clientes";
        } catch (Exception e) {
            model.addAttribute("clientes", List.of());
            model.addAttribute("error", "Error al cargar clientes: " + e.getMessage());
            return "admin/admin-clientes";
        }
    }
    
    // ==========================================
    // API REST
    // ==========================================
    
    @GetMapping("/api")
    @ResponseBody
    public ResponseEntity<List<Cliente>> obtenerTodosLosClientes() {
        try {
            return ResponseEntity.ok(clienteService.obtenerTodosLosClientes());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Cliente> obtenerClientePorId(@PathVariable Long id) {
        try {
            Cliente cliente = clienteService.obtenerClientePorId(id);
            return ResponseEntity.ok(cliente);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/api")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearCliente(@RequestBody ClienteRequest request) {
        try {
            Cliente cliente = new Cliente();
            cliente.setNombre(request.getNombre());
            cliente.setApellido(request.getApellido());
            cliente.setCorreo(request.getCorreo());
            cliente.setContrasena(request.getContrasena());
            cliente.setTelefono(request.getTelefono());
            cliente.setDireccion(request.getDireccion());
            cliente.setActivo(true);
            
            Cliente savedCliente = clienteService.save(cliente);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cliente creado correctamente",
                "cliente", savedCliente
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
    
    @PutMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarCliente(
            @PathVariable Long id, @RequestBody ClienteRequest request) {
        try {
            Cliente cliente = clienteService.obtenerClientePorId(id);
            cliente.setNombre(request.getNombre());
            cliente.setApellido(request.getApellido());
            cliente.setCorreo(request.getCorreo());
            if (request.getContrasena() != null && !request.getContrasena().trim().isEmpty()) {
                cliente.setContrasena(request.getContrasena());
            }
            cliente.setTelefono(request.getTelefono());
            cliente.setDireccion(request.getDireccion());
            
            Cliente updatedCliente = clienteService.save(cliente);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cliente actualizado correctamente",
                "cliente", updatedCliente
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
    
    @DeleteMapping("/api/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarCliente(@PathVariable Long id) {
        try {
            clienteService.eliminarCliente(id);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Cliente eliminado correctamente"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false, 
                "message", "Error al eliminar el cliente"
            ));
        }
    }
    
    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    
    public static class ClienteRequest {
        private String nombre;
        private String apellido;
        private String correo;
        private String contrasena;
        private String telefono;
        private String direccion;
        
        // Getters y Setters
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public String getApellido() { return apellido; }
        public void setApellido(String apellido) { this.apellido = apellido; }
        
        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }
        
        public String getContrasena() { return contrasena; }
        public void setContrasena(String contrasena) { this.contrasena = contrasena; }
        
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
    }
}