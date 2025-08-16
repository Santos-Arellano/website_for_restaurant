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
  public List<Producto> findAll(){
    return productoRepository.findAll();
  }
}
