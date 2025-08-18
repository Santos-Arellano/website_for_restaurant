package restaurante.example.burgur.Controller;

import restaurante.example.burgur.Service.ProductoService;
import restaurante.example.burgur.Entities.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private ProductoService productoService;

    @GetMapping("")
    public String adminDashboard(Model model) {
        List<Producto> productos = productoService.findAll();
        
        long totalProductos = productos.size();
        long productosNuevos = productos.stream().filter(Producto::isNuevo).count();
        long productosActivos = productos.stream().filter(Producto::isActivo).count();
        long stockBajo = productos.stream().filter(p -> simulateStockBajo(p)).count();
        
        model.addAttribute("productos", productos);
        model.addAttribute("totalProductos", totalProductos);
        model.addAttribute("productosNuevos", productosNuevos);
        model.addAttribute("productosActivos", productosActivos);
        model.addAttribute("stockBajo", stockBajo);
        
        return "admin/admin-products"; // Updated to match templates/admin/admin-products.html
    }

    /**
     * API REST para obtener productos (AJAX)
     */
    @GetMapping("/api/productos")
    @ResponseBody
    public List<Producto> obtenerProductos() {
        return productoService.findAll();
    }

    /**
     * API REST para obtener un producto por ID
     */
    @GetMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Producto> obtenerProducto(@PathVariable Integer id) {
        List<Producto> productos = productoService.findAll();
        Producto producto = productos.stream()
            .filter(p -> p.getId().equals(id))
            .findFirst()
            .orElse(null);
        
        if (producto != null) {
            return ResponseEntity.ok(producto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * API REST para buscar productos
     */
    @GetMapping("/api/productos/buscar")
    @ResponseBody
    public List<Producto> buscarProductos(@RequestParam String termino) {
        List<Producto> productos = productoService.findAll();
        String terminoLower = termino.toLowerCase();
        
        return productos.stream()
            .filter(producto -> 
                producto.getNombre().toLowerCase().contains(terminoLower) ||
                producto.getDescripcion().toLowerCase().contains(terminoLower) ||
                producto.getCategoria().toLowerCase().contains(terminoLower)
            )
            .collect(Collectors.toList());
    }

    /**
     * API REST para filtrar productos por categoría
     */
    @GetMapping("/api/productos/categoria/{categoria}")
    @ResponseBody
    public List<Producto> obtenerProductosPorCategoria(@PathVariable String categoria) {
        List<Producto> productos = productoService.findAll();
        
        if ("TODOS".equalsIgnoreCase(categoria)) {
            return productos;
        }
        
        return productos.stream()
            .filter(producto -> producto.getCategoria().equalsIgnoreCase(categoria))
            .collect(Collectors.toList());
    }

    /**
     * API REST para crear un nuevo producto (simulado)
     */
    @PostMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearProducto(@RequestBody ProductoRequest request) {
        try {
            // En una implementación real, aquí guardarías en la base de datos
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Producto creado correctamente",
                "producto", request
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Error al crear el producto: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * API REST para actualizar un producto (simulado)
     */
    @PutMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarProducto(@PathVariable Integer id, 
                                                                 @RequestBody ProductoRequest request) {
        try {
            // Verificar que el producto existe
            List<Producto> productos = productoService.findAll();
            boolean existe = productos.stream().anyMatch(p -> p.getId().equals(id));
            
            if (!existe) {
                Map<String, Object> errorResponse = Map.of(
                    "success", false,
                    "message", "Producto no encontrado"
                );
                return ResponseEntity.notFound().build();
            }
            
            // En una implementación real, aquí actualizarías en la base de datos
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Producto actualizado correctamente",
                "producto", request
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Error al actualizar el producto: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * API REST para eliminar un producto (simulado)
     */
    @DeleteMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarProducto(@PathVariable Integer id) {
        try {
            // Verificar que el producto existe
            List<Producto> productos = productoService.findAll();
            boolean existe = productos.stream().anyMatch(p -> p.getId().equals(id));
            
            if (!existe) {
                Map<String, Object> errorResponse = Map.of(
                    "success", false,
                    "message", "Producto no encontrado"
                );
                return ResponseEntity.notFound().build();
            }
            
            // En una implementación real, aquí eliminarías de la base de datos
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Producto eliminado correctamente"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Error al eliminar el producto: " + e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * API REST para obtener estadísticas del dashboard
     */
    @GetMapping("/api/estadisticas")
    @ResponseBody
    public ResponseEntity<DashboardStats> obtenerEstadisticas() {
        List<Producto> productos = productoService.findAll();
        
        DashboardStats stats = new DashboardStats();
        stats.setTotalProductos(productos.size());
        stats.setProductosNuevos((int) productos.stream().filter(Producto::isNuevo).count());
        stats.setProductosActivos((int) productos.stream().filter(Producto::isActivo).count());
        stats.setProductosStockBajo((int) productos.stream().filter(p -> simulateStockBajo(p)).count());
        stats.setValorTotalInventario(
            productos.stream().mapToDouble(p -> p.getPrecio() * simulateStock(p)).sum()
        );
        
        return ResponseEntity.ok(stats);
    }

    // Métodos auxiliares para simular funcionalidades
    private boolean simulateStockBajo(Producto producto) {
        // Simular stock bajo basado en el ID del producto
        return producto.getId() % 4 == 0; // 25% de productos con stock bajo
    }

    private int simulateStock(Producto producto) {
        // Simular stock basado en el ID del producto
        return Math.max(1, (producto.getId() * 3) % 50);
    }

    /**
     * Clase para requests de productos
     */
    public static class ProductoRequest {
        private String nombre;
        private Double precio;
        private String descripcion;
        private String imgURL;
        private Boolean activo;
        private String categoria;
        private List<String> ingredientes;
        private Boolean nuevo;

        // Getters y Setters
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public Double getPrecio() { return precio; }
        public void setPrecio(Double precio) { this.precio = precio; }

        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

        public String getImgURL() { return imgURL; }
        public void setImgURL(String imgURL) { this.imgURL = imgURL; }

        public Boolean getActivo() { return activo; }
        public void setActivo(Boolean activo) { this.activo = activo; }

        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }

        public List<String> getIngredientes() { return ingredientes; }
        public void setIngredientes(List<String> ingredientes) { this.ingredientes = ingredientes; }

        public Boolean getNuevo() { return nuevo; }
        public void setNuevo(Boolean nuevo) { this.nuevo = nuevo; }
    }

    /**
     * Clase para estadísticas del dashboard
     */
    public static class DashboardStats {
        private int totalProductos;
        private int productosNuevos;
        private int productosActivos;
        private int productosStockBajo;
        private double valorTotalInventario;

        // Getters y Setters
        public int getTotalProductos() { return totalProductos; }
        public void setTotalProductos(int totalProductos) { this.totalProductos = totalProductos; }

        public int getProductosNuevos() { return productosNuevos; }
        public void setProductosNuevos(int productosNuevos) { this.productosNuevos = productosNuevos; }

        public int getProductosActivos() { return productosActivos; }
        public void setProductosActivos(int productosActivos) { this.productosActivos = productosActivos; }

        public int getProductosStockBajo() { return productosStockBajo; }
        public void setProductosStockBajo(int productosStockBajo) { this.productosStockBajo = productosStockBajo; }

        public double getValorTotalInventario() { return valorTotalInventario; }
        public void setValorTotalInventario(double valorTotalInventario) { this.valorTotalInventario = valorTotalInventario; }
    }

    /**
     * Manejo de errores
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarError(Exception e) {
        Map<String, Object> error = Map.of(
            "success", false,
            "message", "Error interno del servidor",
            "detalle", e.getMessage(),
            "timestamp", System.currentTimeMillis()
        );
        
        return ResponseEntity.internalServerError().body(error);
    }
}