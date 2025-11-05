package restaurante.example.burgur.E2E;

import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

 public class TestOperadorFlujo {

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

        // 2) Añadir dos productos con hasta dos adicionales cada uno (usando datos de BD)
        int productosASeleccionar = Math.min(2, wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector(".menu-grid .menu-card"))).size());
        for (int i = 0; i < productosASeleccionar; i++) {
            // Re-localizar las tarjetas en cada iteración para evitar referencias obsoletas
            List<WebElement> cards = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector(".menu-grid .menu-card")));
            WebElement card = cards.get(i);
            // Preferir click en la tarjeta (navega a detalle). Si no abre navegación, usar overlay como fallback.
            boolean navegoADetalle = false;
            try {
                new org.openqa.selenium.interactions.Actions(driver)
                        .moveToElement(card)
                        .pause(Duration.ofMillis(150))
                        .click(card)
                        .perform();
                // Esperar a que aparezca el componente de detalle o se cambie la URL a /product/
                WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofSeconds(5));
                shortWait.until(ExpectedConditions.or(
                        ExpectedConditions.urlContains("/product/"),
                        ExpectedConditions.presenceOfElementLocated(By.cssSelector("app-product-detail"))
                ));
                navegoADetalle = true;
            } catch (Exception ignored) { }

            if (!navegoADetalle) {
                // Navegación programática a detalle usando el data-id de la tarjeta
                try {
                    String prodId = card.getAttribute("data-id");
                    System.out.println("[DEBUG] data-id de producto seleccionado index=" + i + " => " + prodId);
                    if (prodId != null && !prodId.isBlank()) {
                        String detalleUrl = FRONTEND_URL + "product/" + prodId;
                        System.out.println("[INFO] Fallback navegando a URL de detalle: " + detalleUrl);
                        driver.get(detalleUrl);
                        new WebDriverWait(driver, Duration.ofSeconds(12))
                                .until(ExpectedConditions.or(
                                        ExpectedConditions.urlMatches(".*/product/\\d+.*"),
                                        ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".product-detail-overlay.active"))
                                ));
                        navegoADetalle = driver.getCurrentUrl().contains("/product/");
                        System.out.println("[DEBUG] URL tras navegación directa: " + driver.getCurrentUrl());
                    } else {
                        System.out.println("[WARN] La tarjeta no tiene atributo data-id, no se puede navegar directo.");
                    }
                } catch (Exception e) {
                    System.out.println("[WARN] Error navegando directo a detalle: " + e.getMessage());
                }
            }

            // Usar siempre la página de detalle para seleccionar adicionales
            boolean enPaginaDetalle = driver.getCurrentUrl().contains("/product/") || !driver.findElements(By.cssSelector("app-product-detail")).isEmpty();
            if (enPaginaDetalle) {
                // Esperar overlay del detalle activo y contenedor visible
                WebElement overlayDetalle = new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".product-detail-overlay.active")));
                WebElement contDetalle = new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".product-detail-container")));

                // Seleccionar hasta 2 adicionales en el detalle
                int seleccionados = 0;
                try {
                    WebElement secAdic = new WebDriverWait(driver, Duration.ofSeconds(8))
                            .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".adicionales-section")));
                    List<WebElement> labels = secAdic.findElements(By.cssSelector(".adicionales-grid .adicional-item label.adicional-label"));
                    for (WebElement label : labels) {
                        if (seleccionados >= 2) break;
                        try {
                            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", label);
                            WebElement checkbox = label.findElement(By.cssSelector("input[type='checkbox']"));
                            if (checkbox.isSelected()) { seleccionados++; continue; }
                            new WebDriverWait(driver, Duration.ofSeconds(4))
                                    .until(ExpectedConditions.elementToBeClickable(label)).click();
                            new WebDriverWait(driver, Duration.ofSeconds(4))
                                    .until(d -> { try { return checkbox.isSelected(); } catch (StaleElementReferenceException e) { return false; } });
                            seleccionados++;
                        } catch (Exception ignored) { }
                    }
                } catch (Exception ignored) { }

                // Agregar al carrito y volver al menú
                WebElement addBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                        .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-add-to-cart")));
                ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", addBtn);
                addBtn.click();

                // Volver al menú desde detalle
                try {
                    WebElement backBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                            .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".btn-back, .modal-close")));
                    backBtn.click();
                    wait.until(ExpectedConditions.urlContains("/menu"));
                } catch (Exception ignored) {
                    // Fallback: navegar directamente
                    driver.get(FRONTEND_URL + "menu");
                    wait.until(ExpectedConditions.urlContains("/menu"));
                }
            } else {
                // Fallback: abrir modal de detalle desde la tarjeta en el menú
                try {
                    org.openqa.selenium.interactions.Actions actions = new org.openqa.selenium.interactions.Actions(driver);
                    actions.moveToElement(card).pause(Duration.ofMillis(150)).perform();
                    try { Thread.sleep(150); } catch (InterruptedException ignored) {}
                    WebElement imageEl = card.findElement(By.cssSelector(".menu-card-image"));
                    actions.moveToElement(imageEl).pause(Duration.ofMillis(200)).perform();
                    try { Thread.sleep(200); } catch (InterruptedException ignored) {}
                    WebElement overlayEl = new WebDriverWait(driver, Duration.ofSeconds(10))
                            .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".menu-card-image .card-overlay")));
                    System.out.println("[DEBUG] Clic forzado en overlay de tarjeta para abrir modal (index=" + i + ")");
                    ((JavascriptExecutor) driver).executeScript("arguments[0].click();", overlayEl);

                    // Esperar overlay y contenido del modal de detalle
                    WebElement overlayModal = new WebDriverWait(driver, Duration.ofSeconds(12))
                            .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".modal-overlay")));
                    WebElement contModal = new WebDriverWait(driver, Duration.ofSeconds(12))
                            .until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(".modal-content")));

                    // Seleccionar hasta 2 adicionales en el overlay de detalle
                    int seleccionados = 0;
                    try {
                        WebElement secAdic = new WebDriverWait(driver, Duration.ofSeconds(10))
                                .until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".adicionales-section")));
                        List<WebElement> labels = secAdic.findElements(By.cssSelector(".adicionales-list .adicional-item label.adicional-checkbox"));
                        for (WebElement label : labels) {
                            if (seleccionados >= 2) break;
                            try {
                                ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", label);
                                WebElement checkbox = label.findElement(By.cssSelector("input[type='checkbox']"));
                                if (checkbox.isSelected()) { seleccionados++; continue; }
                                new WebDriverWait(driver, Duration.ofSeconds(5))
                                        .until(ExpectedConditions.elementToBeClickable(label)).click();
                                new WebDriverWait(driver, Duration.ofSeconds(5))
                                        .until(d -> { try { return checkbox.isSelected(); } catch (StaleElementReferenceException e) { return false; } });
                                seleccionados++;
                            } catch (Exception ignored) { }
                        }
                    } catch (Exception ignored) { }

                    // Agregar al carrito y cerrar modal/volver atrás
                    WebElement addBtn = new WebDriverWait(driver, Duration.ofSeconds(12))
                            .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".add-to-cart-btn")));
                    ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", addBtn);
                    addBtn.click();

                    try {
                        WebElement closeBtn = new WebDriverWait(driver, Duration.ofSeconds(10))
                                .until(ExpectedConditions.elementToBeClickable(By.cssSelector(".close-button")));
                        closeBtn.click();
                        wait.until(ExpectedConditions.urlContains("/menu"));
                    } catch (Exception ignored) {
                        // Si no hay botón, asegurarse de estar en el menú
                        driver.get(FRONTEND_URL + "menu");
                        wait.until(ExpectedConditions.urlContains("/menu"));
                    }
                } catch (Exception e) {
                    // Último recurso: agregar directamente desde la tarjeta del menú
                    try {
                        WebElement addQuickBtn = card.findElement(By.cssSelector(".menu-card-content .btn-add-cart"));
                        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", addQuickBtn);
                        new WebDriverWait(driver, Duration.ofSeconds(5))
                                .until(ExpectedConditions.elementToBeClickable(addQuickBtn)).click();
                        // Esperar a que desaparezca cualquier toast de confirmación
                        try {
                            new WebDriverWait(driver, Duration.ofSeconds(2))
                                    .until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector("div.toast")));
                        } catch (Exception ignored) {}
                    } catch (Exception ex) {
                        throw new TimeoutException("No se pudo abrir el modal ni agregar el producto directamente desde la tarjeta.");
                    }
                }
            }

            // (flujo modal y detalle manejados arriba)
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

        // Click en Proceder al Pago
        WebElement checkoutBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("button.btn-checkout")));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block:'center'});", checkoutBtn);
        checkoutBtn.click();

        // Navega a /orders tras crear pedido
        wait.until(ExpectedConditions.urlContains("/orders"));

        // 5) Capturar el ID del pedido recién creado desde el historial
        // Buscar tarjetas y tomar el mayor ID como el más reciente
        List<WebElement> orderCards = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(By.cssSelector(".orders-list .order-card")));
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

        Assertions.assertTrue(latestId > 0, "No se pudo obtener el ID del pedido");

        // 6) Login operador usando solo la UI (sin llamadas directas a API)
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

        // Asegurar que el card está visible
        wait.until(ExpectedConditions.visibilityOfElementLocated(cardBy));

        // Cambiar a EN_PREPARACION (Cocinando)
        safeClick(btnCocinandoBy);
        // Re-localizar el card tras posible re-render
        wait.until(ExpectedConditions.visibilityOfElementLocated(cardBy));

        // Asignar domiciliario: localizar select de forma anclada al card y evitar referencias obsoletas
        WebElement selectDomi = wait.until(ExpectedConditions.elementToBeClickable(selectDomiBy));
        selectDomi.click();
        List<WebElement> options = driver.findElements(optionListBy);
        if (options.size() > 1) {
            options.get(1).click();
        }

        // Cambiar a EN_CAMINO (Enviado) con re-localización
        safeClick(btnEnviadoBy);
        wait.until(ExpectedConditions.visibilityOfElementLocated(cardBy));

        // Cambiar a ENTREGADO
        safeClick(btnEntregadoBy);

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

    private void safeClick(By by) {
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
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(by));
        el.click();
    }

}

   