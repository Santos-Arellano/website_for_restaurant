//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/ProductoController.java
package restaurante.example.burgur.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Service.ProductoService;

@Controller
@RequestMapping("/menu")
public class ProductoController {
    
    @Autowired
    private ProductoService productoService;

    // ==========================================
    // VISTAS DE ADMINISTRACIÓN
    // ==========================================
    
    @GetMapping("/admin")
    public String administrarProductos(Model model) {
        productoService.rebuildAdicionalesDeTodosLosProductos();
        try {
            List<Producto> productos = productoService.findAll();
            
            long totalProductos = productos.size();
            long productosNuevos = productos.stream()
                .filter(p -> p != null && p.isNuevo())
                .count();
            long productosActivos = productos.stream()
                .filter(p -> p != null && p.isActivo())
                .count();
            long stockBajo = productos.stream()
                .filter(p -> p != null && p.isStockBajo())
                .count();
            
            model.addAttribute("productos", productos);
            model.addAttribute("totalProductos", totalProductos);
            model.addAttribute("productosNuevos", productosNuevos);
            model.addAttribute("productosActivos", productosActivos);
            model.addAttribute("stockBajo", stockBajo);
            
            return "admin/admin-products";
        } catch (Exception e) {
            model.addAttribute("productos", List.of());
            model.addAttribute("error", "Error al cargar productos: " + e.getMessage());
            return "admin/admin-products";
        }
    }
    
    
    // ==========================================
    // API REST PARA PRODUCTOS
    // ==========================================
    
    @GetMapping("/api/productos/{id}")
    // Retorna el producto junto con su lista de adicionales permitidos
    @ResponseBody
    public ResponseEntity<Map<String, Object>> obtenerProductoPorId(@PathVariable Long id) {
        try {
            Optional<Producto> productoOpt = productoService.findById(id);
            if (productoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Producto producto = productoOpt.get();
            List<Adicional> adicionales = productoService.obtenerAdicionalesPermitidos(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("producto", producto);
            response.put("adicionalesPermitidos", adicionales);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<List<Producto>> obtenerTodosLosProductos() {
        try {
            return ResponseEntity.ok(productoService.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearProducto(@RequestBody ProductoRequest request) {
        try {
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El nombre es requerido"));
            }
            if (request.getCategoria() == null || request.getCategoria().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "La categoría es requerida"));
            }
            if (request.getPrecio() == null || request.getPrecio() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El precio debe ser mayor a 0"));
            }
            if (request.getStock() == null || request.getStock() < 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El stock no puede ser negativo"));
            }
            
            Producto producto = new Producto();
            producto.setNombre(request.getNombre());
            producto.setCategoria(request.getCategoria());
            producto.setPrecio(request.getPrecio());
            producto.setStock(request.getStock());
            producto.setDescripcion(request.getDescripcion());
            producto.setImgURL(request.getImgURL());
            producto.setIngredientes(request.getIngredientes());
            producto.setNuevo(request.getNuevo() != null ? request.getNuevo() : false);
            producto.setPopular(request.getPopular() != null ? request.getPopular() : false);
            producto.setActivo(request.getActivo() != null ? request.getActivo() : true);
            
            Producto savedProducto = productoService.save(producto);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Producto creado correctamente",
                "producto", savedProducto
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error interno del servidor"));
        }
    }
    
    @PutMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarProducto(
            @PathVariable Long id, @RequestBody ProductoRequest request) {
        try {
            if (!productoService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El nombre es requerido"));
            }
            if (request.getCategoria() == null || request.getCategoria().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "La categoría es requerida"));
            }
            if (request.getPrecio() == null || request.getPrecio() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El precio debe ser mayor a 0"));
            }
            if (request.getStock() == null || request.getStock() < 0) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "El stock no puede ser negativo"));
            }
            
            Producto producto = productoService.findById(id).get();
            producto.setNombre(request.getNombre());
            producto.setCategoria(request.getCategoria());
            producto.setPrecio(request.getPrecio());
            producto.setStock(request.getStock());
            producto.setDescripcion(request.getDescripcion());
            producto.setImgURL(request.getImgURL());
            producto.setIngredientes(request.getIngredientes());
            producto.setNuevo(request.getNuevo() != null ? request.getNuevo() : false);
            producto.setPopular(request.getPopular() != null ? request.getPopular() : false);
            producto.setActivo(request.getActivo() != null ? request.getActivo() : true);
            
            Producto updatedProducto = productoService.save(producto);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Producto actualizado correctamente",
                "producto", updatedProducto
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error interno del servidor"));
        }
    }
    
    @DeleteMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarProducto(@PathVariable Long id) {
        try {
            if (!productoService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            productoService.deleteById(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Producto eliminado correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error al eliminar el producto"));
        }
    }
    

    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    
    public static class ProductoRequest {
        private String nombre;
        private String categoria;
        private Double precio;
        private Integer stock;
        private String descripcion;
        private String imgURL;
        private List<String> ingredientes;
        private Boolean nuevo;
        private Boolean popular;
        private Boolean activo;
        
        // Getters y Setters
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        
        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
        
        public Double getPrecio() { return precio; }
        public void setPrecio(Double precio) { this.precio = precio; }
        
        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
        
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        
        public String getImgURL() { return imgURL; }
        public void setImgURL(String imgURL) { this.imgURL = imgURL; }
        
        public List<String> getIngredientes() { return ingredientes; }
        public void setIngredientes(List<String> ingredientes) { this.ingredientes = ingredientes; }
        
        public Boolean getNuevo() { return nuevo; }
        public void setNuevo(Boolean nuevo) { this.nuevo = nuevo; }
        
        public Boolean getPopular() { return popular; }
        public void setPopular(Boolean popular) { this.popular = popular; }
        
        public Boolean getActivo() { return activo; }
        public void setActivo(Boolean activo) { this.activo = activo; }
    }
}