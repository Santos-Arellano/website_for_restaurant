<div align="center">
  
  <div style="background-color: #2d3748; padding: 20px; border-radius: 15px; display: inline-block; margin: 20px 0;">
    <img src="docs/logo.png" alt="Burger Club Logo" width="200" height="200" style="border-radius: 10px;">
  </div>
  
  # 🍔 Burger Club - Sistema de Gestión de Restaurante
  
  <p><em>"La mejor experiencia gastronómica, ahora digital"</em></p>
  
  ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0+-brightgreen)
  ![Java](https://img.shields.io/badge/Java-17+-orange)
  ![H2 Database](https://img.shields.io/badge/H2-Database-blue)
  ![Maven](https://img.shields.io/badge/Maven-Build-red)
  ![Thymeleaf](https://img.shields.io/badge/Thymeleaf-Template-green)
  ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.0+-purple)
  
</div>

## 📋 Descripción del Proyecto

**Burger Club** es un sistema completo de gestión para restaurantes desarrollado con **Spring Boot**. Ofrece una solución integral que permite la administración eficiente de productos, clientes y adicionales, proporcionando tanto una interfaz intuitiva para clientes como un panel administrativo robusto y completo con arquitectura MVC integrada.

### 🎯 Características Principales

- 🍔 **Gestión Completa de Productos**: CRUD completo con categorización automática y gestión de stock
- 🔗 **Sistema Inteligente de Adicionales**: Vinculación automática por categorías compatibles
- 👥 **Gestión Avanzada de Clientes**: Registro, autenticación segura y gestión de perfiles
- 📊 **Panel Administrativo Moderno**: Dashboard interactivo con estadísticas en tiempo real
- 🔍 **Menú Dinámico**: Filtrado inteligente por categorías y búsqueda avanzada en tiempo real
- 🗄️ **Base de Datos Robusta**: Inicialización automática con datos de prueba y persistencia H2
- 🌐 **Arquitectura MVC Integrada**: Controladores unificados que manejan tanto vistas como operaciones de datos
- 📱 **Diseño Responsive**: Interfaz completamente adaptable a móviles, tablets y desktop
- ⚡ **Alto Rendimiento**: Optimizado para respuestas rápidas y experiencia fluida
- 🔒 **Seguridad Integrada**: Validaciones robustas y manejo seguro de datos

## 🏗️ Arquitectura del Sistema

<div align="center">
  <img src="docs/UML%20Restaurante%20(WEB).png" alt="Diagrama UML del Sistema" width="800">
  <br><em>Diagrama UML del Sistema Web</em>
</div>

### 📊 Modelo Entidad-Relación

<div align="center">
  <img src="docs/MER.jpeg" alt="Modelo Entidad-Relación" width="700">
  <br><em>Modelo de Base de Datos</em>
</div>

```
📦 Burger Club
├── 🎯 Frontend (Thymeleaf + Bootstrap)
│   ├── Menú público
│   ├── Sistema de autenticación
│   ├── Panel administrativo
│   └── Perfil de usuario
├── ⚙️ Backend (Spring Boot MVC)
│   ├── Controllers (MVC integrado)
│   ├── Services (Lógica de negocio)
│   ├── Repositories (Acceso a datos)
│   └── Models (Entidades JPA)
└── 🗄️ Base de Datos (H2)
    ├── Productos
    ├── Clientes
    ├── Adicionales
    └── Relaciones
```

## ⚡ Inicio Rápido

¿Quieres probar Burger Club inmediatamente? Sigue estos pasos:

```bash
# 1. Clonar y navegar al proyecto
git clone https://github.com/Santos-Arellano/website_for_restaurant.git
cd website_for_restaurant/burger-club/burgur

# 2. Ejecutar (requiere Java 17+)
./mvnw spring-boot:run

# 3. Abrir en el navegador
# http://localhost:8080
```

¡Listo! 🎉 La aplicación estará funcionando con datos de prueba.

---

## 🚀 Stack Tecnológico

<div align="center">

### 🔧 Backend
| Tecnología | Versión | Propósito |
|------------|---------|----------|
| ![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat&logo=java&logoColor=white) | 17+ | Lenguaje de programación |
| ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.0+-6DB33F?style=flat&logo=spring&logoColor=white) | 3.0+ | Framework principal |
| ![Spring Data JPA](https://img.shields.io/badge/Spring%20Data%20JPA-3.0+-6DB33F?style=flat&logo=spring&logoColor=white) | 3.0+ | Persistencia de datos |
| ![H2 Database](https://img.shields.io/badge/H2-Database-0078D4?style=flat&logo=database&logoColor=white) | 2.1+ | Base de datos en memoria |
| ![Maven](https://img.shields.io/badge/Maven-3.6+-C71A36?style=flat&logo=apache-maven&logoColor=white) | 3.6+ | Gestión de dependencias |

### 🎨 Frontend
| Tecnología | Versión | Propósito |
|------------|---------|----------|
| ![Thymeleaf](https://img.shields.io/badge/Thymeleaf-3.0+-005F0F?style=flat&logo=thymeleaf&logoColor=white) | 3.0+ | Motor de plantillas |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.0+-7952B3?style=flat&logo=bootstrap&logoColor=white) | 5.0+ | Framework CSS |
| ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black) | ES6+ | Interactividad del cliente |
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) | 5 | Estructura de páginas |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | 3 | Estilos y diseño |

</div>

## 🎨 Paleta de Colores

Burger Club utiliza una paleta de colores cuidadosamente seleccionada que refleja la identidad gastronómica del proyecto:

<div align="center">

| Color | Hex | Uso | Vista Previa |
|-------|-----|-----|-------------|
| **Verde Oscuro** | `#12372A` | Encabezados, navegación principal | ![#12372A](https://via.placeholder.com/50x30/12372A/12372A.png) |
| **Rosa Suave** | `#fbb5b5` | Acentos, botones secundarios | ![#fbb5b5](https://via.placeholder.com/50x30/fbb5b5/fbb5b5.png) |
| **Verde Claro** | `#ABDC9F` | Elementos de éxito, confirmaciones | ![#ABDC9F](https://via.placeholder.com/50x30/ABDC9F/ABDC9F.png) |
| **Crema** | `#fbfada` | Fondos, áreas de contenido | ![#fbfada](https://via.placeholder.com/50x30/fbfada/fbfada.png) |

### 📄 Documentación Completa
Para más detalles sobre el uso de colores, consulta: [`burger-club/docs/Paleta de colores burgur.pdf`](burger-club/Paleta%20de%20colores%20burgur.pdf)

</div>

## 📁 Estructura del Proyecto

```
src/main/java/restaurante/example/burgur/
├── 🎮 Controller/
│   ├── AdminController.java          # Panel administrativo
│   ├── AdicionalController.java      # Gestión de adicionales
│   ├── AuthController.java           # Autenticación
│   ├── ClienteController.java        # Gestión de clientes
│   ├── MenuController.java           # Menú público
│   ├── ProductoController.java       # Gestión de productos
│   └── UserController.java           # Perfil de usuario
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

### 📋 Prerrequisitos

- ☕ **Java 17 o superior** - [Descargar OpenJDK](https://openjdk.org/)
- 📦 **Maven 3.6+** - [Instalar Maven](https://maven.apache.org/install.html)
- 🌐 **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
- 💻 **Sistema Operativo**: Windows, macOS, o Linux

### 🚀 Pasos de Instalación

1. **📥 Clonar el repositorio**
   ```bash
   git clone https://github.com/Santos-Arellano/website_for_restaurant.git
   cd website_for_restaurant/burger-club/burgur
   ```

2. **🔧 Verificar Java y Maven**
   ```bash
   java --version
   mvn --version
   ```

3. **📦 Instalar dependencias y compilar**
   ```bash
   ./mvnw clean install
   ```

4. **▶️ Ejecutar la aplicación**
   ```bash
   ./mvnw spring-boot:run
   ```

5. **🌐 Acceder a la aplicación**
   - **🏠 Página Principal**: [http://localhost:8080](http://localhost:8080)
   - **👨‍💼 Panel Administrativo**: [http://localhost:8080/admin](http://localhost:8080/admin)
   - **🗄️ Consola H2**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
   - **📋 Gestión de Productos**: [http://localhost:8080/admin/productos](http://localhost:8080/admin/productos)

> **💡 Tip**: La aplicación se iniciará automáticamente con datos de prueba para que puedas explorar todas las funcionalidades inmediatamente.

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

## 🌐 Rutas y Endpoints

### Rutas Públicas
```http
GET    /                             # Página principal
GET    /menu                         # Menú de productos
GET    /auth/login                   # Página de login
GET    /auth/register                # Página de registro
POST   /auth/login                   # Procesar login
POST   /auth/register                # Procesar registro
```

### Panel Administrativo
```http
GET    /admin                        # Dashboard administrativo
GET    /admin/productos              # Gestión de productos
GET    /admin/clientes               # Gestión de clientes
GET    /admin/adicionales            # Gestión de adicionales
POST   /admin/productos              # Crear producto
PUT    /admin/productos/{id}         # Actualizar producto
DELETE /admin/productos/{id}         # Eliminar producto
GET    /admin/clientes/{id}          # Obtener cliente
POST   /admin/clientes               # Crear cliente
PUT    /admin/clientes/{id}          # Actualizar cliente
DELETE /admin/clientes/{id}          # Eliminar cliente
GET    /admin/adicionales/list       # Listar adicionales
POST   /admin/adicionales            # Crear adicional
PUT    /admin/adicionales/{id}       # Actualizar adicional
DELETE /admin/adicionales/{id}       # Eliminar adicional
```

### Perfil de Usuario
```http
GET    /profile                      # Página de perfil
POST   /profile/update               # Actualizar perfil
POST   /profile/change-password      # Cambiar contraseña
POST   /profile/delete               # Eliminar cuenta
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
  <img src="docs/dashboard-preview.png" alt="Vista del Dashboard Administrativo" width="900">
  <p><em>Vista del panel administrativo con estadísticas en tiempo real</em></p>
</div>

### Menú Público
- 🍔 Visualización atractiva de productos
- 🏷️ Filtrado por categorías
- 🔍 Búsqueda en tiempo real
- 💰 Precios y descripciones claras

<div align="center">
  <img src="docs/menu-preview.png" alt="Vista del Menú Público" width="900">
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

- **40 Productos** distribuidos en 5 categorías
- **20 Adicionales** con categorización inteligente
- **10 Clientes** de prueba
- **320 Relaciones** automáticas entre productos y adicionales

### Categorías de Productos
1. 🍔 **Hamburguesas** - Variedad de hamburguesas gourmet
2. 🌭 **Perros Calientes** - Hot dogs especiales
3. 🍟 **Acompañamientos** - Papas, aros de cebolla, etc.
4. 🥤 **Bebidas** - Refrescos, jugos y bebidas especiales
5. 🍰 **Postres** - Dulces y postres caseros

### Inicialización Automática
Al iniciar la aplicación, verás en la consola:
```
Database initialization completed successfully!
Statistics: 40 productos, 10 clientes, 20 adicionales, 320 relaciones producto-adicional
```

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
        <img src="docs/dashboard-preview.png" alt="Dashboard" width="400">
        <br><strong>Panel Administrativo</strong>
      </td>
      <td align="center">
        <img src="docs/menu-preview.png" alt="Menú" width="400">
        <br><strong>Menú Público</strong>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="docs/UML%20Restaurante%20(WEB).png" alt="UML" width="400">
        <br><strong>Diagrama UML</strong>
      </td>
      <td align="center">
        <img src="docs/MER.jpeg" alt="MER" width="400">
        <br><strong>Modelo Entidad-Relación</strong>
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
        <p>Arquitectura MVC optimizada con Spring Boot y H2 Database para respuestas rápidas</p>
      </td>
      <td align="center" width="25%">
        <h3>📱 Responsive Design</h3>
        <p>Interfaz adaptable que funciona perfectamente en todos los dispositivos</p>
      </td>
      <td align="center" width="25%">
        <h3>🔒 Seguro y Confiable</h3>
        <p>Validaciones HTML5 y backend robustas con manejo seguro de datos</p>
      </td>
      <td align="center" width="25%">
        <h3>⚡ Fácil de Usar</h3>
        <p>Interfaz intuitiva con gestión de perfiles y panel administrativo completo</p>
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

## 👨‍💻 Autores

**Santos Arellano**
- GitHub: [@Santos-Arellano](https://github.com/Santos-Arellano)
- Email: arellanosantoso6@gmail.com
- LinkedIn: [Santos Arellano](https://linkedin.com/in/santos-arellano)

**David León**
- GitHub: [@NIxved](https://github.com/NIxved)
- Email: eoleonvelasquez@gmail.com

**Andrés Felipe Trujillo**
- GitHub: [@TruHe-7](https://github.com/TruHe-7)
- Email: afruhe@gmail.com

## 📈 Roadmap y Futuras Mejoras

### ✅ Completado
- [x] 🏠 **Sistema de Gestión Completo**: CRUD para productos, clientes y adicionales
- [x] 👤 **Gestión de Perfiles**: Actualización de datos, cambio de contraseña y eliminación de cuenta
- [x] 🔐 **Autenticación Segura**: Login y registro con validaciones robustas
- [x] 📊 **Panel Administrativo**: Dashboard con estadísticas y gestión completa
- [x] 🎨 **Interfaz Moderna**: Diseño responsive con Bootstrap 5

### 🚧 En Desarrollo
- [ ] 🛒 **Sistema de Carrito de Compras**: Implementación completa del carrito
- [ ] 💳 **Integración de Pagos**: Pasarelas de pago (PayPal, Stripe)
- [ ] 📧 **Sistema de Notificaciones**: Email y SMS para pedidos

### 🔮 Futuras Mejoras
- [ ] 📱 **App Móvil**: Aplicación nativa para iOS y Android
- [ ] 🔔 **Notificaciones Push**: Alertas en tiempo real
- [ ] 📊 **Analytics Avanzados**: Reportes detallados de ventas
- [ ] 🌍 **Internacionalización**: Soporte multi-idioma
- [ ] 🔐 **OAuth2**: Login con Google, Facebook, GitHub

## 🤝 Contribuir al Proyecto

¡Las contribuciones son bienvenidas! Aquí te explicamos cómo puedes ayudar:

### 🐛 Reportar Bugs
1. Busca si el issue ya existe
2. Crea un nuevo issue con detalles específicos
3. Incluye pasos para reproducir el problema

### ✨ Proponer Nuevas Características
1. Abre un issue describiendo la funcionalidad
2. Explica el caso de uso y beneficios
3. Espera feedback antes de implementar

### 🔧 Proceso de Desarrollo
```bash
# 1. Fork el repositorio
# 2. Crear rama para tu feature
git checkout -b feature/nueva-caracteristica

# 3. Realizar cambios y commits
git commit -m "feat: agregar nueva característica"

# 4. Push y crear Pull Request
git push origin feature/nueva-caracteristica
```

## 🙏 Agradecimientos

- 🌱 **Spring Boot Team** - Por el excelente framework
- 🎨 **Bootstrap Team** - Por el framework CSS responsive
- ☕ **Comunidad Java** - Por el apoyo y recursos
- 🚀 **GitHub** - Por la plataforma de desarrollo colaborativo

---

<div align="center">
  
  ### 🍔 Burger Club
  
  **Desarrollado con ❤️ y ☕ por [Santos Arellano](https://github.com/Santos-Arellano) [David León](https://github.com/NIxved) [Andrés Felipe Trujillo](https://github.com/TruHe-7)**
    
  *"La mejor experiencia gastronómica, ahora digital"*
  
  [![GitHub](https://img.shields.io/badge/GitHub-Santos--Arellano-181717?style=flat&logo=github)](https://github.com/Santos-Arellano)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Santos%20Arellano-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/santos-arellano)
  [![Email](https://img.shields.io/badge/Email-arellanosantoso6%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:arellanosantoso6@gmail.com)

  [![GitHub](https://img.shields.io/badge/GitHub-NIxved-181717?style=flat&logo=github)](https://github.com/NIxved)
  [![Email](https://img.shields.io/badge/Email-eoleonvelasquez%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:eoleonvelasquez@gmail.com)

  [![GitHub](https://img.shields.io/badge/GitHub-TruHe--7-181717?style=flat&logo=github)](https://github.com/TruHe-7)
  [![Email](https://img.shields.io/badge/Email-afruhe%40gmail.com-EA4335?style=flat&logo=gmail&logoColor=white)](mailto:afruhe@gmail.com)
    
  ---
  
  **⭐ Si te gusta este proyecto, ¡dale una estrella! ⭐**
  
</div>
</div>