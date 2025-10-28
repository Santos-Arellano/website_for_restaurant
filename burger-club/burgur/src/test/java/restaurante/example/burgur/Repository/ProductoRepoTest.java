package restaurante.example.burgur.Repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import restaurante.example.burgur.Model.Producto;

@DataJpaTest
public class ProductoRepoTest { 
    
    @Autowired
    private ProductoRepository productoRepository;
    
    private Producto producto1;
    private Producto producto2;
    private Producto producto3;
    
    @BeforeEach
    void setUp() {
   
        
        // Inicializar productos de prueba
        producto1 = new Producto();
        producto1.setNombre("Hamburguesa Clásica");
        producto1.setDescripcion("Deliciosa hamburguesa con carne, lechuga y tomate");
        producto1.setPrecio(15000.0);
        producto1.setCategoria("Hamburguesas");
        producto1.setImgURL("/images/hamburguesa-clasica.jpg");
        producto1.setStock(50);
        producto1.setNuevo(false);
        producto1.setPopular(true);
        producto1.setActivo(true);
        List<String> ingredientes1 = new ArrayList<>();
        ingredientes1.add("Carne");
        ingredientes1.add("Lechuga");
        ingredientes1.add("Tomate");
        producto1.setIngredientes(ingredientes1);
        
        producto2 = new Producto();
        producto2.setNombre("Papas Fritas");
        producto2.setDescripcion("Papas fritas crujientes");
        producto2.setPrecio(8000.0);
        producto2.setCategoria("Acompañamientos");
        producto2.setImgURL("/images/papas-fritas.jpg");
        producto2.setStock(100);
        producto2.setNuevo(true);
        producto2.setPopular(false);
        producto2.setActivo(true);
        List<String> ingredientes2 = new ArrayList<>();
        ingredientes2.add("Papas");
        ingredientes2.add("Sal");
        producto2.setIngredientes(ingredientes2);
        
        producto3 = new Producto();
        producto3.setNombre("Refresco Cola");
        producto3.setDescripcion("Bebida refrescante");
        producto3.setPrecio(5000.0);
        producto3.setCategoria("Bebidas");
        producto3.setImgURL("/images/refresco.jpg");
        producto3.setStock(5);
        producto3.setNuevo(false);
        producto3.setPopular(true);
        producto3.setActivo(false);
        List<String> ingredientes3 = new ArrayList<>();
        ingredientes3.add("Agua carbonatada");
        ingredientes3.add("Azúcar");
        producto3.setIngredientes(ingredientes3);
    }
    
    @Test
    void productoRepository_save_productoGuardado() {
        // Act - Guardar el producto
        Producto productoGuardado = productoRepository.save(producto1);
        
        // Assert - Verificar que se guardó correctamente
        assertThat(productoGuardado).isNotNull();
        assertThat(productoGuardado.getId()).isNotNull();
        assertThat(productoGuardado.getNombre()).isEqualTo("Hamburguesa Clásica");
        assertThat(productoGuardado.getPrecio()).isEqualTo(15000.0);
        assertThat(productoGuardado.getCategoria()).isEqualTo("Hamburguesas");
        assertThat(productoGuardado.getStock()).isEqualTo(50);
        assertThat(productoGuardado.isPopular()).isTrue();
        assertThat(productoGuardado.isActivo()).isTrue();
    }
    
    @Test
    void productoRepository_save_productoActualizado() {
        // Arrange - Guardar producto inicial
        Producto productoGuardado = productoRepository.save(producto1);
        Long id = productoGuardado.getId();
        
        // Act - Actualizar el producto
        productoGuardado.setNombre("Hamburguesa Premium");
        productoGuardado.setPrecio(20000.0);
        productoGuardado.setStock(30);
        Producto productoActualizado = productoRepository.save(productoGuardado);
        
        // Assert - Verificar que se actualizó correctamente
        assertThat(productoActualizado.getId()).isEqualTo(id);
        assertThat(productoActualizado.getNombre()).isEqualTo("Hamburguesa Premium");
        assertThat(productoActualizado.getPrecio()).isEqualTo(20000.0);
        assertThat(productoActualizado.getStock()).isEqualTo(30);
    }
    
    @Test
    void productoRepository_findAll_todosLosProductos() {
        // Arrange - Guardar varios productos
        productoRepository.save(producto1);
        productoRepository.save(producto2);
        productoRepository.save(producto3);
        
        // Act - Obtener todos los productos
        List<Producto> productos = productoRepository.findAll();
        
        // Assert - Verificar que se obtuvieron todos
        assertThat(productos).isNotNull();
        assertThat(productos).hasSize(3);
        assertThat(productos).extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("Hamburguesa Clásica", "Papas Fritas", "Refresco Cola");
    }
    
