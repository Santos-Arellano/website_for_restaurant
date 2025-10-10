package restaurante.example.burgur.Model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

@Entity
public class Carrito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private boolean estado; // true = activo, false = inactivo
    private double precioTotal;

    //Relaciones BDD
    //1). Relación Pedido-Carrito (Uno a Uno)
    @OneToOne (mappedBy = "carrito", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Pedido pedido;

    //2). Relación Carrito-CarritoItem (Uno a Muchos)
    @OneToMany(mappedBy = "carrito", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CarritoItem> carritoItems;

    //3). Relación Carrito-Cliente (Muchos a Uno)
    @ManyToOne
    private Cliente cliente;

    // Constructor vacío
    public Carrito() {
    }

    // Constructor con parámetros sin id y sin relaciones BDD
    public Carrito(boolean estado) {
        this.estado = estado;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean getEstado() {
        return estado;
    }

    public void setEstado(boolean estado) {
        this.estado = estado;
    }

    public double getPrecioTotal() {
        return precioTotal;
    }

    public void setPrecioTotal(double precioTotal) {
        this.precioTotal = precioTotal;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public List<CarritoItem> getCarritoItems() {
        return carritoItems;
    }

    public void setCarritoItems(List<CarritoItem> carritoItems) {
        this.carritoItems = carritoItems;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

}
