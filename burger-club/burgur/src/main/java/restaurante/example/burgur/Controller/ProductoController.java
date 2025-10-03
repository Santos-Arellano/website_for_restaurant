//burger-club/burgur/src/main/java/restaurante/example/burgur/Controller/ProductoController.java
package restaurante.example.burgur.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Service.ProductoService;
import lombok.Data;

@RestController
@RequestMapping("/productos")
public class ProductoController {    
    @Autowired
    private ProductoService productoService;
   
    // ==========================================
    // CRUD DE PRODUCTOS (API REST)
    // ==========================================

    @GetMapping("/{id}")
    // Retorna el producto junto con su lista de adicionales permitidos
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
    
    @GetMapping("")
    public ResponseEntity<List<Producto>> obtenerTodosLosProductos() {
        try {
            return ResponseEntity.ok(productoService.findAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("")
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
            productoService.rebuildAdicionalesDeTodosLosProductos();
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

    @PutMapping("/{id}")
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
            productoService.rebuildAdicionalesDeTodosLosProductos();
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
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarProducto(@PathVariable Long id) {
        try {
            if (!productoService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            productoService.deleteById(id);
            productoService.rebuildAdicionalesDeTodosLosProductos();
            return ResponseEntity.ok(Map.of("success", true, "message", "Producto eliminado correctamente"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Error al eliminar el producto"));
        }
    }

    // ==========================================
    // MÉTODOS AUXILIARES
    // ==========================================

    // ====================
    // MÉTODOS VISTA MENU
    // ====================
    // Encontrar Productos por nombre (búsqueda parcial, case insensitive)
    @GetMapping("/search")
    public ResponseEntity<List<Producto>> buscarProductosPorNombre(@RequestParam String nombre) {
        try {
            productoService.rebuildAdicionalesDeTodosLosProductos();
            List<Producto> productos = productoService.findByNombre(nombre);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Encontrar Productos por categoría
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Producto>> obtenerProductosPorCategoria(@PathVariable String categoria) {
        try {
            productoService.rebuildAdicionalesDeTodosLosProductos();
            List<Producto> productos = productoService.findByCategoria(categoria);
            return ResponseEntity.ok(productos);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Calcular cantidad de productos por categoría
    @GetMapping("/cantidadPorCategoria")
    public Map<String, Long> calculateProductsByCategory() {
        List<Producto> productos = productoService.findAll();
        Map<String, Long> categoryCounts = new HashMap<>();
        
        for (Producto producto : productos) {
            if (producto != null && producto.getCategoria() != null) {
                String categoria = producto.getCategoria().toLowerCase();
                categoryCounts.put(categoria, categoryCounts.getOrDefault(categoria, 0L) + 1);
            }
        }
        return categoryCounts;
    }

    // ==============================
    // MÉTODOS VISTA ADMIN- PRODUCTOS
    // ==============================
    @GetMapping("/cantidadTotal")
    public long calculateTotalProducts() {
        List<Producto> productos = productoService.findAll();
        return productos.size();
    }

    @GetMapping("/cantidadNuevos")
    public long calculateNewProducts() {
        List<Producto> productos = productoService.findAll();
        return productos.stream()
            .filter(p -> p != null && p.isNuevo())
            .count();
    }

    @GetMapping("/cantidadActivos")
    public long calculateActiveProducts() {
        List<Producto> productos = productoService.findAll();
        return productos.stream()
            .filter(p -> p != null && p.isActivo())
            .count();
    }

    @GetMapping("/cantidadCategorias")
    public long calculateTotalCategories() {
        List<Producto> productos = productoService.findAll();
        return productos.stream()
            .filter(p -> p != null && p.getCategoria() != null)
            .map(Producto::getCategoria)
            .distinct()
            .count();
    }

    @GetMapping("/cantidadStockBajo")
    public long calculateLowStockProducts() {
        List<Producto> productos = productoService.findAll();
        return productos.stream()
            .filter(p -> p != null && p.isStockBajo())
            .count();
    }

    // ==============================
    // MÉTODOS VISTA ADMIN- DASHBOARD
    // ==============================
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> stats() {
        try {
            List<Producto> productos = productoService.findAll();
            Map<String, Long> stats = Map.of(
                "total", (long) productos.size(),
                "nuevos", productos.stream().filter(Producto::isNuevo).count(),
                "activos", productos.stream().filter(Producto::isActivo).count(),
                "stockBajo", productos.stream().filter(Producto::isStockBajo).count()
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
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