    @Test
    void productoRepository_findAll_listaVacia() {
        // Act - Obtener todos los productos sin haber guardado ninguno
        List<Producto> productos = productoRepository.findAll();
        
        // Assert - Verificar que la lista está vacía
        assertThat(productos).isNotNull();
        assertThat(productos).isEmpty();
    }
    
    @Test
    void productoRepository_findById_productoEncontrado() {
        // Arrange - Guardar un producto
        Producto productoGuardado = productoRepository.save(producto1);
        Long id = productoGuardado.getId();
        
        // Act - Buscar el producto por ID
        Optional<Producto> productoEncontrado = productoRepository.findById(id);
        
        // Assert - Verificar que se encontró el producto
        assertThat(productoEncontrado).isPresent();
        assertThat(productoEncontrado.get().getId()).isEqualTo(id);
        assertThat(productoEncontrado.get().getNombre()).isEqualTo("Hamburguesa Clásica");
        assertThat(productoEncontrado.get().getPrecio()).isEqualTo(15000.0);
    }
    
    @Test
    void productoRepository_findById_optionalVacio() {
        // Act - Buscar un producto con ID que no existe
        Optional<Producto> productoEncontrado = productoRepository.findById(999L);
        
        // Assert - Verificar que no se encontró
        assertThat(productoEncontrado).isNotPresent();
    }
    
    @Test
    void productoRepository_delete_productoEliminado() {
        // Arrange - Guardar un producto
        Producto productoGuardado = productoRepository.save(producto1);
        Long id = productoGuardado.getId();
        
        // Act - Eliminar el producto
        productoRepository.delete(productoGuardado);
        
        // Assert - Verificar que se eliminó
        Optional<Producto> productoEliminado = productoRepository.findById(id);
        assertThat(productoEliminado).isNotPresent();
    }
    
    @Test
    void productoRepository_delete_otrosProductosIntactos() {
        // Arrange - Guardar varios productos
        Producto p1 = productoRepository.save(producto1);
        Producto p2 = productoRepository.save(producto2);
        Producto p3 = productoRepository.save(producto3);
        
        // Act - Eliminar solo el producto 2
        productoRepository.delete(p2);
        
        // Assert - Verificar que los otros productos siguen existiendo
        assertThat(productoRepository.findById(p1.getId())).isPresent();
        assertThat(productoRepository.findById(p2.getId())).isNotPresent();
        assertThat(productoRepository.findById(p3.getId())).isPresent();
        assertThat(productoRepository.findAll()).hasSize(2);
    }
    
    @Test
    void productoRepository_deleteAll_todosLosProductosEliminados() {
        // Arrange - Guardar varios productos
        productoRepository.save(producto1);
        productoRepository.save(producto2);
        productoRepository.save(producto3);
        
        // Act - Eliminar todos los productos
        productoRepository.deleteAll();
        
        // Assert - Verificar que no hay productos
        List<Producto> productos = productoRepository.findAll();
        assertThat(productos).isEmpty();
    }

    // ==========================================
    // PRUEBAS CONSULTAS HECHAS POR NOSOTROS
    // ==========================================
    @Test
    void productoRepository_getCategoriaCount_conteoPorCategoria() {
        // Arrange - Guardar productos de diferentes categorías
        productoRepository.save(producto1); // Hamburguesas
        productoRepository.save(producto2); // Acompañamientos
        productoRepository.save(producto3); // Bebidas
        
        // Crear otro producto de Hamburguesas
        Producto producto4 = new Producto();
        producto4.setNombre("Hamburguesa Premium");
        producto4.setCategoria("Hamburguesas");
        producto4.setPrecio(20000.0);
        producto4.setStock(30);
        productoRepository.save(producto4);
        
        // Act - Obtener conteo por categoría
        List<Object[]> categoriaCount = productoRepository.getCategoriaCount();
        
        // Assert - Verificar el conteo
        assertThat(categoriaCount).isNotNull();
        // Pq hay 3 categorías distintas: Hamburguesas, Acompañamientos, Bebidas
        assertThat(categoriaCount).hasSize(3);
        
        // Verificar que cada categoría tiene el conteo correcto
        boolean hamburguesasEncontrada = false;
        boolean acompanamientosEncontrada = false;
        boolean bebidasEncontrada = false;
        
        for (Object[] row : categoriaCount) {
            String categoria = (String) row[0];
            Long count = (Long) row[1];
            
            if (categoria.equals("Hamburguesas")) {
                assertThat(count).isEqualTo(2L);
                hamburguesasEncontrada = true;
            } else if (categoria.equals("Acompañamientos")) {
                assertThat(count).isEqualTo(1L);
                acompanamientosEncontrada = true;
            } else if (categoria.equals("Bebidas")) {
                assertThat(count).isEqualTo(1L);
                bebidasEncontrada = true;
            }
        }
        
        assertThat(hamburguesasEncontrada).isTrue();
        assertThat(acompanamientosEncontrada).isTrue();
        assertThat(bebidasEncontrada).isTrue();
    }
    
