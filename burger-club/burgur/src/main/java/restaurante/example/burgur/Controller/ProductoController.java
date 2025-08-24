package restaurante.example.burgur.Controller;

import restaurante.example.burgur.Model.Producto;
import restaurante.example.burgur.Service.ProductoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/menu")
public class ProductoController {
    
    @Autowired
    private ProductoService productoService;
    
    // ==========================================
    // PÁGINAS CLIENTE DEL MENÚ
    // ==========================================
    
    /**
     * Mostrar todos los productos en el menú principal
     */
    // http://localhost:8080/menu
    @GetMapping("")
    public String mostrarMenu(Model model) {
        try {
            List<Producto> productos = productoService.findAll();
            productoService.updateAdicionalesDeTodosLosProductos();
            model.addAttribute("productos", productos != null ? productos : List.of());
            return "menu";
        } catch (Exception e) {
            model.addAttribute("productos", List.of());
            model.addAttribute("error", "Error al cargar los productos");
            return "menu";
        }
    }

    /**
     * Búsqueda de productos por nombre
     */
    @GetMapping("/search")
    public String buscarProductos(@RequestParam(value = "nombre", required = false) String nombre, Model model) {
        try {
            List<Producto> productos;
            
            if (nombre == null || nombre.trim().isEmpty()) {
                productos = productoService.findAll();
            } else {
                productos = productoService.search(nombre.trim());
            }
            
            model.addAttribute("productos", productos != null ? productos : List.of());
            if (nombre != null && !nombre.trim().isEmpty()) {
                model.addAttribute("searchTerm", nombre.trim());
                model.addAttribute("resultCount", productos != null ? productos.size() : 0);
            }
            
            return "menu";
        } catch (Exception e) {
            model.addAttribute("productos", List.of());
            model.addAttribute("error", "Error en la búsqueda: " + e.getMessage());
            return "menu";
        }
    }

    /**
     * Filtrar productos por categoría
     */
    @GetMapping("/category")
    public String filtrarPorCategoria(@RequestParam(value = "categoria", required = false) String categoria, Model model) {
        try {
            List<Producto> productos;
            
            if (categoria == null || "todos".equalsIgnoreCase(categoria.trim())) {
                productos = productoService.findAll();
            } else {
                productos = productoService.findByCategoria(categoria.trim());
            }
            
            model.addAttribute("productos", productos != null ? productos : List.of());
            if (categoria != null && !categoria.trim().isEmpty() && !"todos".equalsIgnoreCase(categoria.trim())) {
                model.addAttribute("categoriaActual", categoria.trim());
                model.addAttribute("resultCount", productos != null ? productos.size() : 0);
            }
            
            return "menu";
        } catch (Exception e) {
            model.addAttribute("productos", List.of());
            model.addAttribute("error", "Error al filtrar por categoría: " + e.getMessage());
            return "menu";
        }
    }

    /**
     * 
    */
    
    // ==========================================
    // PANEL DE ADMINISTRACIÓN
    // ==========================================
    
    /**
     * Panel de administración de productos
     */
    // http://localhost:8080/menu/admin
    @GetMapping("/admin")
    public String adminDashboard(Model model) {
        try {
            List<Producto> productos = productoService.findAll();
            productos = productos != null ? productos : List.of();
            
            // Calcular estadísticas de forma segura
            long totalProductos = productos.size();
            long productosNuevos = productos.stream().filter(p -> p != null && p.isNuevo()).count();
            long productosActivos = productos.stream().filter(p -> p != null && p.isActivo()).count();
            long stockBajo = productos.stream().filter(p -> p != null && p.isStockBajo()).count();
            
            model.addAttribute("productos", productos);
            model.addAttribute("totalProductos", totalProductos);
            model.addAttribute("productosNuevos", productosNuevos);
            model.addAttribute("productosActivos", productosActivos);
            model.addAttribute("stockBajo", stockBajo);
            
            return "admin/admin-products";
        } catch (Exception e) {
            model.addAttribute("productos", List.of());
            model.addAttribute("error", "Error al cargar el panel de administración: " + e.getMessage());
            model.addAttribute("totalProductos", 0);
            model.addAttribute("productosNuevos", 0);
            model.addAttribute("productosActivos", 0);
            model.addAttribute("stockBajo", 0);
            return "admin/admin-products";
        }
    }

