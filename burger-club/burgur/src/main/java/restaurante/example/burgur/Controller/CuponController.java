package restaurante.example.burgur.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import restaurante.example.burgur.Model.Cupon;
import restaurante.example.burgur.Service.CuponService;

import java.util.List;

@RestController
@RequestMapping("/cupones")
public class CuponController {

    private final CuponService cuponService;

    public CuponController(CuponService cuponService) {
        this.cuponService = cuponService;
    }

    @GetMapping
    public ResponseEntity<List<Cupon>> listar() {
        return ResponseEntity.ok(cuponService.listar());
    }

    @PostMapping
    public ResponseEntity<Cupon> crear(@RequestBody Cupon cupon) {
        return ResponseEntity.ok(cuponService.crear(cupon));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cupon> actualizar(@PathVariable Long id, @RequestBody Cupon cupon) {
        return ResponseEntity.ok(cuponService.actualizar(id, cupon));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cuponService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}