    @Test
    void productoRepository_getCategoriaCount_listaVaciaSinProductos() {
        // Act - Obtener conteo sin productos guardados
        List<Object[]> categoriaCount = productoRepository.getCategoriaCount();
        
        // Assert - Verificar que la lista está vacía
        assertThat(categoriaCount).isNotNull();
        assertThat(categoriaCount).isEmpty();
    }
    
    @Test
    void productoRepository_findProductosConStockMinimo_unProductoConStockMinimo() {
        // Arrange - Guardar productos con diferentes stocks
        productoRepository.save(producto1); // stock = 50
        productoRepository.save(producto2); // stock = 100
        productoRepository.save(producto3); // stock = 5 (mínimo)
        
        // Act - Obtener productos con stock mínimo
        List<Producto> productosMinStock = productoRepository.findProductosConStockMinimo();
        
        // Assert - Verificar que se encontró el producto con stock mínimo
        assertThat(productosMinStock).isNotNull();
        assertThat(productosMinStock).hasSize(1);
        assertThat(productosMinStock.get(0).getNombre()).isEqualTo("Refresco Cola");
        assertThat(productosMinStock.get(0).getStock()).isEqualTo(5);
    }
    
    @Test
    void productoRepository_findProductosConStockMinimo_variosProductosConMismoStockMinimo() {
        // Arrange - Guardar productos donde varios tienen el stock mínimo
        productoRepository.save(producto1); // stock = 50
        productoRepository.save(producto2); // stock = 100
        productoRepository.save(producto3); // stock = 5 (mínimo)
        
        // Crear otro producto con stock mínimo igual
        Producto producto4 = new Producto();
        producto4.setNombre("Agua Mineral");
        producto4.setCategoria("Bebidas");
        producto4.setPrecio(3000.0);
        producto4.setStock(5); // Mismo stock mínimo
        productoRepository.save(producto4);
        
        // Act - Obtener productos con stock mínimo
        List<Producto> productosMinStock = productoRepository.findProductosConStockMinimo();
        
        // Assert - Verificar que se encontraron ambos productos
        assertThat(productosMinStock).isNotNull();
        assertThat(productosMinStock).hasSize(2);
        assertThat(productosMinStock).extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("Refresco Cola", "Agua Mineral");
        assertThat(productosMinStock).allMatch(p -> p.getStock() == 5);
    }
    
    @Test
    void productoRepository_findProductosConStockMaximo_unProductoConStockMaximo() {
        // Arrange - Guardar productos con diferentes stocks
        productoRepository.save(producto1); // stock = 50
        productoRepository.save(producto2); // stock = 100 (máximo)
        productoRepository.save(producto3); // stock = 5
        
        // Act - Obtener productos con stock máximo
        List<Producto> productosMaxStock = productoRepository.findProductosConStockMaximo();
        
        // Assert - Verificar que se encontró el producto con stock máximo
        assertThat(productosMaxStock).isNotNull();
        assertThat(productosMaxStock).hasSize(1);
        assertThat(productosMaxStock.get(0).getNombre()).isEqualTo("Papas Fritas");
        assertThat(productosMaxStock.get(0).getStock()).isEqualTo(100);
    }
    
    @Test
    void productoRepository_findProductosConStockMaximo_variosProductosConMismoStockMaximo() {
        // Arrange - Guardar productos donde varios tienen el stock máximo
        productoRepository.save(producto1); // stock = 50
        productoRepository.save(producto2); // stock = 100 (máximo)
        productoRepository.save(producto3); // stock = 5
        
        // Crear otro producto con stock máximo igual
        Producto producto4 = new Producto();
        producto4.setNombre("Nuggets de Pollo");
        producto4.setCategoria("Acompañamientos");
        producto4.setPrecio(12000.0);
        producto4.setStock(100); // Mismo stock máximo
        productoRepository.save(producto4);
        
        // Act - Obtener productos con stock máximo
        List<Producto> productosMaxStock = productoRepository.findProductosConStockMaximo();
        
        // Assert - Verificar que se encontraron ambos productos
        assertThat(productosMaxStock).isNotNull();
        assertThat(productosMaxStock).hasSize(2);
        assertThat(productosMaxStock).extracting(Producto::getNombre)
            .containsExactlyInAnyOrder("Papas Fritas", "Nuggets de Pollo");
        assertThat(productosMaxStock).allMatch(p -> p.getStock() == 100);
    }
    
}
