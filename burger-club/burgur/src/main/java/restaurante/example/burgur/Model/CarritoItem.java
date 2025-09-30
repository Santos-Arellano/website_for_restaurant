package restaurante.example.burgur.Model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class CarritoItem {
    @Id
    @GeneratedValue
    private Long id;
    private int cantidad;
    private double precioUnitario;

    //Relaciones BDD
    //1). Relación ProdYAdiPedido-Carrito (Muchos a Uno)
    @ManyToOne
    @JsonIgnore
    private Carrito carrito;

    //2). Relación ProdYAdiPedido- Producto (Muchos a Uno)
    @ManyToOne
    @JsonIgnore
    private Producto producto;

    //3). Relación CarritoItem- AdiXProdPedido (Uno a Muchos)
    @OneToMany(mappedBy = "carritoItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdiXItemCarrito> adicionalesPorProducto;
    
    // Constructor vacio
    public CarritoItem() {
    }
    // Constructor con parametros sin id y sin relaciones BDD
    public CarritoItem(int cantidad, float precioUnitario) {
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public int getCantidad() {
        return cantidad;
    }
    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
    public double getPrecioUnitario() {
        return precioUnitario;
    }
    public void setPrecioUnitario(double precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
    public Carrito getCarrito() {
        return carrito;
    }
    public void setCarrito(Carrito carrito) {
        this.carrito = carrito;
    }
    public Producto getProducto() {
        return producto;
    }
    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public List<AdiXItemCarrito> getAdicionalesPorProducto() {
        return adicionalesPorProducto;
    }

    public void setAdicionalesPorProducto(List<AdiXItemCarrito> adicionalesPorProducto) {
        this.adicionalesPorProducto = adicionalesPorProducto;
    }


    
}