    /**
     * Dashboard con estadísticas generales (opcional)
     */
    // http://localhost:8080/menu/admin/dashboard (Aún no está implementado)
    @GetMapping("/admin/dashboard")
    public String dashboard(Model model) {
        try {
            // Estadísticas básicas
            long totalProductos = productoService.countTotal();
            long productosNuevos = productoService.countByNuevo();
            long productosPopulares = productoService.countByPopular();
            long stockBajo = productoService.countByStockBajo();
            
            model.addAttribute("totalProductos", totalProductos);
            model.addAttribute("productosNuevos", productosNuevos);
            model.addAttribute("productosPopulares", productosPopulares);
            model.addAttribute("stockBajo", stockBajo);
            
            return "admin/dashboard";
            
        } catch (Exception e) {
            System.err.println("Error en admin dashboard: " + e.getMessage());
            model.addAttribute("error", "Error al cargar las estadísticas");
            return "admin/dashboard";
        }
    }
    
    // ==========================================
    // API REST ENDPOINTS
    // ==========================================
    
    /**
     * API: Buscar productos (AJAX)
     */
    @GetMapping("/api/search")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> buscarProductosAPI(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String categoria) {
        
        try {
            List<Producto> productos = productoService.findAll();
            productos = productos != null ? productos : List.of();
            
            // Filtrar por término de búsqueda
            if (q != null && !q.trim().isEmpty()) {
                productos = productos.stream()
                    .filter(p -> p != null && (
                        (p.getNombre() != null && p.getNombre().toLowerCase().contains(q.toLowerCase())) ||
                        (p.getDescripcion() != null && p.getDescripcion().toLowerCase().contains(q.toLowerCase())) ||
                        (p.getIngredientes() != null && 
                         p.getIngredientes().stream().anyMatch(ing -> 
                             ing != null && ing.toLowerCase().contains(q.toLowerCase())))
                    ))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            // Filtrar por categoría
            if (categoria != null && !categoria.equalsIgnoreCase("todos")) {
                productos = productos.stream()
                    .filter(p -> p != null && p.getCategoria() != null && 
                                p.getCategoria().equalsIgnoreCase(categoria))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            Map<String, Object> response = Map.of(
                "success", true,
                "productos", productos,
                "total", productos.size(),
                "searchTerm", q != null ? q : "",
                "categoria", categoria != null ? categoria : "todos"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Error en la búsqueda: " + e.getMessage(),
                "productos", List.of(),
                "total", 0
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * API: Obtener todos los productos
     */
    @GetMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<List<Producto>> obtenerProductosAPI() {
        try {
            List<Producto> productos = productoService.findAll();
            return ResponseEntity.ok(productos != null ? productos : List.of());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * API: Obtener producto por ID
     */
    @GetMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Producto> obtenerProductoAPI(@PathVariable Long id) {
        try {
            Optional<Producto> producto = productoService.findById(id);
            
            if (producto.isPresent()) {
                return ResponseEntity.ok(producto.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * API: Filtrar productos por categoría
     */
    @GetMapping("/api/productos/categoria/{categoria}")
    @ResponseBody
    public ResponseEntity<List<Producto>> obtenerProductosPorCategoriaAPI(@PathVariable String categoria) {
        try {
            List<Producto> productos;
            
            if ("todos".equalsIgnoreCase(categoria)) {
                productos = productoService.findAll();
            } else {
                productos = productoService.findByCategoria(categoria);
            }
            
            return ResponseEntity.ok(productos != null ? productos : List.of());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * API: Crear nuevo producto
     */
    @PostMapping("/api/productos")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> crearProductoAPI(@RequestBody ProductoRequest request) {
        try {
            // Validar datos
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre es requerido");
            }
            
            if (request.getPrecio() == null || request.getPrecio() <= 0) {
                throw new IllegalArgumentException("El precio debe ser mayor a 0");
            }
            
            // Crear producto
            Producto producto = new Producto(
                request.getNombre(),
                request.getPrecio(),
                request.getDescripcion() != null ? request.getDescripcion() : "",
                request.getImgURL() != null ? request.getImgURL() : "/images/default-burger.png",
                request.getActivo() != null ? request.getActivo() : true,
                request.getCategoria() != null ? request.getCategoria() : "hamburguesa",
                request.getIngredientes() != null ? request.getIngredientes() : List.of(),
                request.getNuevo() != null ? request.getNuevo() : false,
                request.getStock() != null ? request.getStock() : 20,
                request.getPopular() != null ? request.getPopular() : false
            );
            
            Producto savedProducto = productoService.save(producto);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Producto creado correctamente",
                "producto", savedProducto
            );
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Error interno del servidor"
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * API: Actualizar producto
     */
    @PutMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> actualizarProductoAPI(
            @PathVariable Long id, 
            @RequestBody ProductoRequest request) {
        try {
            // Verificar que el producto existe
            Optional<Producto> productoExistente = productoService.findById(id);
            if (!productoExistente.isPresent()) {
                Map<String, Object> errorResponse = Map.of(
                    "success", false,
                    "message", "Producto no encontrado"
                );
                return ResponseEntity.notFound().build();
            }
            
            // Validar datos
            if (request.getNombre() == null || request.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre es requerido");
            }
            
            if (request.getPrecio() == null || request.getPrecio() <= 0) {
                throw new IllegalArgumentException("El precio debe ser mayor a 0");
            }
            
            // Actualizar producto
            Producto producto = productoExistente.get();
            producto.setNombre(request.getNombre());
            producto.setPrecio(request.getPrecio());
            producto.setDescripcion(request.getDescripcion() != null ? request.getDescripcion() : "");
            producto.setImgURL(request.getImgURL() != null ? request.getImgURL() : producto.getImgURL());
            producto.setActivo(request.getActivo() != null ? request.getActivo() : true);
            producto.setCategoria(request.getCategoria() != null ? request.getCategoria() : producto.getCategoria());
            producto.setIngredientes(request.getIngredientes() != null ? request.getIngredientes() : producto.getIngredientes());
            producto.setNuevo(request.getNuevo() != null ? request.getNuevo() : false);
            producto.setStock(request.getStock() != null ? request.getStock() : producto.getStock());
            producto.setPopular(request.getPopular() != null ? request.getPopular() : false);
            
            Producto updatedProducto = productoService.save(producto);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Producto actualizado correctamente",
                "producto", updatedProducto
            );
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Error interno del servidor"
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * API: Eliminar producto
     */
    @DeleteMapping("/api/productos/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> eliminarProductoAPI(@PathVariable Long id) {
        try {
            if (!productoService.existsById(id)) {
                Map<String, Object> errorResponse = Map.of(
                    "success", false,
                    "message", "Producto no encontrado"
                );
                return ResponseEntity.notFound().build();
            }
            
            productoService.deleteById(id);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Producto eliminado correctamente"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Error al eliminar el producto"
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * API: Obtener estadísticas del dashboard
     */
    @GetMapping("/api/estadisticas")
    @ResponseBody
    public ResponseEntity<DashboardStats> obtenerEstadisticasAPI() {
        try {
            List<Producto> productos = productoService.findAll();
            productos = productos != null ? productos : List.of();
            
            DashboardStats stats = new DashboardStats();
            stats.setTotalProductos(productos.size());
            stats.setProductosNuevos((int) productos.stream().filter(p -> p != null && p.isNuevo()).count());
            stats.setProductosActivos((int) productos.stream().filter(p -> p != null && p.isActivo()).count());
            stats.setProductosPopulares((int) productos.stream().filter(p -> p != null && p.isPopular()).count());
            stats.setProductosStockBajo((int) productos.stream().filter(p -> p != null && p.isStockBajo()).count());
            stats.setStockTotal(productos.stream().filter(p -> p != null && p.getStock() != null).mapToInt(Producto::getStock).sum());
            stats.setValorTotalInventario(
                productos.stream()
                    .filter(p -> p != null && p.getPrecio() > 0 && p.getStock() != null)
                    .mapToDouble(p -> p.getPrecio() * p.getStock())
                    .sum()
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // ==========================================
    // CLASES DE APOYO
    // ==========================================
    
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
        private Integer stock;
        private Boolean popular;

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
        
        public Integer getStock() { return stock; }
        public void setStock(Integer stock) { this.stock = stock; }
        
        public Boolean getPopular() { return popular; }
        public void setPopular(Boolean popular) { this.popular = popular; }
    }

    /**
     * Clase para estadísticas del dashboard
     */
    public static class DashboardStats {
        private int totalProductos;
        private int productosNuevos;
        private int productosActivos;
        private int productosPopulares;
        private int productosStockBajo;
        private int stockTotal;
        private double valorTotalInventario;

        // Getters y Setters
        public int getTotalProductos() { return totalProductos; }
        public void setTotalProductos(int totalProductos) { this.totalProductos = totalProductos; }

        public int getProductosNuevos() { return productosNuevos; }
        public void setProductosNuevos(int productosNuevos) { this.productosNuevos = productosNuevos; }

        public int getProductosActivos() { return productosActivos; }
        public void setProductosActivos(int productosActivos) { this.productosActivos = productosActivos; }
        
        public int getProductosPopulares() { return productosPopulares; }
        public void setProductosPopulares(int productosPopulares) { this.productosPopulares = productosPopulares; }

        public int getProductosStockBajo() { return productosStockBajo; }
        public void setProductosStockBajo(int productosStockBajo) { this.productosStockBajo = productosStockBajo; }
        
        public int getStockTotal() { return stockTotal; }
        public void setStockTotal(int stockTotal) { this.stockTotal = stockTotal; }

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