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
}
