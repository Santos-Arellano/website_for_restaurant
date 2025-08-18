package restaurante.example.burgur.Entities;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Producto {
    private Integer id;
    private String nombre;
    private double precio;
    private String descripcion;
    private String imgURL;
    private boolean activo;
    private String categoria;
    private List<String> ingredientes;
    private boolean nuevo;
    private Integer stock; // Nueva propiedad para el stock
    private boolean popular; // Nueva propiedad para productos populares
    
    // Constructor adicional sin stock ni popular (para compatibilidad)
    public Producto(Integer id, String nombre, double precio, String descripcion, 
                   String imgURL, boolean activo, String categoria, 
                   List<String> ingredientes, boolean nuevo) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.descripcion = descripcion;
        this.imgURL = imgURL;
        this.activo = activo;
        this.categoria = categoria;
        this.ingredientes = ingredientes;
        this.nuevo = nuevo;
        this.stock = generarStockAleatorio(); // Stock aleatorio por defecto
        this.popular = false; // No popular por defecto
    }
    
    // Método auxiliar para generar stock aleatorio
    private Integer generarStockAleatorio() {
        return (int) (Math.random() * 50) + 1; // Entre 1 y 50
    }
    
    // Métodos de conveniencia para el estado del stock
    public boolean isStockBajo() {
        return stock != null && stock < 5;
    }
    
    public boolean isStockMedio() {
        return stock != null && stock >= 5 && stock < 15;
    }
    
    public boolean isStockAlto() {
        return stock != null && stock >= 15;
    }
    
    // Método para obtener la clase CSS del stock
    public String getStockCssClass() {
        if (isStockBajo()) return "stock-low";
        if (isStockMedio()) return "stock-medium";
        return "stock-high";
    }
    
    // Método para obtener el estado del producto como texto
    public String getEstadoTexto() {
        if (nuevo) return "NUEVO";
        if (popular) return "POPULAR";
        return "ACTIVO";
    }
    
    // Método para obtener la clase CSS del estado
    public String getEstadoCssClass() {
        if (nuevo) return "status--nuevo";
        if (popular) return "status--popular";
        return "status--activo";
    }
}