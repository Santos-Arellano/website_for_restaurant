package restaurante.example.burgur.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class ProdYAdiPedido {
    @Id
    @GeneratedValue
    private Long id;
    private int cantidad;
    private float precioUnitario;

    //Relaciones BDD
    //1). Relación Pedido-ProdYAdiPedido (Uno a Muchos)
    @ManyToOne
    private Pedido pedido;

    //2). Relación ProdYAdiPedido- Producto (Muchos a Uno)
    @ManyToOne
    private Producto producto;

    // Constructor vacio
    public ProdYAdiPedido() {
    }
    // Constructor con parametros sin id y sin relaciones BDD
    public ProdYAdiPedido(int cantidad, float precioUnitario) {
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
    public float getPrecioUnitario() {
        return precioUnitario;
    }
    public void setPrecioUnitario(float precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
    public Pedido getPedido() {
        return pedido;
    }
    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }
    public Producto getProducto() {
        return producto;
    }
    public void setProducto(Producto producto) {
        this.producto = producto;
    }


    
}
