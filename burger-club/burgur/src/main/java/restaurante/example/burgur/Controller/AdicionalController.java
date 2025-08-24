package restaurante.example.burgur.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import restaurante.example.burgur.Model.Adicional;
import restaurante.example.burgur.Service.AdicionalService;
import restaurante.example.burgur.Service.ProductoService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/adicional")
public class AdicionalController {

    @Autowired
    private AdicionalService adicionalService;
    @Autowired
    private ProductoService productoService;

    // ==========================================
    // CRUD ADICIONALES
    // ==========================================
    // Crear Adicional
    @PostMapping("/crear")
    public ResponseEntity<?> crearAdicional(@RequestBody Adicional nuevoAdicional) {
        try {
            Adicional adicionalCreado = adicionalService.save(nuevoAdicional);
            productoService.updateAdicionalesDeTodosLosProductos(); // Actualización de los adicionales permitidos a cada producto
            return ResponseEntity.status(HttpStatus.CREATED).body(adicionalCreado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Actualizar Adicional
    @PutMapping("/actualizar/{id}")
    public ResponseEntity<?> actualizarAdicional(@RequestBody Adicional adicionalActualizado, @PathVariable Long id) {
        try {
            adicionalActualizado.setId(id);
            Adicional adicional = adicionalService.save(adicionalActualizado);
            productoService.rebuildAdicionalesDeTodosLosProductos(); // Rebuild de los adicionales permitidos a cada producto
            return ResponseEntity.status(HttpStatus.OK).body(adicional);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Borrar Adicional
    @DeleteMapping("/borrar/{id}")
    public ResponseEntity<?> borrarAdicional(@PathVariable Long id) {
        try {
            adicionalService.delete(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build(); 
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Buscar Adicional por ID
    @GetMapping("/buscar")
    public ResponseEntity<?> buscarAdicional(@RequestParam Long id) {
        try {
            Adicional adicional = adicionalService.findById(id);
            return ResponseEntity.status(HttpStatus.OK).body(adicional);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Buscar todos los Adicionales en el sistema
    @GetMapping("/buscar/todos")
    public ResponseEntity<?> buscarTodosLosAdicionales() {
        try {
            List<Adicional> adicionales = adicionalService.findAll();
            // Si no hay adicionales se devuelve una lista vacía (PENDIENTE CUADRAR QUE SALE SI NO HAY)
            return ResponseEntity.status(HttpStatus.OK).body(adicionales);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }



}   
