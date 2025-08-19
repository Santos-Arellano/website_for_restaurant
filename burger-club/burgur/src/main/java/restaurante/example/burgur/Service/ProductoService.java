package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import restaurante.example.burgur.Entities.Producto;

@Service
public interface ProductoService {
    // Obtener todos los productos
    public List<Producto> findAll();
    // Obtener productos por nombre
    public List<Producto> findByNombre(String nombre);
    // Obtener productos por categoria
    public List<Producto> findByCategoria(String categoria);


} 