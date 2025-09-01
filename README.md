<div align="center">
  <img src="burger-club/burgur/src/main/resources/static/images/Logo.png" alt="Burger Club Logo" width="150" height="150">
  
  # 🍔 Burger Club - Sistema de Gestión de Restaurante
  
  <p><em>"La mejor experiencia gastronómica, ahora digital"</em></p>
  
  <img src="https://img.shields.io/badge/Spring%20Boot-3.0+-brightgreen" alt="Spring Boot">
  <img src="https://img.shields.io/badge/Java-17+-orange" alt="Java">
  <img src="https://img.shields.io/badge/H2-Database-blue" alt="H2 Database">
  <img src="https://img.shields.io/badge/Maven-Build-red" alt="Maven">
  <img src="https://img.shields.io/badge/Thymeleaf-Template-green" alt="Thymeleaf">
  <img src="https://img.shields.io/badge/Bootstrap-5.0+-purple" alt="Bootstrap">
</div>

## 📋 Descripción del Proyecto

**Burger Club** es un sistema completo de gestión para restaurantes desarrollado con Spring Boot. Permite la administración integral de productos, clientes, adicionales y pedidos, ofreciendo tanto una interfaz de usuario para clientes como un panel administrativo completo.

### 🎯 Características Principales

- ✅ **Gestión de Productos**: CRUD completo con categorización automática
- ✅ **Sistema de Adicionales**: Vinculación inteligente por categorías
- ✅ **Gestión de Clientes**: Registro, autenticación y perfiles
- ✅ **Panel Administrativo**: Dashboard con estadísticas en tiempo real
- ✅ **Menú Dinámico**: Filtrado por categorías y búsqueda avanzada
- ✅ **Base de Datos**: Inicialización automática con datos de prueba
- ✅ **API REST**: Endpoints completos para todas las operaciones
- ✅ **Responsive Design**: Interfaz adaptable a todos los dispositivos

## 🏗️ Arquitectura del Sistema

<div align="center">
  <img src="docs/architecture-diagram.svg" alt="Diagrama de Arquitectura" width="800">
</div>

