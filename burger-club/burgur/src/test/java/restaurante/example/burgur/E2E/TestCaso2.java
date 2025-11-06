package restaurante.example.burgur.E2E;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.openqa.selenium.support.ui.Select;
import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class TestCaso2 {
     private WebDriver driver;
     private WebDriverWait wait;

    private static final String FRONTEND_URL = System.getProperty("front.url", "http://localhost:4200/");
    // Usar por defecto un cliente sembrado en BD (todos con password "password123")
    private static final String CLIENT_EMAIL = System.getProperty("cliente.email",
            System.getProperty("clienteEmail", "ana.martinez@email.com"));
    private static final String CLIENT_PASSWORD = System.getProperty("cliente.password",
            System.getProperty("clientePassword", "password123"));
    private static final String OPERADOR_CEDULA = System.getProperty("operador.cedula",
            System.getProperty("operadorCedula", "9999999999"));

    @BeforeEach
    public void setUp() {
        WebDriverManager.chromedriver().setup();
        ChromeOptions chromeOptions = new ChromeOptions();
        chromeOptions.addArguments("--disable-notifications");
        chromeOptions.addArguments("--disable-extensions");
        chromeOptions.addArguments("--remote-allow-origins=*");
        String chromeBin = System.getenv("CHROME_BIN");
        if (chromeBin != null && !chromeBin.isBlank()) {
            chromeOptions.setBinary(chromeBin);
        }
        driver = new ChromeDriver(chromeOptions);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void flujoCompletoClienteOperador() throws Exception {
        // 1) Login de cliente (usar usuario existente en BD)
        driver.get(FRONTEND_URL + "login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input#loginEmail"))).sendKeys(CLIENT_EMAIL);
        driver.findElement(By.cssSelector("input#loginPassword")).sendKeys(CLIENT_PASSWORD);
        driver.findElement(By.cssSelector("button.auth-btn.primary")).click();

        // Assert 1) Inicio de sesión: la URL deja de ser /login (página principal)
        new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(ExpectedConditions.not(ExpectedConditions.urlContains("/login")));
        Assertions.assertTrue(
                driver.getCurrentUrl().startsWith(FRONTEND_URL) && !driver.getCurrentUrl().contains("/login"),
                "Tras el login no se redirigió a la página principal"
        );

        // Esperar redirección post-login y navegar al menú mediante la UI (Nav o Hero CTA)
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath(
                "//a[@routerLink='/menu'] | " +
                "//a[contains(@class,'nav-link') and normalize-space(text())='Menú'] | " +
                "//a[contains(@class,'mobile-nav-link') and normalize-space(text())='Menú'] | " +
                "//a[normalize-space()='Ver Menú'] | " +
                "//a[normalize-space()='Ordenar']"
        )));
        boolean navegacionOk = false;
        List<WebElement> candidatos = driver.findElements(By.xpath(
                "//a[@routerLink='/menu'] | " +
                "//a[contains(@class,'nav-link') and normalize-space(text())='Menú'] | " +
                "//a[contains(@class,'mobile-nav-link') and normalize-space(text())='Menú'] | " +
                "//a[normalize-space()='Ver Menú'] | " +
                "//a[normalize-space()='Ordenar']"
        ));
        for (WebElement link : candidatos) {
            try {
                if (link.isDisplayed() && link.isEnabled()) {
                    wait.until(ExpectedConditions.elementToBeClickable(link)).click();
                    // Espera corta a que cambie la URL
                    WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(5));
                    shortWait.until(ExpectedConditions.urlContains("/menu"));
                    navegacionOk = true;
                    break;
                }
            } catch (Exception ignored) { }
        }
        if (!navegacionOk) {
            // Fallback en caso de que el enlace no produzca navegación
            driver.get(FRONTEND_URL + "menu");
            wait.until(ExpectedConditions.urlContains("/menu"));
        }
        //se verifica que este en la pantalla del menu
        Assertions.assertTrue(driver.getCurrentUrl().contains("/menu"), "No se navegó al menú");

        // 2) Añadir dos productos con hasta dos adicionales cada uno (usando datos de BD)
        int productosASeleccionar = Math.min(2, wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector(".menu-grid .menu-card"))).size());
        for (int i = 0; i < productosASeleccionar; i++) {
            
            List<WebElement> cards = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector(".menu-grid .menu-card")));
            WebElement card = cards.get(i);
         
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", card);
            new WebDriverWait(driver, Duration.ofSeconds(5))
                    .until(ExpectedConditions.elementToBeClickable(card))
                    .click();
            WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(5));
            shortWait.until(ExpectedConditions.or(
                    ExpectedConditions.urlContains("/product/"),
                    ExpectedConditions.presenceOfElementLocated(By.cssSelector("app-product-detail"))
            ));

            boolean enDetalleUrl = driver.getCurrentUrl().contains("/product/");
            boolean detalleVisible = !driver.findElements(By.cssSelector("app-product-detail")).isEmpty();

            
                // Esperar overlay del detalle activo y contenedor visible
                WebElement overlayDetalle = new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".product-detail-overlay.active")));
                WebElement contDetalle = new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".product-detail-container")));

                // Seleccionar hasta 2 adicionales en el detalle (sin try/catch)
                int seleccionados = 0;
                WebElement secAdic = new WebDriverWait(driver, Duration.ofSeconds(8))
                        .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".adicionales-section")));
                List<WebElement> labels = secAdic.findElements(By.cssSelector(".adicionales-grid .adicional-item label.adicional-label"));
                for (WebElement label : labels) {
                    if (seleccionados >= 2) break;
                    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", label);
                    WebElement checkbox = label.findElement(By.cssSelector("input[type='checkbox']"));
                    if (!checkbox.isSelected()) {
                        new WebDriverWait(driver, Duration.ofSeconds(4))
                                .until(ExpectedConditions.refreshed(ExpectedConditions.elementToBeClickable(label)))
                                .click();
                        new WebDriverWait(driver, Duration.ofSeconds(4))
                                .until(ExpectedConditions.elementSelectionStateToBe(checkbox, true));
                    }
                    seleccionados++;
                }

                // Validación visual opcional de selección omitida para simplificar

                // Agregar al carrito y volver al menú
                WebElement addBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-add-to-cart")));
                ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", addBtn);
                addBtn.click();

                // Volver al menú desde detalle (sin try/catch)
                WebElement backBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-back, .modal-close")));
                backBtn.click();
                wait.until(ExpectedConditions.urlContains("/menu"));
            
        }
                
        // 4) Ir al carrito y proceder al pago (crea pedido)
        driver.get(FRONTEND_URL + "cart");
        // Esperar contenedor del carrito y que desaparezca cualquier toast
        WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(2));
        try { shortWait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div.toast"))); } catch (Exception ignored) {}
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".cart-container")));

        // Asegurar que hay resumen del carrito visible
        try {
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".cart-summary")));
        } catch (Exception ignored) { }

        // Assert  Se verifican que esten 2 y el costo concuerde 
        int itemsCount = driver.findElements(By.cssSelector(".cart-items .cart-item")).size();
        Assertions.assertEquals(2, itemsCount, "El carrito debe tener exactamente 2 productos");

         long sumaItems = 0L;
        for (WebElement pEl : driver.findElements(By.cssSelector(".cart-items .item-total p"))) {
            sumaItems += parseCurrency(pEl.getText());
        }

        // Subtotal mostrado en el resumen
        WebElement subtotalEl = driver.findElement(By.xpath("//div[contains(@class,'cart-summary')]//div[contains(@class,'summary-row')][span[normalize-space()='Subtotal:']]/span[last()]"));
        long subtotal = parseCurrency(subtotalEl.getText());
        Assertions.assertEquals(sumaItems, subtotal, "El subtotal no coincide con la suma de los ítems");

      
        // Click en Proceder al Pago
        WebElement checkoutBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button.btn-checkout")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", checkoutBtn);
        checkoutBtn.click();

        
        // 5) Capturar el ID del pedido recién creado desde el historial
        // Buscar tarjetas y tomar el mayor ID como el más reciente
        List<WebElement> orderCards = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector(".orders-list .order-card")));
        Assertions.assertFalse(orderCards.isEmpty(), "No hay pedidos listados tras checkout");
        int latestId = -1;
        Pattern p = Pattern.compile("#(?<id>\\d+)");
        for (WebElement card : orderCards) {
            WebElement idEl = card.findElement(By.cssSelector(".order-id"));
            Matcher m = p.matcher(idEl.getText());
            if (m.find()) {
                int id = Integer.parseInt(m.group("id"));
                latestId = Math.max(latestId, id);
            }
        }


        // Assert 3) Estado inicial del pedido en pantalla Cliente: Recibido
        By orderCardBy = By.xpath("//div[contains(@class,'order-card')]//small[contains(@class,'order-id') and contains(., '#" + latestId + "')]/ancestor::div[contains(@class,'order-card')]");
        WebElement cardClienteInicial = wait.until(ExpectedConditions.visibilityOfElementLocated(orderCardBy));
        String estadoClienteInicial = cardClienteInicial.findElement(By.cssSelector(".order-status .status-badge")).getText().trim();
        Assertions.assertTrue(
                estadoClienteInicial.equalsIgnoreCase("Recibido") || estadoClienteInicial.equalsIgnoreCase("Pendiente"),
                "El estado inicial del pedido debe ser 'Recibido' o 'Pendiente'"
        );

    
        String cedulaOperador = OPERADOR_CEDULA;
        // Abrir nueva pestaña para el flujo del operador y mantener la pestaña del cliente
        String clienteTab = driver.getWindowHandle();
        ((JavascriptExecutor) driver).executeScript("window.open('about:blank','_blank');");
        new WebDriverWait(driver, Duration.ofSeconds(5)).until(d -> d.getWindowHandles().size() > 1);
        String operadorTab = driver.getWindowHandles().stream().filter(h -> !h.equals(clienteTab)).findFirst().orElse(clienteTab);
        driver.switchTo().window(operadorTab);

        driver.get(FRONTEND_URL + "operador/login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input#cedula"))).sendKeys(cedulaOperador);
        driver.findElement(By.cssSelector("button.btn-login")).click();

        // 7) Ir a pedidos de operador y avanzar estados hasta ENTREGADO
        new WebDriverWait(driver, Duration.ofSeconds(8))
                .until(ExpectedConditions.urlContains("/operador/pedidos"));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".operator-pedidos-section")));

        // Ubicar la tarjeta del pedido por ID y preparar selectores anclados al card
        String xpathCard = "//div[contains(@class,'pedido-card')]//div[contains(@class,'pedido-id') and contains(., '#" + latestId + "')]/ancestor::div[contains(@class,'pedido-card')]";
        By cardBy = By.xpath(xpathCard);
        By btnCocinandoBy = By.xpath(xpathCard + "//button[contains(@class,'btn-cocinando')]");
        By selectDomiBy = By.xpath(xpathCard + "//div[contains(@class,'asignar-domi')]//select");
        By optionListBy = By.xpath(xpathCard + "//div[contains(@class,'asignar-domi')]//select/option");
        By btnEnviadoBy = By.xpath(xpathCard + "//button[contains(@class,'btn-enviado')]");
        By btnEntregadoBy = By.xpath(xpathCard + "//button[contains(@class,'btn-entregado')]");

        // Cambiar a EN_PREPARACION (Cocinando): usar clickSmart por posible re-render/animación
        clickSmart(btnCocinandoBy);
        // Re-localizar el card tras posible re-render
        wait.until(ExpectedConditions.visibilityOfElementLocated(cardBy));

        // Assert 4) Estado Cocinando verificado desde pantalla Cliente
        driver.switchTo().window(clienteTab);
        driver.get(FRONTEND_URL + "orders");
        WebElement cardClienteCocinando = wait.until(ExpectedConditions.visibilityOfElementLocated(orderCardBy));
        String estadoClienteCocinando = cardClienteCocinando.findElement(By.cssSelector(".order-status .status-badge")).getText().trim();
        Assertions.assertTrue(
                estadoClienteCocinando.equalsIgnoreCase("Cocinando") || estadoClienteCocinando.equalsIgnoreCase("En Preparación"),
                "El estado en Cliente debe ser 'Cocinando' o 'En Preparación'"
        );
        driver.switchTo().window(operadorTab);

        // Asignar domiciliario de forma compacta
        assignFirstDomiciliario(selectDomiBy, btnEnviadoBy);

        // Cambiar a EN_CAMINO (Enviado): 
        clickSmart(btnEnviadoBy);
        waitOverlayIfPresent(xpathCard);
        wait.until(ExpectedConditions.visibilityOfElementLocated(cardBy));

        // Assert 5) Estado Enviado verificado desde pantalla Operador
        
        assertOperatorEstado(xpathCard, "Enviado", "EN_CAMINO", "En Camino");

        // Cambiar a ENTREGADO: 
        clickSmart(btnEntregadoBy);
        waitOverlayIfPresent(xpathCard);

        // Assert 6) Estado Entregado por badge o desaparición de tarjeta
        assertOperatorEstadoOrGone(xpathCard, cardBy, "Entregado", "ENTREGADO");

        // Cerrar pestaña del operador y volver a la del cliente
        driver.close();
        driver.switchTo().window(clienteTab);

        // 8) Verificar desde cliente el estado ENTREGADO en tracking
        driver.get(FRONTEND_URL + "orders/" + latestId + "/track");
        By estadoLocator = By.xpath("//div[contains(@class,'tracking-info')]//p[strong[normalize-space()='Estado:']]/span");
        wait.until(ExpectedConditions.visibilityOfElementLocated(estadoLocator));
        // Esperar a que el estado sea ENTREGADO (puede tardar unos segundos)
        new WebDriverWait(driver, Duration.ofSeconds(10)).until(d -> {
            try {
                String t = d.findElement(estadoLocator).getText().trim();
                return "ENTREGADO".equals(t);
            } catch (Exception ignored) { return false; }
        });
        String estadoText = driver.findElement(estadoLocator).getText().trim();
        Assertions.assertEquals("ENTREGADO", estadoText, "El estado final del pedido no es ENTREGADO");
    }
    // Convierte precios de texto a número (sin símbolos)
    private long parseCurrency(String text) {
        String digits = text == null ? "" : text.replaceAll("[^\\d]", "");
        return digits.isEmpty() ? 0L : Long.parseLong(digits);
    }

    // Hace clic de forma segura; reintenta y usa JS si es necesario
    private void clickSmart(By by) {
        int attempts = 0;
        while (attempts < 3) {
            try {
                WebElement el = new WebDriverWait(driver, Duration.ofSeconds(5))
                        .until(ExpectedConditions.refreshed(ExpectedConditions.elementToBeClickable(by)));
                el.click();
                return;
            } catch (StaleElementReferenceException | ElementClickInterceptedException e) {
                attempts++;
                try { Thread.sleep(200); } catch (InterruptedException ignored) {}
            }
        }
       WebElement el = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.elementToBeClickable(by));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", el);
    }

    // Espera si la tarjeta está ocupada (capa de carga)
    private void waitOverlayIfPresent(String xpathCard) {
        By loading = By.xpath(xpathCard + "//div[contains(@class,'card-loading')]");
        try {
            new WebDriverWait(driver, Duration.ofSeconds(8))
                    .until(ExpectedConditions.visibilityOfElementLocated(loading));
            new WebDriverWait(driver, Duration.ofSeconds(12))
                    .until(ExpectedConditions.invisibilityOfElementLocated(loading));
        } catch (Exception ignore) {
         
        }
    }

    // Elige el primer domiciliario y activa el botón 'Enviado'
    private void assignFirstDomiciliario(By selectDomiBy, By btnEnviadoBy) {
        WebElement selectDomi = new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.presenceOfElementLocated(selectDomiBy));
        Select domSelect = new Select(selectDomi);
        Assertions.assertTrue(domSelect.getOptions().size() > 1,
                "No hay domiciliarios disponibles para asignar");
        domSelect.selectByIndex(1);
        new WebDriverWait(driver, Duration.ofSeconds(5)).until(d -> {
            try { return d.findElement(btnEnviadoBy).isEnabled(); } catch (Exception e) { return false; }
        });
    }

    // Ubica el texto de estado dentro de la tarjeta
    private By operatorBadgeBy(String xpathCard) {
        return By.xpath(xpathCard + "//div[contains(@class,'pedido-estado')]//span[contains(@class,'status-badge')]");
    }

    // Comprueba que el estado sea uno de los esperados
    private void assertOperatorEstado(String xpathCard, String... variants) {
        By badge = operatorBadgeBy(xpathCard);
        boolean ok = new WebDriverWait(driver, Duration.ofSeconds(20)).until(d -> {
            try {
                String t = d.findElement(badge).getText().trim();
                for (String v : variants) if (t.equalsIgnoreCase(v)) return true;
                return false;
            } catch (Exception e) {
                return false;
            }
        });
        Assertions.assertTrue(ok, "El estado en Operador debe ser '" + variants[0] + "'");
    }

    // Comprueba el estado o que la tarjeta ya no esté
    private void assertOperatorEstadoOrGone(String xpathCard, By cardBy, String... variants) {
        boolean ok = new WebDriverWait(driver, Duration.ofSeconds(20)).until(d -> {
            try {
                String t = d.findElement(operatorBadgeBy(xpathCard)).getText().trim();
                for (String v : variants) if (t.equalsIgnoreCase(v)) return true;
                return false;
            } catch (NoSuchElementException nf) {
                return d.findElements(cardBy).isEmpty();
            } catch (Exception e) {
                return false;
            }
        });
        Assertions.assertTrue(ok, "El estado en Operador debe ser '" + variants[0] + "' o tarjeta fuera de activos");
    }

}