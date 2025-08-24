package restaurante.example.burgur.Controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Service.ClienteService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/cliente")
public class ClienteController {
    @Autowired
    ClienteService clienteService;

    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================

    // Registrar Cliente
    @PostMapping("/registrar")
    public ResponseEntity<?> registrarCliente(@RequestBody Cliente clienteNuevo) {
        try {
            Cliente cN = clienteService.save(clienteNuevo);
            return ResponseEntity.status(HttpStatus.CREATED).body(cN);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al registrar cliente");
        }

    }

    // Iniciar Sesión
    @GetMapping("/iniciar-sesion")
    public ResponseEntity<?> iniciarSesion(@RequestParam String email, @RequestParam String password) {
        try {
            Cliente cliente = clienteService.iniciarSesion(email, password);
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error al iniciar sesión");
        }
    }

    // Actualizar Cliente
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarCliente(@PathVariable Long id, @RequestBody Cliente clienteActualizado) {
        try {
            clienteActualizado.setId(id);
            Cliente cA = clienteService.save(clienteActualizado);
            return ResponseEntity.ok(cA);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al actualizar cliente");
        }
    }

    // Eliminar Cliente
    @PostMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminarCliente(@PathVariable Long id) {
        try {
            clienteService.eliminarCliente(id);
            return ResponseEntity.ok("Cliente eliminado");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al eliminar cliente");
        }
    }

    // Buscar Cliente por ID
    @GetMapping("/buscar")
    public ResponseEntity<?> obtenerClientePorId(@RequestParam Long id) {
        try {
            Cliente cliente = clienteService.obtenerClientePorId(id);
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al obtener cliente");
        }
    }

    // Buscar Todos los Clientes
    @GetMapping("/buscar/todos")
    public ResponseEntity<?> obtenerTodosLosClientes() {
        try {
            List<Cliente> clientes = clienteService.obtenerTodosLosClientes();
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al obtener clientes");
        }
    }

}
