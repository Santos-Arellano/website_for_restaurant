//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/ProductoController.java
package restaurante.example.burgur.Controller;

import java.util.List;
import java.util.Map;

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
    // VISTA ADMIN
    // ==========================================
    
    @GetMapping("/admin")
    public String administrarProductos(Model model) {
        try {
            List<Producto> productos = productoService.findAll();
            
            long totalProductos = productos.size();
            long productosNuevos = productos.stream().filter(p -> p != null && p.isNuevo()).count();
            long productosActivos = productos.stream().filter(p -> p != null && p.isActivo()).count();
            long stockBajo = productos.stream().filter(p -> p != null && p.getStock() != null && p.getStock() < 5).count();
            
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
    // API REST
    // ==========================================
    
    @GetMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<List<Producto>> obtenerTodosLosProductos() {
        try {
            return ResponseEntity.ok(productoService.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<ProductoResponse> obtenerProductoPorId(@PathVariable Long id) {
        try {
            var productoOpt = productoService.findById(id);
            if (productoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Producto producto = productoOpt.get();
            List<Adicional> adicionales = productoService.obtenerAdicionalesPermitidos(id);
            
            return ResponseEntity.ok(new ProductoResponse(producto, adicionales));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearProducto(@RequestBody ProductoRequest request) {
        try {
            Producto producto = new Producto();
            producto.setNombre(request.getNombre());
            producto.setCategoria(request.getCategoria());
            producto.setPrecio(request.getPrecio());
            producto.setStock(request.getStock());
            producto.setDescripcion(request.getDescripcion());
            producto.setImgURL(request.getImagen());
            producto.setIngredientes(request.getIngredientes());
            producto.setNuevo(request.getIsNew() != null ? request.getIsNew() : false);
            producto.setPopular(request.getIsPopular() != null ? request.getIsPopular() : false);
            producto.setActivo(true);
            
            Producto savedProducto = productoService.save(producto);
            
            // Actualizar adicionales después de crear
            productoService.updateAdicionalesDeTodosLosProductos();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Producto creado correctamente",
                "producto", savedProducto
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false, 
                "message", "Error interno del servidor"
            ));
        }
    }
    
    @PutMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarProducto(
            @PathVariable Long id, @RequestBody ProductoRequest request) {
        try {
            var productoOpt = productoService.findById(id);
            if (productoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Producto producto = productoOpt.get();
            producto.setNombre(request.getNombre());
            producto.setCategoria(request.getCategoria());
            producto.setPrecio(request.getPrecio());
            producto.setStock(request.getStock());
            producto.setDescripcion(request.getDescripcion());
            producto.setImgURL(request.getImagen());
            producto.setIngredientes(request.getIngredientes());
            producto.setNuevo(request.getIsNew() != null ? request.getIsNew() : false);
            producto.setPopular(request.getIsPopular() != null ? request.getIsPopular() : false);
            
            Producto updatedProducto = productoService.save(producto);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Producto actualizado correctamente",
                "producto", updatedProducto
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false, 
                "message", "Error interno del servidor"
            ));
        }
    }
    
    @DeleteMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarProducto(@PathVariable Long id) {
        try {
            productoService.deleteById(id);
            return ResponseEntity.ok(Map.of(
                "success", true, 
                "message", "Producto eliminado correctamente"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false, 
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false, 
                "message", "Error al eliminar el producto"
            ));
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
        private String imagen;
        private List<String> ingredientes;
        private Boolean isNew;
        private Boolean isPopular;
        
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
        
        public String getImagen() { return imagen; }
        public void setImagen(String imagen) { this.imagen = imagen; }
        
        public List<String> getIngredientes() { return ingredientes; }
        public void setIngredientes(List<String> ingredientes) { this.ingredientes = ingredientes; }
        
        public Boolean getIsNew() { return isNew; }
        public void setIsNew(Boolean isNew) { this.isNew = isNew; }
        
        public Boolean getIsPopular() { return isPopular; }
        public void setIsPopular(Boolean isPopular) { this.isPopular = isPopular; }
    }
    
    public static class ProductoResponse {
        private Producto producto;
        private List<Adicional> adicionalesPermitidos;
        
        public ProductoResponse(Producto producto, List<Adicional> adicionalesPermitidos) {
            this.producto = producto;
            this.adicionalesPermitidos = adicionalesPermitidos;
        }
        
        public Producto getProducto() { return producto; }
        public void setProducto(Producto producto) { this.producto = producto; }
        
        public List<Adicional> getAdicionalesPermitidos() { return adicionalesPermitidos; }
        public void setAdicionalesPermitidos(List<Adicional> adicionalesPermitidos) { 
            this.adicionalesPermitidos = adicionalesPermitidos; 
        }
    }
}