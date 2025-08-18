package restaurante.example.burgur.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import restaurante.example.burgur.Entities.Producto;
import restaurante.example.burgur.Repository.ProductoRepository;

@Service
public class ProductoServiceImpl implements ProductoService {
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Override
    public List<Producto> findAll() {
        return productoRepository.findAll();
    }
    
    // Métodos adicionales para administración
    public Optional<Producto> findById(Integer id) {
        Producto producto = productoRepository.findById(id);
        return Optional.ofNullable(producto);
    }
    
    public List<Producto> findByCategoria(String categoria) {
        return productoRepository.findByCategoria(categoria);
    }
    
    public List<Producto> findByNuevo(boolean nuevo) {
        return productoRepository.findByNuevo(nuevo);
    }
    
    public List<Producto> findByPopular(boolean popular) {
        return productoRepository.findByPopular(popular);
    }
    
    public List<Producto> findByStockBajo(int limite) {
        return productoRepository.findByStockBajo(limite);
    }
    
    public List<Producto> search(String termino) {
        if (termino == null || termino.trim().isEmpty()) {
            return findAll();
        }
        return productoRepository.search(termino);
    }
    
    public Producto save(Producto producto) {
        // Validaciones básicas
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del producto es requerido");
        }
        
        if (producto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio debe ser mayor a 0");
        }
        
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        
        return productoRepository.save(producto);
    }
    
    public void deleteById(Integer id) {
        if (!productoRepository.existsById(id)) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        productoRepository.deleteById(id);
    }
    
    public boolean existsById(Integer id) {
        return productoRepository.existsById(id);
    }
    
    // Métodos de estadísticas
    public EstadisticasProducto getEstadisticas() {
        List<Producto> productos = findAll();
        
        EstadisticasProducto stats = new EstadisticasProducto();
        stats.setTotalProductos(productos.size());
        stats.setProductosNuevos((int) productos.stream().filter(Producto::isNuevo).count());
        stats.setProductosPopulares((int) productos.stream().filter(Producto::isPopular).count());
        stats.setProductosActivos((int) productos.stream().filter(Producto::isActivo).count());
        stats.setProductosStockBajo((int) productos.stream().filter(Producto::isStockBajo).count());
        stats.setStockTotal(productos.stream().mapToInt(Producto::getStock).sum());
        stats.setValorTotalInventario(
            productos.stream().mapToDouble(p -> p.getPrecio() * p.getStock()).sum()
        );
        
        return stats;
    }
    
    // Métodos para actualizar propiedades específicas
    public Producto updateStock(Integer id, Integer nuevoStock) {
        Optional<Producto> productoOpt = findById(id);
        if (!productoOpt.isPresent()) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        
        if (nuevoStock < 0) {
            throw new IllegalArgumentException("El stock no puede ser negativo");
        }
        
        Producto producto = productoOpt.get();
        producto.setStock(nuevoStock);
        return save(producto);
    }
    
    public Producto toggleNuevo(Integer id) {
        Optional<Producto> productoOpt = findById(id);
        if (!productoOpt.isPresent()) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        
        Producto producto = productoOpt.get();
        producto.setNuevo(!producto.isNuevo());
        return save(producto);
    }
    
    public Producto togglePopular(Integer id) {
        Optional<Producto> productoOpt = findById(id);
        if (!productoOpt.isPresent()) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        
        Producto producto = productoOpt.get();
        producto.setPopular(!producto.isPopular());
        return save(producto);
    }
    
    public Producto toggleActivo(Integer id) {
        Optional<Producto> productoOpt = findById(id);
        if (!productoOpt.isPresent()) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        
        Producto producto = productoOpt.get();
        producto.setActivo(!producto.isActivo());
        return save(producto);
    }
    
    // Clase interna para estadísticas
    public static class EstadisticasProducto {
        private int totalProductos;
        private int productosNuevos;
        private int productosPopulares;
        private int productosActivos;
        private int productosStockBajo;
        private int stockTotal;
        private double valorTotalInventario;

        // Getters y Setters
        public int getTotalProductos() { return totalProductos; }
        public void setTotalProductos(int totalProductos) { this.totalProductos = totalProductos; }

        public int getProductosNuevos() { return productosNuevos; }
        public void setProductosNuevos(int productosNuevos) { this.productosNuevos = productosNuevos; }

        public int getProductosPopulares() { return productosPopulares; }
        public void setProductosPopulares(int productosPopulares) { this.productosPopulares = productosPopulares; }

        public int getProductosActivos() { return productosActivos; }
        public void setProductosActivos(int productosActivos) { this.productosActivos = productosActivos; }

        public int getProductosStockBajo() { return productosStockBajo; }
        public void setProductosStockBajo(int productosStockBajo) { this.productosStockBajo = productosStockBajo; }

        public int getStockTotal() { return stockTotal; }
        public void setStockTotal(int stockTotal) { this.stockTotal = stockTotal; }

        public double getValorTotalInventario() { return valorTotalInventario; }
        public void setValorTotalInventario(double valorTotalInventario) { this.valorTotalInventario = valorTotalInventario; }
    }
}