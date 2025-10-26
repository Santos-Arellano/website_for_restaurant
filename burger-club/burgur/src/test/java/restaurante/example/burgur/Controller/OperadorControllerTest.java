package test.java.restaurante.example.burgur.Controller;

import restaurante.example.burgur.Controller.OperadorController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.databind.ObjectMapper;

import restaurante.example.burgur.Model.Operador;
import restaurante.example.burgur.Service.OperadorService;

import org.springframework.test.context.ContextConfiguration;
import restaurante.example.burgur.BurgurApplication;

@ContextConfiguration(classes = BurgurApplication.class)
@WebMvcTest(OperadorController.class)
class OperadorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OperadorService operadorService;

    @Autowired
    private ObjectMapper objectMapper;

    private Operador buildOperador(Long id, String nombre, String cedula, boolean disponible) {
        Operador op = new Operador();
        op.setId(id);
        op.setNombre(nombre);
        op.setCedula(cedula);
        op.setDisponible(disponible);
        return op;
    }

    @Test
    @DisplayName("GET /operadores -> lista de operadores")
    void listarOperadores_ok() throws Exception {
        List<Operador> lista = List.of(
            buildOperador(1L, "Ana", "1001", true),
            buildOperador(2L, "Luis", "1002", false)
        );
        when(operadorService.obtenerTodosLosOperadores()).thenReturn(lista);

        mockMvc.perform(get("/operadores"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].nombre", is("Ana")))
            .andExpect(jsonPath("$[1].disponible", is(false)));
    }

    @Test
    @DisplayName("GET /operadores/{id} -> operador por id")
    void obtenerOperadorPorId_ok() throws Exception {
        Operador op = buildOperador(10L, "Carlos", "2001", true);
        when(operadorService.obtenerOperadorPorId(10L)).thenReturn(op);

        mockMvc.perform(get("/operadores/{id}", 10L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(10)))
            .andExpect(jsonPath("$.nombre", is("Carlos")))
            .andExpect(jsonPath("$.cedula", is("2001")))
            .andExpect(jsonPath("$.disponible", is(true)));
    }

    @Test
    @DisplayName("POST /operadores -> crear operador")
    void crearOperador_ok() throws Exception {
        Operador toCreate = buildOperador(null, "Marta", "3001", true);
        Operador created = buildOperador(20L, "Marta", "3001", true);
        when(operadorService.save(any(Operador.class))).thenReturn(created);

        mockMvc.perform(
            post("/operadores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(toCreate))
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(20)))
        .andExpect(jsonPath("$.nombre", is("Marta")))
        .andExpect(jsonPath("$.cedula", is("3001")))
        .andExpect(jsonPath("$.disponible", is(true)));
    }

    @Test
    @DisplayName("PUT /operadores/{id} -> actualizar operador")
    void actualizarOperador_ok() throws Exception {
        Operador existente = buildOperador(30L, "Juan", "4001", false);
        Operador actualizado = buildOperador(30L, "Juan", "4001", true);
        when(operadorService.obtenerOperadorPorId(30L)).thenReturn(existente);
        when(operadorService.save(any(Operador.class))).thenReturn(actualizado);

        Operador payload = buildOperador(null, "Juan", "4001", true);
        mockMvc.perform(
            put("/operadores/{id}", 30L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload))
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id", is(30)))
        .andExpect(jsonPath("$.disponible", is(true)));
    }

    @Test
    @DisplayName("DELETE /operadores/{id} -> eliminar operador")
    void eliminarOperador_noContent() throws Exception {
        mockMvc.perform(delete("/operadores/{id}", 40L))
            .andExpect(status().isNoContent());

        verify(operadorService).eliminarOperador(eq(40L));
    }

    @Test
    @DisplayName("GET /operadores/disponibles -> operadores disponibles")
    void operadoresDisponibles_ok() throws Exception {
        List<Operador> disponibles = List.of(
            buildOperador(50L, "Nora", "5001", true)
        );
        when(operadorService.obtenerOperadoresDisponibles()).thenReturn(disponibles);

        mockMvc.perform(get("/operadores/disponibles"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].disponible", is(true)));
    }

    @Test
    @DisplayName("GET /operadores/stats -> total de operadores")
    void operadoresStats_ok() throws Exception {
        when(operadorService.countTotal()).thenReturn(7L);

        mockMvc.perform(get("/operadores/stats"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", is(7)));
    }

    @Test
    @DisplayName("POST /operadores/login -> login exitoso")
    void loginOperador_ok() throws Exception {
        Operador op = buildOperador(60L, "Olga", "6001", true);
        when(operadorService.obtenerOperadorPorCedula("6001")).thenReturn(op);

        String payload = "{\"cedula\":\"6001\"}";
        mockMvc.perform(
            post("/operadores/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
        )
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success", is(true)))
        .andExpect(jsonPath("$.operador.id", is(60)))
        .andExpect(jsonPath("$.operador.cedula", is("6001")));
    }

    @Test
    @DisplayName("GET /operadores/current -> sin sesión retorna authenticated=false")
    void currentOperador_sinSesion() throws Exception {
        mockMvc.perform(get("/operadores/current"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated", is(false)));
    }

    @Test
    @DisplayName("GET /operadores/current -> con sesión retorna authenticated=true")
    void currentOperador_conSesion() throws Exception {
        Operador op = buildOperador(70L, "Pablo", "7001", true);
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("operador", op);

        mockMvc.perform(get("/operadores/current").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authenticated", is(true)))
            .andExpect(jsonPath("$.operador.id", is(70)))
            .andExpect(jsonPath("$.operador.nombre", is("Pablo")));
    }
}