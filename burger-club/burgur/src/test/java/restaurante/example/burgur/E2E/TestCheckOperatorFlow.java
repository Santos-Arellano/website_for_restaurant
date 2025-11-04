package restaurante.example.burgur.E2E;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import io.github.bonigarcia.wdm.WebDriverManager;

import java.time.Duration;
import java.util.Map;
import java.util.List;
import java.util.HashMap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import static org.assertj.core.api.Assertions.assertThat;

public class TestCheckoutOperatorFlow {
    private static WebDriver driver;
    private static WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:8080/";
    private static final ObjectMapper mapper = new ObjectMapper();

    @BeforeAll
    public static void setup() {
        WebDriverManager.chromedriver().setup();
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterAll
    public static void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    // Helper: execute fetch in browser context and return JSON string
    private String fetchJson(String url, String method, String body) {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        String script = "var callback = arguments[arguments.length - 1];" +
                "fetch('" + url + "', {" +
                "  method: '" + method + "'," +
                "  headers: { 'Content-Type': 'application/json' }," +
                "  body: " + (body != null ? "'" + body.replace("'", "\\'") + "'" : "null") +
                "}).then(function(r){return r.text();}).then(function(t){callback(t);}).catch(function(e){callback(JSON.stringify({error: e && e.message ? e.message : 'fetch-error'}));});";
        Object result = js.executeAsyncScript(script);
        return result != null ? result.toString() : null;
    }

    // Helper: GET fetch
    private String getJson(String url) {
        return fetchJson(url, "GET", null);
    }

    // Helper: POST fetch
    private String postJson(String url, String body) {
        return fetchJson(url, "POST", body);
    }

    @Test
    public void clientCheckoutAndOperatorFlow() throws Exception {
        // 1) Login de cliente
        driver.get(BASE_URL + "auth/login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("loginForm")));
        WebElement email = driver.findElement(By.id("email"));
        WebElement password = driver.findElement(By.id("password"));
        WebElement loginBtn = driver.findElement(By.id("loginBtn"));

        email.clear();
        email.sendKeys("juan.perez@email.com");
        password.clear();
        password.sendKeys("password123");
        loginBtn.click();

        // Esperar redirección al menú
        wait.until(ExpectedConditions.urlContains("/menu"));
        assertThat(driver.getCurrentUrl()).contains("/menu");

        // 2) Obtener cliente actual para usar el clienteId
        String currentUserJson = getJson(BASE_URL + "auth/current");
        Map<String, Object> currentUser = mapper.readValue(currentUserJson, new TypeReference<Map<String, Object>>(){});
        assertThat(currentUser.get("authenticated")).isEqualTo(true);
        Map<String, Object> cliente = (Map<String, Object>) currentUser.get("cliente");
        Integer clienteId = (Integer) cliente.get("id");
        assertThat(clienteId).isNotNull();

        // 3) Seleccionar un producto
        String productosJson = getJson(BASE_URL + "productos");
        List<Map<String, Object>> productos = mapper.readValue(productosJson, new TypeReference<List<Map<String, Object>>>(){});
        assertThat(productos).isNotEmpty();
        Integer productoId = (Integer) productos.get(0).get("id");
        assertThat(productoId).isNotNull();

        // 4) Agregar al carrito del backend
        String agregarUrl = BASE_URL + "carrito/agregar?clienteId=" + clienteId + "&productoId=" + productoId + "&cantidad=2";
        String carritoJson = postJson(agregarUrl, null);
        assertThat(carritoJson).isNotNull();

        // 5) Cerrar carrito y crear pedido
        String cerrarUrl = BASE_URL + "carrito/enviar?clienteId=" + clienteId;
        String cerradoJson = postJson(cerrarUrl, null);
        assertThat(cerradoJson).isNotNull();

        String crearPedidoUrl = BASE_URL + "pedidos/crear?clienteId=" + clienteId;
        String crearResp = postJson(crearPedidoUrl, null);
        assertThat(crearResp).contains("Pedido creado exitosamente");

        // 6) Obtener pedidos activos y seleccionar el más reciente
        String pedidosActivosJson = getJson(BASE_URL + "pedidos/activos");
        List<Map<String, Object>> pedidosActivos = mapper.readValue(pedidosActivosJson, new TypeReference<List<Map<String, Object>>>(){});
        assertThat(pedidosActivos).isNotEmpty();
        Map<String, Object> pedido = pedidosActivos.get(pedidosActivos.size() - 1);
        Integer pedidoId = (Integer) pedido.get("id");
        assertThat(pedidoId).isNotNull();

        // 7) Asegurar que exista un operador y hacer login
        String operadoresJson = getJson(BASE_URL + "operadores");
        List<Map<String, Object>> operadores = mapper.readValue(operadoresJson, new TypeReference<List<Map<String, Object>>>(){});

        String cedulaLogin = "6001";
        if (operadores == null || operadores.isEmpty()) {
            Map<String, Object> nuevoOperador = new HashMap<>();
            nuevoOperador.put("nombre", "Olga");
            nuevoOperador.put("cedula", cedulaLogin);
            nuevoOperador.put("disponible", true);
            String crearOpJson = postJson(BASE_URL + "operadores", mapper.writeValueAsString(nuevoOperador));
            Map<String, Object> opCreado = mapper.readValue(crearOpJson, new TypeReference<Map<String, Object>>(){});
            assertThat(opCreado.get("id")).isNotNull();
        }

        Map<String, String> loginPayload = Map.of("cedula", cedulaLogin);
        String loginOpJson = postJson(BASE_URL + "operadores/login", mapper.writeValueAsString(loginPayload));
        Map<String, Object> loginResp = mapper.readValue(loginOpJson, new TypeReference<Map<String, Object>>(){});
        assertThat(loginResp.get("success")).isEqualTo(true);

        // 8) Actualizar estado del pedido y asignar domiciliario
        String estadoPrep = postJson(BASE_URL + "pedidos/" + pedidoId + "/estado?estado=Preparando", null);
        assertThat(estadoPrep).contains("Estado actualizado a Preparando");

        String estadoEnv = postJson(BASE_URL + "pedidos/" + pedidoId + "/estado?estado=Enviado", null);
        assertThat(estadoEnv).contains("Estado actualizado a Enviado");

        String domsJson = getJson(BASE_URL + "domiciliarios/disponibles");
        List<Map<String, Object>> doms = mapper.readValue(domsJson, new TypeReference<List<Map<String, Object>>>(){});
        assertThat(doms).isNotEmpty();
        Integer domId = (Integer) doms.get(0).get("id");
        String asignarDomJson = postJson(BASE_URL + "pedidos/" + pedidoId + "/domiciliario?domiciliarioId=" + domId, null);
        Map<String, Object> pedidoAsignado = mapper.readValue(asignarDomJson, new TypeReference<Map<String, Object>>(){});
        assertThat(((Map<String, Object>)pedidoAsignado.get("domiciliario")).get("id")).isEqualTo(domId);

        String estadoEnt = postJson(BASE_URL + "pedidos/" + pedidoId + "/estado?estado=Entregado", null);
        assertThat(estadoEnt).contains("Estado actualizado a Entregado");

        // 9) Verificar estado final del pedido
        String pedidoFinalJson = getJson(BASE_URL + "pedidos/" + pedidoId);
        Map<String, Object> pedidoFinal = mapper.readValue(pedidoFinalJson, new TypeReference<Map<String, Object>>(){});
        assertThat(((String)pedidoFinal.get("estado")).toUpperCase()).isEqualTo("ENTREGADO");
        Map<String, Object> operador = (Map<String, Object>) pedidoFinal.get("operador");
        assertThat(operador).isNotNull();
        assertThat(operador.get("cedula")).isEqualTo(cedulaLogin);
        Map<String, Object> domiciliario = (Map<String, Object>) pedidoFinal.get("domiciliario");
        assertThat(domiciliario).isNotNull();
    }
}