```
📦 Burger Club
├── 🎯 Frontend (Thymeleaf + Bootstrap)
│   ├── Menú público
│   ├── Sistema de autenticación
│   └── Panel administrativo
├── ⚙️ Backend (Spring Boot)
│   ├── Controllers (REST + MVC)
│   ├── Services (Lógica de negocio)
│   ├── Repositories (Acceso a datos)
│   └── Models (Entidades JPA)
└── 🗄️ Base de Datos (H2)
    ├── Productos
    ├── Clientes
    ├── Adicionales
    └── Relaciones
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Spring Boot 3.0+**: Framework principal
- **Spring Data JPA**: Persistencia de datos
- **Spring Web**: API REST y controladores MVC
- **H2 Database**: Base de datos en memoria
- **Maven**: Gestión de dependencias
- **Java 17+**: Lenguaje de programación

### Frontend
- **Thymeleaf**: Motor de plantillas
- **Bootstrap 5**: Framework CSS
- **JavaScript ES6+**: Interactividad
- **HTML5 & CSS3**: Estructura y estilos

## 📁 Estructura del Proyecto

```
src/main/java/restaurante/example/burgur/
├── 🎮 Controller/
│   ├── AdminController.java          # Panel administrativo
│   ├── AdicionalController.java      # Gestión de adicionales
│   ├── AuthController.java           # Autenticación
│   ├── ClienteController.java        # Gestión de clientes
│   ├── MenuController.java           # Menú público
│   └── ProductoController.java       # Gestión de productos
├── 🔧 Service/
│   ├── AdicionalService.java         # Interface adicionales
│   ├── AdicionalServiceImpl.java     # Implementación adicionales
│   ├── ClienteService.java           # Interface clientes
│   ├── ClienteServiceImpl.java       # Implementación clientes
│   ├── ProductoService.java          # Interface productos
│   └── ProductoServiceImpl.java      # Implementación productos
├── 🗄️ Repository/
│   ├── AdicionalesPermiXProductoRepository.java
│   ├── AdicionalRepository.java
│   ├── ClienteRepository.java
│   └── ProductoRepository.java
├── 📊 Model/
│   ├── Adicional.java                # Entidad adicionales
│   ├── AdicionalesPermiXProducto.java # Relación M:N
│   ├── Cliente.java                  # Entidad clientes
│   └── Producto.java                 # Entidad productos
├── ⚙️ Config/
│   └── DataBaseInit.java             # Inicialización de datos
└── 🚀 BurgurApplication.java         # Clase principal
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- ☕ **Java 17 o superior**
- 📦 **Maven 3.6+**
- 🌐 **Navegador web moderno**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Santos-Arellano/website_for_restaurant.git
   cd website_for_restaurant/burger-club/burgur
   ```

2. **Compilar el proyecto**
   ```bash
   ./mvnw clean compile
   ```

3. **Ejecutar la aplicación**
   ```bash
   ./mvnw spring-boot:run
   ```

4. **Acceder a la aplicación**
   - 🌐 **Aplicación principal**: http://localhost:8080
   - 🔧 **Panel administrativo**: http://localhost:8080/menu/admin
   - 🗄️ **Consola H2**: http://localhost:8080/h2-console

### Configuración de Base de Datos

```properties
# application.properties
spring.datasource.url=jdbc:h2:file:./mydatabase
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=update
```

## 📚 Guía de Uso

### 👥 Para Clientes

1. **Registro/Login**
   - Crear cuenta nueva o iniciar sesión
   - Validación de datos automática

2. **Explorar Menú**
   - Filtrar por categorías
   - Buscar productos específicos
   - Ver detalles y adicionales disponibles

### 🔧 Para Administradores

1. **Dashboard**
   - Estadísticas en tiempo real
   - Resumen de productos, clientes y adicionales

2. **Gestión de Productos**
   - Crear, editar y eliminar productos
   - Gestión de stock y precios
   - Categorización automática

3. **Gestión de Adicionales**
   - Crear adicionales por categoría
   - Vinculación automática con productos

4. **Gestión de Clientes**
   - Ver lista completa de clientes
   - Editar información de clientes

## 🔌 API REST Endpoints

### Productos
```http
GET    /menu/api/productos           # Listar todos los productos
GET    /menu/api/productos/{id}      # Obtener producto por ID
POST   /menu/api/productos           # Crear nuevo producto
PUT    /menu/api/productos/{id}      # Actualizar producto
DELETE /menu/api/productos/{id}      # Eliminar producto
```

### Clientes
```http
GET    /admin/clientes/api           # Listar todos los clientes
GET    /admin/clientes/api/{id}      # Obtener cliente por ID
POST   /admin/clientes/api           # Crear nuevo cliente
PUT    /admin/clientes/api/{id}      # Actualizar cliente
DELETE /admin/clientes/api/{id}      # Eliminar cliente
```

### Adicionales
```http
GET    /admin/adicionales/api        # Listar todos los adicionales
GET    /admin/adicionales/api/{id}   # Obtener adicional por ID
POST   /admin/adicionales/api        # Crear nuevo adicional
PUT    /admin/adicionales/api/{id}   # Actualizar adicional
DELETE /admin/adicionales/api/{id}   # Eliminar adicional
```

### Autenticación
```http
POST   /auth/api/login               # Iniciar sesión
POST   /auth/api/register            # Registrar nuevo usuario
GET    /auth/api/current             # Usuario actual
```

## 🗄️ Modelo de Datos

### Entidades Principales

#### Producto
```java
- id: Long (PK)
- nombre: String
- descripcion: String
- precio: Double
- categoria: String
- imgURL: String
- stock: Integer
- nuevo: Boolean
- popular: Boolean
- activo: Boolean
- ingredientes: List<String>
```

#### Cliente
```java
- id: Long (PK)
- nombre: String
- apellido: String
- correo: String (Unique)
- contrasena: String
- telefono: String
- direccion: String
- activo: Boolean
```

#### Adicional
```java
- id: Long (PK)
- nombre: String (Unique)
- precio: Double
- activo: Boolean
- categoria: List<String>
```

### Relaciones
- **Producto ↔ Adicional**: Relación Many-to-Many a través de `AdicionalesPermiXProducto`
- **Vinculación automática**: Los adicionales se asocian automáticamente según categorías compatibles

## 🎨 Características de la Interfaz

### Diseño Responsive
- ✅ Adaptable a móviles, tablets y desktop
- ✅ Bootstrap 5 para consistencia visual
- ✅ Iconografía moderna con Font Awesome

### Panel Administrativo
- 📊 Dashboard con métricas en tiempo real
- 🔍 Búsqueda y filtrado avanzado
- ✏️ Modales para edición rápida
- 📱 Interfaz intuitiva y moderna

<div align="center">
  <img src="docs/dashboard-preview.svg" alt="Vista del Dashboard Administrativo" width="900">
  <p><em>Vista del panel administrativo con estadísticas en tiempo real</em></p>
</div>

### Menú Público
- 🍔 Visualización atractiva de productos
- 🏷️ Filtrado por categorías
- 🔍 Búsqueda en tiempo real
- 💰 Precios y descripciones claras

<div align="center">
  <img src="docs/menu-preview.svg" alt="Vista del Menú Público" width="900">
  <p><em>Interfaz del menú público con filtros y catálogo de productos</em></p>
</div>

## 🔒 Seguridad y Validaciones

### Validaciones del Backend
- ✅ Validación de datos de entrada
- ✅ Sanitización de strings
- ✅ Verificación de unicidad (emails, nombres)
- ✅ Manejo de errores robusto

### Validaciones del Frontend
- ✅ Validación en tiempo real
- ✅ Mensajes de error claros
- ✅ Prevención de envíos duplicados

## 📊 Datos de Prueba

La aplicación incluye datos de prueba que se cargan automáticamente:

- **40+ Productos** distribuidos en 5 categorías
- **20 Adicionales** con categorización inteligente
- **10 Clientes** de prueba
- **Relaciones automáticas** entre productos y adicionales

### Categorías de Productos
1. 🍔 **Hamburguesas** (15 variedades)
2. 🌭 **Perros Calientes** (5 variedades)
3. 🍟 **Acompañamientos** (10 opciones)
4. 🥤 **Bebidas** (8 opciones)
5. 🍰 **Postres** (6 opciones)

## 🧪 Testing y Desarrollo

### Ejecutar en Modo Desarrollo
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Acceso a H2 Console
- **URL**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:file:./mydatabase`
- **Usuario**: `sa`
- **Contraseña**: (vacía)

