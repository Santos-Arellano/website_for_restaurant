package restaurante.example.burgur.Model;

import java.util.Date;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;

@Entity
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date fechaCreacion;
    private Date fechaEntrega;
    private String estado;
    private Float precioTotal;

    //Relaciones BDD
    //1). Relación Pedido - Cliente (Muchos a 1)
    @ManyToOne
    private Cliente cliente;

    //2). Relación Pedido - Domiciliario (1 a 1)
    @ManyToOne
    private Domiciliario domiciliario;

    //3). Relación Pedido - Operador (muchos a 1)
    @ManyToOne
    private Operador operador;

    //4). Relación Pedido - ProdYAdiPedido (1 a muchos)
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProdYAdiPedido> productosYAdicionales;

    //5). Relación Pedido - Carrito (1 a 1)
    @OneToOne(mappedBy = "pedido")
    private Carrito carrito;

    // Constructor vacío
    public Pedido() {
    }

    // Constructor con parámetros sin id y sin relaciones BDD
    public Pedido(Date fechaCreacion, Date fechaEntrega, String estado, Float precioTotal) {
        this.fechaCreacion = fechaCreacion;
        this.fechaEntrega = fechaEntrega;
        this.estado = estado;
        this.precioTotal = precioTotal;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Date getFechaCreacion() {
        return fechaCreacion;
    }
    public void setFechaCreacion(Date fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    public Date getFechaEntrega() {
        return fechaEntrega;
    }
    public void setFechaEntrega(Date fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }
    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }
    public Float getPrecioTotal() {
        return precioTotal;
    }
    public void setPrecioTotal(Float precioTotal) {
        this.precioTotal = precioTotal;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Domiciliario getDomiciliario() {
        return domiciliario;
    }

    public void setDomiciliario(Domiciliario domiciliario) {
        this.domiciliario = domiciliario;
    }

    public Operador getOperador() {
        return operador;
    }

    public void setOperador(Operador operador) {
        this.operador = operador;
    }

    


    
}
