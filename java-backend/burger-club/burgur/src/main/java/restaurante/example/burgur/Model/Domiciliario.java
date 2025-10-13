package restaurante.example.burgur.Model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Domiciliario {
    @Id
    @GeneratedValue
    private Long id;
    private String nombre;
    private String cedula;
    private boolean disponible;

    //Relaciones BDD
    //1). Relación Domiciliario - Operador (Muchos a 1)
    @ManyToOne
    @JsonIgnore
    private Operador operador;

    //2). Relación Pedido - Domiciliario (Many a 1)
    @OneToMany(mappedBy = "domiciliario")
    private List<Pedido> pedidos = new ArrayList<>();

    // Constructor vacío
    public Domiciliario() {
    }

    // Constructor con parámetros sin id y sin relaciones BDD
    public Domiciliario(String nombre, String cedula, boolean disponible) {
        this.nombre = nombre;
        this.cedula = cedula;
        this.disponible = disponible;
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

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public Operador getOperador() {
        return operador;
    }

    public void setOperador(Operador operador) {
        this.operador = operador;
    }


    
    
}
