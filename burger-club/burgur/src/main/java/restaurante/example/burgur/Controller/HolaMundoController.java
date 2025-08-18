package restaurante.example.burgur.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HolaMundoController {

    @GetMapping("/")
    public String index() {
        return "index";   // templates/index.html
    }
    
    // ELIMINAMOS la redirección /admin porque ya la maneja AdminController
    // El AdminController maneja "/admin" con @RequestMapping("/admin") + @GetMapping("")
}