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
import lombok.Data;

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
            addProductStatisticsToModel(model, productos);
            return "admin/admin-products";
        } catch (Exception e) {
            handleAdminProductsError(model, e);
            return "admin/admin-products";
        }
    }

    private void addProductStatisticsToModel(Model model, List<Producto> productos) {
        model.addAttribute("productos", productos);
        model.addAttribute("totalProductos", calculateTotalProducts(productos));
        model.addAttribute("productosNuevos", calculateNewProducts(productos));
        model.addAttribute("productosActivos", calculateActiveProducts(productos));
        model.addAttribute("stockBajo", calculateLowStockProducts(productos));
    }

    private long calculateTotalProducts(List<Producto> productos) {
        return productos.size();
    }

    private long calculateNewProducts(List<Producto> productos) {
        return productos.stream()
            .filter(p -> p != null && p.isNuevo())
            .count();
    }

    private long calculateActiveProducts(List<Producto> productos) {
        return productos.stream()
            .filter(p -> p != null && p.isActivo())
            .count();
    }

    private long calculateLowStockProducts(List<Producto> productos) {
        return productos.stream()
            .filter(p -> p != null && p.isStockBajo())
            .count();
    }

    private void handleAdminProductsError(Model model, Exception e) {
        model.addAttribute("productos", List.of());
        model.addAttribute("error", "Error al cargar productos: " + e.getMessage());
    }
    
    
    // ==========================================
    // API REST PARA PRODUCTOS
    // ==========================================
    
    @GetMapping("/productos/{id}")
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
    
    @GetMapping("/productos")
    @ResponseBody
    public ResponseEntity<List<Producto>> obtenerTodosLosProductos() {
        try {
            return ResponseEntity.ok(productoService.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/productos")
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
    
    @PutMapping("/productos/{id}")
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
    
    @DeleteMapping("/productos/{id}")
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
    
    @Data
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
    }
}