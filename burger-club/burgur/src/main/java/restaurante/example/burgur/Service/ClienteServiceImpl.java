//burger-club/burgur/src/main/java/restaurante/example/burgur/Service/ClienteServiceImpl.java
package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Model.Cliente;
import restaurante.example.burgur.Repository.ClienteRepository;

@Service
public class ClienteServiceImpl implements ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;
    // ==========================================
    // MÉTODOS BÁSICOS CRUD
    // ==========================================
        
    // Crear ó actualizar Cliente
    @Override
    public Cliente save(Cliente cliente) {
        // 1) Validación más normalización (incluye null checks)
        validarCliente(cliente);
        // 2) Reglas de unicidad por correo (case-insensitive)
        if (cliente.getId() == null) {
            // CREAR
            if (clienteRepository.existsByCorreoIgnoreCase(cliente.getCorreo())) {
                throw new IllegalArgumentException("Ya existe un cliente con el correo: " + cliente.getCorreo());
            }
        } else {
            // ACTUALIZAR
            if (!clienteRepository.existsById(cliente.getId())) {
                throw new IllegalArgumentException("No existe un cliente con el ID: " + cliente.getId());
            }
            if(clienteRepository.existsByCorreoIgnoreCaseAndIdNot(cliente.getCorreo(), cliente.getId())) {
                throw new IllegalArgumentException("Ya existe otro cliente con el correo: " + cliente.getCorreo());
            }
        }
        // 3) JPA decide INSERT/UPDATE
        return clienteRepository.save(cliente);
    }

    // Iniciar Sesión
    @Override
    public Cliente iniciarSesion(String email, String password) {
        String correo = (email == null) ? null : email.trim().toLowerCase();
        if (correo == null || correo.isEmpty()) {
            throw new IllegalArgumentException("El correo es requerido");
        }
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("La contraseña es requerida");
        }

        Cliente cliente = clienteRepository.findByCorreoIgnoreCase(correo);
        if (cliente == null) {
            throw new IllegalArgumentException("No existe un cliente con el correo: " + correo);
        }
        if (!cliente.getContrasena().equals(password)) {
            throw new IllegalArgumentException("Contraseña incorrecta");
        }
        return cliente;
    }
    // Eliminar Cliente
    @Override
    public void eliminarCliente(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe el cliente con ID: " + id);
        }
        clienteRepository.deleteById(id);
    }

    // Obtener Cliente por ID
    @Override
    public Cliente obtenerClientePorId(Long id) {
        if (!clienteRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe el cliente con ID: " + id);
        }
        return clienteRepository.findById(id).orElse(null);
    }

    // Obtener todos los Clientes
    @Override
    public List<Cliente> obtenerTodosLosClientes() {
        // Devuelve lista vacía si no hay datos; el controller decide el status
        return clienteRepository.findAll();
    }

    // Verificar si un Cliente existe por ID
    @Override
    public boolean existeClientePorId(Long id) {
        return clienteRepository.existsById(id);
    }

    
    // ==========================================
    // VALIDACIONES
    // ==========================================
    @Override
    public void validarCliente(Cliente c) {
        if (c == null) {
            throw new IllegalArgumentException("El cliente no puede ser nulo");
        }

        // Nombre
        if (c.getNombre() == null || c.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es requerido");
        }
        if (c.getNombre().length() > 100) {
            throw new IllegalArgumentException("El nombre no puede exceder 100 caracteres");
        }

        // Apellido
        if (c.getApellido() == null || c.getApellido().trim().isEmpty()) {
            throw new IllegalArgumentException("El apellido es requerido");
        }
        if (c.getApellido().length() > 100) {
            throw new IllegalArgumentException("El apellido no puede exceder 100 caracteres");
        }

        // Correo
        if (c.getCorreo() == null || c.getCorreo().trim().isEmpty()) {
            throw new IllegalArgumentException("El correo es requerido");
        }
        if (c.getCorreo().length() > 150) {
            throw new IllegalArgumentException("El correo no puede exceder 150 caracteres");
        }
        // Regex simple y efectiva para email (puedes ajustar si necesitas algo más estricto)
        String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!c.getCorreo().trim().matches(EMAIL_REGEX)) {
            throw new IllegalArgumentException("El formato del correo es inválido");
        }

        // Contraseña (ojo: aquí solo validamos; NO guardes texto plano)
        if (c.getContrasena() == null || c.getContrasena().isBlank()) {
            throw new IllegalArgumentException("La contraseña es requerida");
        }
        if (c.getContrasena().length() < 8 || c.getContrasena().length() > 64) {
            throw new IllegalArgumentException("La contraseña debe tener entre 8 y 64 caracteres");
        }
        // (Opcional) reforzar reglas: al menos 1 letra y 1 dígito
        String PWD_REGEX = "^(?=.*[A-Za-z])(?=.*\\d).{8,64}$";
        if (!c.getContrasena().matches(PWD_REGEX)) {
            throw new IllegalArgumentException("La contraseña debe contener al menos una letra y un número");
        }

        // Teléfono (opcional, pero si viene, validar formato)
        if (c.getTelefono() != null && !c.getTelefono().trim().isEmpty()) {
            // Acepta + y dígitos, de 7 a 15 dígitos
            String PHONE_REGEX = "^\\+?[0-9]{7,15}$";
            if (!c.getTelefono().trim().matches(PHONE_REGEX)) {
                throw new IllegalArgumentException("El teléfono debe contener solo dígitos (y opcional +) entre 7 y 15 caracteres");
            }
        }

        // Dirección (opcional)
        if (c.getDireccion() != null && c.getDireccion().length() > 200) {
            throw new IllegalArgumentException("La dirección no puede exceder 200 caracteres");
        }

        // ----------------------------
        // Normalización de campos
        // ----------------------------
        c.setNombre(c.getNombre().trim());
        c.setApellido(c.getApellido().trim());
        c.setCorreo(c.getCorreo().trim().toLowerCase()); // correos en minúsculas para evitar duplicados por case
        if (c.getTelefono() != null) c.setTelefono(c.getTelefono().trim());
        if (c.getDireccion() != null) c.setDireccion(c.getDireccion().trim());
        // Nota: aquí NO normalizamos la contraseña; solo se valida. Hasheala antes de persistir.
    }

}