## 🚀 Despliegue

### Generar JAR Ejecutable
```bash
./mvnw clean package
java -jar target/burgur-0.0.1-SNAPSHOT.jar
```

### Variables de Entorno
```bash
export SERVER_PORT=8080
export DB_URL=jdbc:h2:file:./mydatabase
export DB_USERNAME=sa
export DB_PASSWORD=
```

## 📸 Galería de Capturas

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="docs/dashboard-preview.svg" alt="Dashboard" width="400">
        <br><strong>Panel Administrativo</strong>
      </td>
      <td align="center">
        <img src="docs/menu-preview.svg" alt="Menú" width="400">
        <br><strong>Menú Público</strong>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="docs/architecture-diagram.svg" alt="Arquitectura" width="400">
        <br><strong>Arquitectura del Sistema</strong>
      </td>
      <td align="center">
        <img src="burger-club/burgur/src/main/resources/static/images/Logo.png" alt="Logo" width="200">
        <br><strong>Logo del Proyecto</strong>
      </td>
    </tr>
  </table>
</div>

## 🌟 Características Destacadas

<div align="center">
  <table>
    <tr>
      <td align="center" width="25%">
        <h3>🚀 Alto Rendimiento</h3>
        <p>Optimizado con Spring Boot y H2 Database para respuestas rápidas</p>
      </td>
      <td align="center" width="25%">
        <h3>📱 Responsive Design</h3>
        <p>Interfaz adaptable que funciona perfectamente en todos los dispositivos</p>
      </td>
      <td align="center" width="25%">
        <h3>🔒 Seguro y Confiable</h3>
        <p>Validaciones robustas y manejo seguro de datos de usuarios</p>
      </td>
      <td align="center" width="25%">
        <h3>⚡ Fácil de Usar</h3>
        <p>Interfaz intuitiva tanto para clientes como administradores</p>
      </td>
    </tr>
  </table>
</div>

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Santos Arellano**
- GitHub: [@Santos-Arellano](https://github.com/Santos-Arellano)
- Email: arellanosantoso6@gmail.com
- LinkedIn: [Santos Arellano](https://linkedin.com/in/santos-arellano)

## 🙏 Agradecimientos

- Spring Boot Team por el excelente framework
- Bootstrap Team por el framework CSS
- Comunidad de desarrolladores Java

---

<div align="center">
  <p><strong>🍔 Burger Club - Desarrollado con ❤️ y ☕</strong></p>
  <p><em>"La mejor experiencia gastronómica, ahora digital"</em></p>
</div>