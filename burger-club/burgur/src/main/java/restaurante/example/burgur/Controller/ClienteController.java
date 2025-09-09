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
import lombok.Data;

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
    
    @GetMapping("/list")
    @ResponseBody
    public ResponseEntity<List<Cliente>> obtenerTodosLosClientes() {
        try {
            return ResponseEntity.ok(clienteService.obtenerTodosLosClientes());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
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
    
    @PostMapping("")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearCliente(@RequestBody ClienteRequest request) {
        try {
            ResponseEntity<Map<String, Object>> validationError = validateClienteRequest(request);
            if (validationError != null) {
                return validationError;
            }
            
            Cliente cliente = buildClienteFromRequest(request);
            Cliente savedCliente = clienteService.save(cliente);
            
            return buildSuccessResponse("Cliente creado correctamente", savedCliente);
        } catch (IllegalArgumentException e) {
            return handleBadRequest(e.getMessage());
        } catch (Exception e) {
            return handleInternalError("Error interno del servidor");
        }
    }
    
    @PutMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarCliente(
            @PathVariable Long id, @RequestBody ClienteRequest request) {
        try {
            ResponseEntity<Map<String, Object>> validationError = validateClienteUpdateRequest(request);
            if (validationError != null) {
                return validationError;
            }
            
            Cliente cliente = clienteService.obtenerClientePorId(id);
            updateClienteFromRequest(cliente, request);
            Cliente updatedCliente = clienteService.save(cliente);
            
            return buildSuccessResponse("Cliente actualizado correctamente", updatedCliente);
        } catch (IllegalArgumentException e) {
            return handleBadRequest(e.getMessage());
        } catch (Exception e) {
            return handleInternalError("Error interno del servidor");
        }
    }
    
    // ==========================================
    // MÉTODOS UTILITARIOS PARA MANEJO DE ERRORES
    // ==========================================
    
    private ResponseEntity<Map<String, Object>> handleBadRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", message));
    }
    
    private ResponseEntity<Map<String, Object>> handleInternalError(String message) {
        return ResponseEntity.internalServerError().body(Map.of("success", false, "message", message));
    }
    
    private ResponseEntity<Map<String, Object>> validateClienteRequest(ClienteRequest request) {
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            return handleBadRequest("El nombre es requerido");
        }
        if (request.getApellido() == null || request.getApellido().trim().isEmpty()) {
            return handleBadRequest("El apellido es requerido");
        }
        if (request.getCorreo() == null || request.getCorreo().trim().isEmpty()) {
            return handleBadRequest("El correo es requerido");
        }
        if (request.getContrasena() == null || request.getContrasena().trim().isEmpty()) {
            return handleBadRequest("La contraseña es requerida");
        }
        return null; // No hay errores de validación
    }
    
    private Cliente buildClienteFromRequest(ClienteRequest request) {
        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setCorreo(request.getCorreo());
        cliente.setContrasena(request.getContrasena());
        cliente.setTelefono(request.getTelefono());
        cliente.setDireccion(request.getDireccion());
        cliente.setActivo(true);
        return cliente;
    }
    
    private ResponseEntity<Map<String, Object>> buildSuccessResponse(String message, Cliente cliente) {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", message,
            "cliente", cliente
        ));
    }
    
    private ResponseEntity<Map<String, Object>> validateClienteUpdateRequest(ClienteRequest request) {
        if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
            return handleBadRequest("El nombre es requerido");
        }
        if (request.getApellido() == null || request.getApellido().trim().isEmpty()) {
            return handleBadRequest("El apellido es requerido");
        }
        if (request.getCorreo() == null || request.getCorreo().trim().isEmpty()) {
            return handleBadRequest("El correo es requerido");
        }
        return null; // No hay errores de validación
    }
    
    private void updateClienteFromRequest(Cliente cliente, ClienteRequest request) {
        cliente.setNombre(request.getNombre());
        cliente.setApellido(request.getApellido());
        cliente.setCorreo(request.getCorreo());
        cliente.setTelefono(request.getTelefono());
        cliente.setDireccion(request.getDireccion());
        
        // Solo actualizar contraseña si se proporcionó una nueva
        if (request.getContrasena() != null && !request.getContrasena().trim().isEmpty()) {
            cliente.setContrasena(request.getContrasena());
        }
    }
    
    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarCliente(@PathVariable Long id) {
        try {
            if (!clienteService.existeClientePorId(id)) {
                return ResponseEntity.status(404).body(Map.of(
                    "success", false, 
                    "message", "Cliente no encontrado"
                ));
            }
            clienteService.eliminarCliente(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cliente eliminado correctamente"));
        } catch (IllegalArgumentException e) {
            return handleBadRequest(e.getMessage());
        } catch (Exception e) {
            return handleInternalError("Error al eliminar el cliente");
        }
    }
    
    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    
    @Data
    public static class ClienteRequest {
        private String nombre;
        private String apellido;
        private String correo;
        private String contrasena;
        private String telefono;
        private String direccion;
    }
}