package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Cliente;

@Service
public interface ClienteService {
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================

    // Crear ó actualizar Cliente
    Cliente save(Cliente cliente);
    // Eliminar Cliente
    void eliminarCliente(Long id);
    // Obtener Cliente por ID
    Cliente obtenerClientePorId(Long id);
    // Obtener todos los Clientes
    List<Cliente> obtenerTodosLosClientes();
    // Verificar si un Cliente existe por ID
    boolean existeClientePorId(Long id);
    // Inicio de Sesión
    Cliente iniciarSesion(String email, String password);


    // ==========================================
    // VALIDACIONES
    // ==========================================
    void validarCliente(Cliente c);
}
