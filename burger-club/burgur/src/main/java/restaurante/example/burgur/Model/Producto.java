package restaurante.example.burgur.Model;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Producto {
    @Id
    @GeneratedValue
    private Long id;
    private String nombre;
    private double precio;
    private String descripcion;
    private String imgURL;
    private boolean activo;
    private String categoria;
    private List<String> ingredientes;
    private boolean nuevo;
    private Integer stock;
    private boolean popular;

    // Relaciones BDD
     @OneToMany(
        mappedBy = "producto",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @JsonIgnore
    private List<AdicionalesPermiXProducto> adicionales = new ArrayList<>();

    // Constructor sin id:
    public Producto(String nombre, double precio, String descripcion, String imgURL,
                    boolean activo, String categoria, List<String> ingredientes,
                    boolean nuevo, Integer stock, boolean popular) {
        this.nombre = nombre;
        this.precio = precio;
        this.descripcion = descripcion;
        this.imgURL = imgURL;
        this.activo = activo;
        this.categoria = categoria;
        this.ingredientes = ingredientes;
        this.nuevo = nuevo;
        this.stock = stock;
        this.popular = false;
    }

    // Constructor sin parametros
    public Producto() {
        this.stock = generarStockAleatorio();
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

    
    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getPrecio() {
        return precio;
    }

    public void setPrecio(double precio) {
        this.precio = precio;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImgURL() {
        return imgURL;
    }

    public void setImgURL(String imgURL) {
        this.imgURL = imgURL;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public List<String> getIngredientes() {
        return ingredientes;
    }

    public void setIngredientes(List<String> ingredientes) {
        this.ingredientes = ingredientes;
    }

    public boolean isNuevo() {
        return nuevo;
    }

    public void setNuevo(boolean nuevo) {
        this.nuevo = nuevo;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public boolean isPopular() {
        return popular;
    }

    public void setPopular(boolean popular) {
        this.popular = popular;
    }

    public List<AdicionalesPermiXProducto> getAdicionales() {
        return adicionales;
    }

    public void setAdicionales(List<AdicionalesPermiXProducto> adicionales) {
        this.adicionales = adicionales;
    }

    

    




}