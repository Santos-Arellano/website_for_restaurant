package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import restaurante.example.burgur.Entities.Producto;

@Service
public interface ProductoService {
    public List<Producto> findAll();
} 