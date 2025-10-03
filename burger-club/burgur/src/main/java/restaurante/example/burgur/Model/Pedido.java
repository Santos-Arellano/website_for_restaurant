package restaurante.example.burgur.Model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEntrega;
    private String estado;

    //Relaciones BDD
    //1). Relación Pedido - Carrito (1 a 1)
    @OneToOne
    @JoinColumn(name = "carrito_id", unique = true, nullable = true)
    private Carrito carrito;

    //2). Relación Pedido - Domiciliario (Muchos a 1)
    @ManyToOne
    @JsonIgnore
    private Domiciliario domiciliario;

    //3). Relación Pedido - Operador (Muchos a 1)
    @ManyToOne
    @JsonIgnore
    private Operador operador;

    // Constructor vacío
    public Pedido() {
    }

    // Constructor con parámetros sin id y sin relaciones BDD
    public Pedido(LocalDateTime fechaCreacion, LocalDateTime fechaEntrega, String estado) {
        this.fechaCreacion = fechaCreacion;
        this.fechaEntrega = fechaEntrega;
        this.estado = estado;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    public LocalDateTime getFechaEntrega() {
        return fechaEntrega;
    }
    public void setFechaEntrega(LocalDateTime fechaEntrega) {
        this.fechaEntrega = fechaEntrega;
    }
    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public Carrito getCarrito() {
        return carrito;
    }

    public void setCarrito(Carrito carrito) {
        this.carrito = carrito;
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
