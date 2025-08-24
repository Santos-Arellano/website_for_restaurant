package restaurante.example.burgur.Model;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class AdicionalesPermiXProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // lado MANY-TO-ONE hacia Producto
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    @JsonIgnore // o @JsonBackReference
    private Producto producto;

    // lado MANY-TO-ONE hacia Adicional
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "adicional_id", nullable = false)
    @JsonIgnore // o @JsonBackReference
    private Adicional adicional;

    // Constructor vacío
    public AdicionalesPermiXProducto() {}

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public Adicional getAdicional() {
        return adicional;
    }

    public void setAdicional(Adicional adicional) {
        this.adicional = adicional;
    }

    



}
