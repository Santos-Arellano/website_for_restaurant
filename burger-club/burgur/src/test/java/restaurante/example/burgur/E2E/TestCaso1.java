package restaurante.example.burgur.E2E;

import java.time.Duration;
import java.util.List;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import io.github.bonigarcia.wdm.WebDriverManager;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class TestCaso1 {
    private WebDriver driver;
    private WebDriverWait wait; 
    private final String BASE_URL = "http://localhost:4200/";
    
    @BeforeEach
    public void setup() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("--disable-notifications");
        chromeOptions.addArguments("--disable-extensions");

        this.driver = new ChromeDriver(chromeOptions);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @Test
    public void testCaso1() {
        //0). Inicio de Sesión como Administrador Fallido
        driver.get(BASE_URL + "login");

        String xPatUsuario= "//*[@id=\"loginEmail\"]";
        String xPatPassword= "//*[@id=\"loginPassword\"]";
        String xPatLoginButton = "/html/body/app-root/div/main/app-auth/div/div/form/button";
 
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatLoginButton)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatUsuario)  ).sendKeys("admin@gmail.com");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatPassword)  ).sendKeys("admin123");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatLoginButton) ).click();
        // Esperar a que desaparezca el toast "mensajes de confirmación" si está presente
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(org.openqa.selenium.By.cssSelector("div.toast")));
        } catch (Exception e) {
            // Si no hay toast, continuar
        }

        // Validación de que el login fue fallido
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatLoginButton)));
        Assertions.assertThat(driver.getCurrentUrl()).isEqualTo(BASE_URL + "login");

        //1). Inicio de Sesión como Administrador
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatLoginButton)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatUsuario)  ).clear();
        driver.findElement(  org.openqa.selenium.By.xpath(xPatUsuario)  ).sendKeys("admin@burgerclub.com");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatPassword)  ).clear();
        driver.findElement(  org.openqa.selenium.By.xpath(xPatPassword)  ).sendKeys("admin123");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatLoginButton) ).click();

        // Esperar a que desaparezca el toast "mensajes de confirmación" si está presente
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(org.openqa.selenium.By.cssSelector("div.toast")));
        } catch (Exception e) {
            // Si no hay toast, continuar
        }

        //2). Ir a la sección de Adicionales
        String xPatAdicionalesNavLink = "//html//body//app-root//div//app-admin-header//header//div//nav//ul//li[3]//a";
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatAdicionalesNavLink)));

        // Validación de que el login fue exitoso
        Assertions.assertThat(driver.getCurrentUrl()).isEqualTo(BASE_URL + "admin");

        driver.findElement(  org.openqa.selenium.By.xpath(xPatAdicionalesNavLink) ).click();

        //3). Crear el primer adicional
        // Obtener la cantidad inicial de adicionales
        String xPatCantAdiNumero = "/html/body/app-root/div/main/app-admin-adicionales/main/div/div[1]/div[2]/div/span[1]";
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatCantAdiNumero)));
        WebElement cantAdiElemento = driver.findElement(  org.openqa.selenium.By.xpath(xPatCantAdiNumero) );
        String cantAdiTexto = cantAdiElemento.getText();
        int cantAdiInicial = Integer.parseInt(cantAdiTexto);

        // Crear el primer adicional
        String xPatCrearAdicionalButton = "/html/body/app-root/div/main/app-admin-adicionales/main/div/div[2]/div[2]/button";
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatCrearAdicionalButton)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatCrearAdicionalButton) ).click();

        String xPatNombreInput = "//*[@id=\"nombre\"]";
        String xPatPrecioInput = "//*[@id=\"precio\"]";
        String xPatCategoriaSelect = "/html/body/app-root/div/main/app-admin-adicionales/div/div/form/div[3]/div/label[4]";
        String xPatBtnGuardarAdi = "/html/body/app-root/div/main/app-admin-adicionales/div/div/form/div[5]/button[2]";

        driver.findElement(  org.openqa.selenium.By.xpath(xPatNombreInput) ).sendKeys("AdicionalPrueba1");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatPrecioInput) ).sendKeys("500");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatCategoriaSelect) ).click();
        driver.findElement(  org.openqa.selenium.By.xpath(xPatBtnGuardarAdi) ).click();

        //Validar que el adicional fue creado exitosamente
        // Esperar a que el contador se actualice (el texto cambie del valor inicial)
        wait.until(ExpectedConditions.not(
            ExpectedConditions.textToBe(org.openqa.selenium.By.xpath(xPatCantAdiNumero), String.valueOf(cantAdiInicial))
        ));
        
        WebElement cantAdiNuevaElemento = driver.findElement(org.openqa.selenium.By.xpath(xPatCantAdiNumero));
        String cantAdiNuevaTexto = cantAdiNuevaElemento.getText();
        int cantAdiNueva = Integer.parseInt(cantAdiNuevaTexto);
        Assertions.assertThat(cantAdiNueva).isEqualTo(cantAdiInicial + 1);

        //4). Crear el segundo adicional
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatCrearAdicionalButton)));

        // Esperar a que desaparezca el toast "mensajes de confirmación" si está presente
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(org.openqa.selenium.By.cssSelector("div.toast")));
        } catch (Exception e) {
            // Si no hay toast, continuar
        }

        driver.findElement(  org.openqa.selenium.By.xpath(xPatCrearAdicionalButton) ).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatNombreInput)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatNombreInput) ).sendKeys("AdicionalPrueba2");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatPrecioInput) ).sendKeys("600");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatCategoriaSelect) ).click();
        //driver.findElement(  org.openqa.selenium.By.xpath(xPatBtnActivarAdi) ).click();
        driver.findElement(  org.openqa.selenium.By.xpath(xPatBtnGuardarAdi) ).click();
        
        // Esperar a que desaparezca el toast "mensajes de confirmación" si está presente
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(org.openqa.selenium.By.cssSelector("div.toast")));
        } catch (Exception e) {
            // Si no hay toast, continuar
        }

        //Validar que el adicional fue creado exitosamente
        // Esperar a que el contador se actualice (el texto cambie del valor inicial)
        wait.until(ExpectedConditions.not(
            ExpectedConditions.textToBe(org.openqa.selenium.By.xpath(xPatCantAdiNumero), String.valueOf(cantAdiInicial+1))
        ));
        
        cantAdiNuevaElemento = driver.findElement(org.openqa.selenium.By.xpath(xPatCantAdiNumero));
        cantAdiNuevaTexto = cantAdiNuevaElemento.getText();
        cantAdiNueva = Integer.parseInt(cantAdiNuevaTexto);
        Assertions.assertThat(cantAdiNueva).isEqualTo(cantAdiInicial + 2);


        // 5). Va a la sección de productos
        String xPatProductosNavLink = "/html/body/app-root/div/app-admin-header/header/div/nav/ul/li[2]/a";
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatProductosNavLink)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatProductosNavLink) ).click();

        //6). Agrega Nuevo Producto (Malteada de Oreo)
        String xPatAgregarProductoButton = "/html/body/app-root/div/main/app-admin-products/section/div/div[3]/div/div[2]/button";
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatAgregarProductoButton)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatAgregarProductoButton) ).click();

        String xPatNombreProductoInput = "//*[@id=\"nombre\"]";
        String xPatDescripcionProductoInput = "//*[@id=\"descripcion\"]";
        String xPatPrecioProductoInput = "//*[@id=\"precio\"]";
        String xPatCategoriaProductoSelect = "//*[@id=\"categoria\"]";
        String xPatUrlImagenProductoInput = "//*[@id=\"imagen\"]";
        String xPatBtnGuardarProducto = "/html/body/app-root/div/main/app-admin-products/div/div/div[2]/form/div[6]/button[2]";

        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatNombreProductoInput)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatNombreProductoInput) ).sendKeys("Malteada de Oreo");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatDescripcionProductoInput) ).sendKeys("Deliciosa malteada sabor Oreo con crema batida y jarabe de chocolate.");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatPrecioProductoInput) ).sendKeys("12000");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatCategoriaProductoSelect) ).sendKeys("Bebida");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatUrlImagenProductoInput) ).sendKeys("https://example.com/malteada-oreo.jpg");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatBtnGuardarProducto) ).click();

        // Esperar a que desaparezca el toast "mensajes de confirmación" si está presente
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(org.openqa.selenium.By.cssSelector("div.toast")));
        } catch (Exception e) {
            // Si no hay toast, continuar
        }

        String pestanaAdminProductos = driver.getWindowHandle();

        //7). Ver desde otra pestaña el producto creado (Vista Cliente)
        driver.switchTo().newWindow(WindowType.TAB);
        driver.get("http://localhost:4200/" + "menu");

        String xPatProductoCreado = "//*[@id=\"menuGrid\"]/article[41]/div[2]";
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatProductoCreado)));
        driver.findElement(org.openqa.selenium.By.xpath(xPatProductoCreado)).click();

        
        //8). Verificar que este nuevo producto tenga los dos adicionales creados previamente
        String xPatCerrarInfoProductoNuevo = "/html/body/app-root/div/main/app-product-detail/div/div/button/i";
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatCerrarInfoProductoNuevo)));

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("monitoreoCantAdi")));
        List<WebElement> monitoreoCantAdicionales = driver.findElements(By.className("monitoreoCantAdi"));
        Assertions.assertThat(monitoreoCantAdicionales.size()).isEqualTo(2);

        driver.findElement(org.openqa.selenium.By.xpath(xPatCerrarInfoProductoNuevo)).click();

        String pestanaMenu = driver.getWindowHandle();

        
        //9). Me vuelvo a la pestaña de administración y me meto a la sección de adicionales
        driver.switchTo().window(pestanaAdminProductos);
        driver.findElement(  org.openqa.selenium.By.xpath(xPatAdicionalesNavLink) ).click();

        
        //10). Creo un tercer adicional para la categoría bebida
         wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatCrearAdicionalButton)));
        
        // Esperar a que desaparezca el toast "mensajes de confirmación" si está presente
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(org.openqa.selenium.By.cssSelector("div.toast")));
        } catch (Exception e) {
            // Si no hay toast, continuar
        }
        driver.findElement(  org.openqa.selenium.By.xpath(xPatCrearAdicionalButton) ).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatNombreInput)));
        driver.findElement(  org.openqa.selenium.By.xpath(xPatNombreInput) ).sendKeys("AdicionalPrueba3");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatPrecioInput) ).sendKeys("700");
        driver.findElement(  org.openqa.selenium.By.xpath(xPatCategoriaSelect) ).click();
        driver.findElement(  org.openqa.selenium.By.xpath(xPatBtnGuardarAdi) ).click();
        
        // Esperar a que desaparezca el toast "mensajes de confirmación" si está presente
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(org.openqa.selenium.By.cssSelector("div.toast")));
        } catch (Exception e) {
            // Si no hay toast, continuar
        }

        cantAdiNuevaElemento = driver.findElement(org.openqa.selenium.By.xpath(xPatCantAdiNumero));
        cantAdiNuevaTexto = cantAdiNuevaElemento.getText();
        cantAdiNueva = Integer.parseInt(cantAdiNuevaTexto);
        Assertions.assertThat(cantAdiNueva).isEqualTo(cantAdiInicial + 3);

        //11). Volver a la pestaña del menú y verificar que el nuevo adicional aparezca en el producto Malteada de Oreo
        driver.switchTo().window(pestanaMenu);
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatProductoCreado)));
        driver.findElement(org.openqa.selenium.By.xpath(xPatProductoCreado)).click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatCerrarInfoProductoNuevo)));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("monitoreoCantAdi")));

        monitoreoCantAdicionales = driver.findElements(By.className("monitoreoCantAdi"));
        Assertions.assertThat(monitoreoCantAdicionales.size())
            .as("El producto debe mostrar 3 adicionales creados previamente")
            .isEqualTo(3);

        //12). Me salgo de la info del producto 
        wait.until(ExpectedConditions.visibilityOfElementLocated(org.openqa.selenium.By.xpath(xPatCerrarInfoProductoNuevo)));
        driver.findElement(org.openqa.selenium.By.xpath(xPatCerrarInfoProductoNuevo)).click();


    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            //driver.quit();
        }
    }
}
