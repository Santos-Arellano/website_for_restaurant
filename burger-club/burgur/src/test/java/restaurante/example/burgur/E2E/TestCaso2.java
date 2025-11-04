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
public class TestCaso2 {
    private WebDriver driver;
    private WebDriverWait wait;
    // Usar el puerto actual de desarrollo del frontend
    private final String BASE_URL = "http://localhost:4300/";

    @BeforeEach
    public void setup() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("--disable-notifications");
        chromeOptions.addArguments("--disable-extensions");
        chromeOptions.addArguments("--headless=new");
        chromeOptions.addArguments("--remote-allow-origins=*");
        // Intentar usar CHROME_BIN si existe; si no, probar la ruta típica de macOS
        String chromeBin = System.getenv("CHROME_BIN");
        if (chromeBin != null && !chromeBin.isBlank()) {
            chromeOptions.setBinary(chromeBin);
        } else {
            chromeOptions.setBinary("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
        }

        this.driver = new ChromeDriver(chromeOptions);
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(12));
    }

    @AfterEach
    public void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testCaso2() {
        // 1) Login como usuario registrado
        login("juan.perez@email.com", "password123");

        // 2) Ir al menú y agregar 2 comidas con dos adicionales cada una
        driver.get(BASE_URL + "menu");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("menuGrid")));

        // Agregar primer producto
        openProductDetailByIndex(1);
        selectFirstTwoAddons();
        clickAddToCart();

        // Agregar segundo producto
        openProductDetailByIndex(2);
        selectFirstTwoAddons();
        clickAddToCart();

        // 3) Verificar carrito (2 items y adicionales) y obtener total dinámico
        driver.get(BASE_URL + "cart");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h2[contains(text(),'Carrito de Compras')]|//h2[contains(text(),'Carrito')]")));

        List<WebElement> cartItems = driver.findElements(By.cssSelector(".cart-item"));
        Assertions.assertThat(cartItems.size()).isGreaterThanOrEqualTo(2);

        // Verificar que cada item tenga al menos 2 adicionales visualizados
        for (WebElement item : cartItems) {
            List<WebElement> extras = item.findElements(By.cssSelector(".cart-item-extras .cart-item-extra-chip"));
            Assertions.assertThat(extras.size()).isGreaterThanOrEqualTo(2);
        }

        // Capturar total del carrito de forma dinámica (sin valores quemados)
        WebElement cartTotalEl = driver.findElement(By.cssSelector(".cart-total span:last-child"));
        double cartTotal = parseMoneyToDouble(cartTotalEl.getText());
        Assertions.assertThat(cartTotal).isGreaterThan(0.0);

        // 4) Proceder al pago (crea el pedido) y navegar a historial
        WebElement checkoutBtn = driver.findElement(By.cssSelector(".btn-checkout"));
        wait.until(ExpectedConditions.elementToBeClickable(checkoutBtn));
        checkoutBtn.click();

        wait.until(ExpectedConditions.urlContains("/orders"));

        // Obtener el ID del último pedido mostrado (primer card)
        int pedidoId = obtenerPedidoIdDesdeHistorial();
        Assertions.assertThat(pedidoId).isGreaterThan(0);

        // 5) Abrir nueva pestaña (operador/admin), cambiar estados del pedido
        String userTab = driver.getWindowHandle();
        driver.switchTo().newWindow(WindowType.TAB);
        String adminTab = driver.getWindowHandle();

        loginAdmin("admin@burgerclub.com", "admin123");
        driver.get(BASE_URL + "admin/pedidos");
        wait.until(ExpectedConditions.urlContains("admin/pedidos"));

        // Cambiar a EN_PREPARACION (Cocinando)
        cambiarEstadoPedidoDesdeAdmin(pedidoId, "Cocinando");
        // Validar en usuario
        driver.switchTo().window(userTab);
        refrescarHistorialYValidarEstado(pedidoId, "EN_PREPARACION");

        // Cambiar a EN_CAMINO (Enviado)
        driver.switchTo().window(adminTab);
        cambiarEstadoPedidoDesdeAdmin(pedidoId, "Enviado");
        // Validar en usuario
        driver.switchTo().window(userTab);
        refrescarHistorialYValidarEstado(pedidoId, "EN_CAMINO");

        // Asignar domiciliario si está disponible (opcional, no falla si no hay selector)
        driver.switchTo().window(adminTab);
        asignarDomiciliarioSiDisponible(pedidoId);

        // Cambiar a ENTREGADO
        cambiarEstadoPedidoDesdeAdmin(pedidoId, "Entregado");

        // Validar en usuario
        driver.switchTo().window(userTab);
        refrescarHistorialYValidarEstado(pedidoId, "ENTREGADO");

        // 6) Verificar detalles del pedido y adicionales en el historial
        abrirDetallesPedidoDesdeHistorial(pedidoId);
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".order-detail")));

        List<WebElement> detalleItems = driver.findElements(By.cssSelector(".productos .producto-item"));
        Assertions.assertThat(detalleItems.size()).isGreaterThanOrEqualTo(2);
        for (WebElement item : detalleItems) {
            List<WebElement> adis = item.findElements(By.cssSelector(".adicionales-list li"));
            Assertions.assertThat(adis.size()).isGreaterThanOrEqualTo(2);
        }

        // 7) Comparar total dinámico del carrito vs total del pedido en detalles
        WebElement totalDetalleEl = driver.findElement(By.cssSelector(".totales p"));
        double totalDetalle = parseMoneyToDouble(totalDetalleEl.getText());
        Assertions.assertThat(totalDetalle).isEqualTo(cartTotal);
    }

    private void login(String email, String password) {
        driver.get(BASE_URL + "login");
        String xPatUsuario = "//*[@id=\"loginEmail\"]";
        String xPatPassword = "//*[@id=\"loginPassword\"]";
        String xPatLoginButton = "/html/body/app-root/div/main/app-auth/div/div/form/button";

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xPatLoginButton)));
        driver.findElement(By.xpath(xPatUsuario)).clear();
        driver.findElement(By.xpath(xPatUsuario)).sendKeys(email);
        driver.findElement(By.xpath(xPatPassword)).clear();
        driver.findElement(By.xpath(xPatPassword)).sendKeys(password);
        driver.findElement(By.xpath(xPatLoginButton)).click();

        // Esperar a redirección al home
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div.toast")));
        } catch (Exception ignored) {}
    }

    private void loginAdmin(String email, String password) {
        login(email, password);
        wait.until(ExpectedConditions.or(
            ExpectedConditions.urlContains("admin"),
            ExpectedConditions.urlContains("/")
        ));
    }

    private void openProductDetailByIndex(int indexOneBased) {
        String xpath = "//*[@id=\"menuGrid\"]/article[" + indexOneBased + "]/div[2]";
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(xpath)));
        driver.findElement(By.xpath(xpath)).click();
        // Esperar modal de detalle
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".product-detail-container, app-product-detail")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".adicionales-section")));
    }

    private void selectFirstTwoAddons() {
        // Buscar labels de adicionales y seleccionar los dos primeros habilitados
        List<WebElement> labels = driver.findElements(By.cssSelector(".adicional-label"));
        int selected = 0;
        for (WebElement label : labels) {
            WebElement checkbox = label.findElement(By.cssSelector("input[type='checkbox']"));
            if (checkbox.isEnabled()) {
                checkbox.click();
                selected++;
            }
            if (selected >= 2) break;
        }
        Assertions.assertThat(selected).isGreaterThanOrEqualTo(2);
    }

    private void clickAddToCart() {
        // Botón dentro de detalle de producto Angular
        WebElement addBtn = driver.findElement(By.xpath("//button[contains(., 'Agregar al carrito')]"));
        wait.until(ExpectedConditions.elementToBeClickable(addBtn));
        addBtn.click();
        // Esperar a que cierre o se oculte el detalle (navega o toast)
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector(".product-detail-container")));
        } catch (Exception ignored) {}
    }

    private int obtenerPedidoIdDesdeHistorial() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".orders-section, app-order-history")));
        // Primer card
        WebElement firstCard = driver.findElements(By.cssSelector(".order-card")).stream().findFirst()
            .orElseThrow(() -> new RuntimeException("No se encontró pedido en historial"));
        WebElement idEl = firstCard.findElement(By.cssSelector(".order-id"));
        String idText = idEl.getText(); // e.g., (ID #123)
        return extractIdNumber(idText);
    }

    private void refrescarHistorialYValidarEstado(int pedidoId, String estadoEsperado) {
        driver.get(BASE_URL + "orders");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".order-card")));
        WebElement card = encontrarCardPedidoPorId(pedidoId);
        WebElement statusBadge = card.findElement(By.cssSelector(".status-badge"));
        String statusText = statusBadge.getText().trim().toUpperCase();
        Assertions.assertThat(statusText).contains(estadoEsperado);
    }

    private WebElement encontrarCardPedidoPorId(int pedidoId) {
        List<WebElement> cards = driver.findElements(By.cssSelector(".order-card"));
        for (WebElement c : cards) {
            String idText = c.findElement(By.cssSelector(".order-id")).getText();
            int id = extractIdNumber(idText);
            if (id == pedidoId) {
                return c;
            }
        }
        throw new RuntimeException("Pedido #" + pedidoId + " no encontrado en historial");
    }

    private void abrirDetallesPedidoDesdeHistorial(int pedidoId) {
        WebElement card = encontrarCardPedidoPorId(pedidoId);
        WebElement btnDetalles = card.findElement(By.cssSelector(".btn-details"));
        wait.until(ExpectedConditions.elementToBeClickable(btnDetalles));
        btnDetalles.click();
        wait.until(ExpectedConditions.urlContains("/orders/" + pedidoId));
    }

    private void cambiarEstadoPedidoDesdeAdmin(int pedidoId, String accionBtnTexto) {
        // Buscar fila por ID de pedido y presionar el botón correspondiente
        // Hacer más tolerante al layout, usando contains()
        String filaXpath = "//table//tr[td[contains(., '" + pedidoId + "')] or td[contains(., '#" + pedidoId + "')]]";
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath(filaXpath)));
        WebElement fila = driver.findElement(By.xpath(filaXpath));
        WebElement btn = fila.findElement(By.xpath(".//button[contains(., '" + accionBtnTexto + "') ]"));
        wait.until(ExpectedConditions.elementToBeClickable(btn));
        btn.click();
        // Esperar a toast o cambio de estado
        try {
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("div.toast")));
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div.toast")));
        } catch (Exception ignored) {}
    }

    private void asignarDomiciliarioSiDisponible(int pedidoId) {
        try {
            String filaXpath = "//table//tr[td[contains(., '" + pedidoId + "')] or td[contains(., '#" + pedidoId + "')]]";
            WebElement fila = driver.findElement(By.xpath(filaXpath));
            // Dropdown de domiciliario (si existe)
            WebElement selectDom = fila.findElement(By.xpath(".//select"));
            wait.until(ExpectedConditions.visibilityOf(selectDom));
            selectDom.click();
            // Seleccionar primer domiciliario disponible
            WebElement option = selectDom.findElement(By.xpath(".//option[@value and not(@disabled)][1]"));
            option.click();
        } catch (Exception ignored) {
            // Si no hay selector de domiciliario, continuar
        }
    }

    private int extractIdNumber(String text) {
        // Extrae dígitos del texto y retorna el número
        String digits = text.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) return 0;
        return Integer.parseInt(digits);
    }

    private double parseMoneyToDouble(String text) {
        // Remueve símbolos de moneda y separadores no numéricos, convierte a double
        String cleaned = text.replaceAll("[^0-9.,]", "");
        // Normaliza coma a punto si aplica
        cleaned = cleaned.replace(".", ""); // remove thousand separator
        cleaned = cleaned.replace(",", "."); // decimal separator
        try {
            return Double.parseDouble(cleaned);
        } catch (Exception e) {
            return 0.0;
        }
    }
}