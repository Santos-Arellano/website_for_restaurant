package restaurante.example.burgur.Controller;

import restaurante.example.burgur.Service.ProductoService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;



@RequestMapping("/menu")
@Controller
public class ProductoController {
    @Autowired
    ProductoService productoService;
    
    @GetMapping("")
    // Mostrar todos los productos en el sistema
    public String mostrarProductos(Model model) {
        model.addAttribute("productos", productoService.findAll());
        return "menu";
    }

    // Mostrar productos por nombre
    @GetMapping("/search")
    public String buscarProductos(@RequestParam("nombre") String nombre, Model model) {
        model.addAttribute("productos", productoService.findByNombre(nombre));
        return "menu";
    }

    // Mostrar productos por categoria
    @GetMapping("/category")
    public String buscarProductosPorCategoria(@RequestParam("categoria") String categoria, Model model) {
        model.addAttribute("productos", productoService.findByCategoria(categoria));
        return "menu";
    }

}
