package restaurante.example.burgur.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import restaurante.example.burgur.Entities.Producto;
import restaurante.example.burgur.Repository.ProductoRepository;

@Service
public class ProductoServiceImpl implements ProductoService {

  @Autowired
  ProductoRepository productoRepository;

  @Override
  // Obtener todos los productos
  public List<Producto> findAll(){
    return productoRepository.findAll();
  }

  @Override
  // Obtener productos por nombre
  public List<Producto> findByNombre(String nombre) {
    return productoRepository.findByNombre(nombre);
  }

  @Override
  // Obtener productos por categoria
  public List<Producto> findByCategoria(String categoria) {
    return productoRepository.findByCategoria(categoria);
  }

}
