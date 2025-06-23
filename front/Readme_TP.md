──────────────────────────────────────────────────────────────
📚 Descripción del Proyecto: Sistema de Gestión Universitaria 🎓
──────────────────────────────────────────────────────────────

Introducción al Proyecto 🚀

El proyecto consiste en una aplicación web para la gestión de estudiantes, carreras y categorías dentro de una institución universitaria, denominada "Universidad de Chascomús" o "Instituto 57".  
La aplicación está desarrollada utilizando **HTML**, **CSS** (con Bootstrap5 y estilos personalizados) y **JavaScript puro** para la lógica del frontend y la interacción con una API RESTful (simulada con `localhost:5001/api`).

El sistema permite una gestión integral, incluyendo:

- **Gestión de Estudiantes 👩‍🎓👨‍🎓:** Registrar, visualizar, buscar y eliminar estudiantes.  
  Cada estudiante tiene un ID, nombre, carrera asociada, edad y email.

- **Gestión de Carreras 🏫:** Registrar, visualizar, buscar, actualizar y eliminar carreras.  
  Las carreras tienen un ID, nombre, duración en años y una categoría asociada.

- **Gestión de Categorías 🗂️:** Registrar, visualizar y eliminar categorías de carreras.  
  Cada categoría tiene un ID, nombre y una rama a la que pertenece.

La interfaz de usuario es intuitiva y sigue principios de diseño responsivo, adaptándose a diferentes tamaños de pantalla 📱💻.  
Se utiliza **SweetAlert2** para mostrar notificaciones 🔔 al usuario sobre el éxito o fracaso de las operaciones, ofreciendo una experiencia interactiva y clara.

──────────────────────────────
🧩 Componentes del Proyecto
──────────────────────────────

1. **Interfaz de Usuario (HTML y CSS) 🎨**

Las páginas HTML son la estructura visual de la aplicación:

- **Inicio.HTML:** La página de bienvenida 👋, con una descripción general del instituto, sus ofertas educativas y un mapa de contacto 🗺️.
- **index.html (Gestión de Estudiantes):** Permite registrar 📝 nuevos estudiantes, ver una tabla 📋 con los estudiantes registrados y filtrarlos por ID, nombre o carrera.
- **carreras.html (Gestión de Carreras):** Ofrece funcionalidades para registrar y actualizar carreras, listarlas en una tabla y filtrarlas por ID o nombre. También permite seleccionar categorías preexistentes de manera dinámica.
- **categorias.html (Gestión de Categorías):** Facilita el registro de nuevas categorías de carreras y muestra una tabla con las categorías existentes.

Los estilos (`university.css` y estilos incrustados en HTML) proporcionan una estética moderna y limpia, utilizando degradados, sombras y esquinas redondeadas para mejorar la experiencia visual ✨.  
Se integra Bootstrap para componentes de interfaz de usuario y un sistema de rejilla responsivo.

2. **Lógica del Frontend (JavaScript - app.js) 🧠**

El archivo `app.js` es el cerebro interactivo del lado del cliente. Está estructurado en varias clases para modularizar el código y mejorar su mantenimiento:

- **ApiService:** Clase base 🏗️ que maneja las peticiones HTTP genéricas (GET, POST, PUT, DELETE) a la API. Incluye la gestión de headers (como la API Key) y el manejo centralizado de errores de red y de respuesta JSON, garantizando robustez en las comunicaciones.
- **StudentService:** Extiende ApiService y proporciona métodos específicos para interactuar con el endpoint de estudiantes (registrar, obtener todos, eliminar por nombre).
- **CareerService:** Extiende ApiService y define métodos para gestionar las carreras (registrar/actualizar, obtener todas, eliminar por ID). Incluye una lógica inteligente para detectar carreras existentes y ofrecer la opción de actualización.
- **CategoryService:** Extiende ApiService y maneja las operaciones CRUD (Crear, Leer, Actualizar, Borrar) para las categorías (registrar, obtener todas, eliminar por ID).
- **StudentUI, CareerUI, CategoryUI:** Estas clases encapsulan la lógica de la interfaz de usuario para cada sección. Sus responsabilidades incluyen:
  - Capturar datos de los formularios 📝.
  - Llamar a los servicios (StudentService, CareerService, CategoryService) para realizar las operaciones.
  - Actualizar dinámicamente las tablas en la interfaz de usuario.
  - Manejar los dropdowns (`<select>`) para cargar opciones de carreras y categorías de forma dinámica y actualizada.
  - Mostrar alertas al usuario utilizando SweetAlert2 para confirmaciones (ej. eliminación) y mensajes de éxito/error, mejorando la retroalimentación visual.
  - Implementar la funcionalidad de filtrado 🔍 en tiempo real en las tablas para una búsqueda eficiente.

──────────────────────────────
🤖 IA Utilizadas
──────────────────────────────

Para el desarrollo de este proyecto, se emplearon diversas herramientas de Inteligencia Artificial como colaboradores clave, asistiendo en la generación de código, la refactorización, la depuración y la creación de contenido:

- **Google Gemini 🪐**
  - Rol principal: Conceptualización de la arquitectura, generación de estructuras de código iniciales (clases de servicios y UI), sugerencias para la mejora de la interacción del usuario y la redacción de la documentación.
  - Impacto: Su capacidad para entender contextos complejos y generar soluciones integrales fue fundamental para la base del proyecto.

- **GitHub Copilot 🤖💡**
  - Rol principal: Autocompletado de código en tiempo real, lo que aceleró significativamente el proceso de escritura de funciones, bucles y estructuras condicionales en JavaScript y HTML.
  - Impacto: Ayudó a mantener la consistencia en el estilo de codificación y a reducir el tiempo de desarrollo.

- **DeepSeek Coder 🧑‍💻**
  - Rol principal: Empleado para refactorizar bloques de código específicos, optimizar el rendimiento de algunas funciones de manipulación del DOM y para identificar posibles mejoras en la claridad y eficiencia del JavaScript.
  - Impacto: Contribuyó a la mejora de la calidad del código y la optimización del rendimiento.

- **ChatGPT 📝**
  - Rol principal: Usado para generar texto descriptivo para las páginas HTML (títulos, párrafos de bienvenida, descripciones de características), así como para obtener ideas sobre la organización de la interfaz de usuario y mensajes de error amigables.
  - Impacto: Facilitó la creación de contenido coherente y atractivo para el usuario.

──────────────────────────────
🗃️ Prompts de IA (Caja de Prompts)
──────────────────────────────

A continuación, se presentan ejemplos de prompts que fueron utilizados con las diferentes inteligencias artificiales durante el desarrollo del proyecto.

**Prompts con Google Gemini 🪐**
- Prompt para Estructura Inicial de ApiService:  
  "Necesito una clase JavaScript llamada ApiService que maneje peticiones HTTP (GET, POST, PUT, DELETE) a una API RESTful. Debe incluir un base URL y un API Key en los headers. La clase debe tener un método estático 'handleRequest' que reciba la URL, el método HTTP y un cuerpo opcional, y maneje tanto las respuestas exitosas como los errores (de red, de respuesta no JSON, y errores de la API en el JSON de respuesta)."

- Prompt para Lógica de Registro de Estudiante:  
  "Crea una función asíncrona en una clase JavaScript 'StudentUI' que tome los valores de los campos de un formulario (ID, nombre, carrera, edad, email) y los envíe a un servicio 'StudentService.register'. Incluye validación básica de campos vacíos y muestra alertas (usando SweetAlert2) para éxito o error. Después de un registro exitoso, la tabla de estudiantes debe recargarse y el formulario limpiarse."

- Prompt para Actualización de Carreras y Manejo de Conflictos (409):  
  "En la clase CareerUI, modifica el método 'register' para que, antes de registrar una nueva carrera, verifique si ya existe una carrera con el mismo nombre. Si existe, en lugar de un error, debe preguntar al usuario (con SweetAlert2) si desea actualizar la carrera existente con los nuevos datos. Si el usuario confirma, llama a 'CareerService.update' con el ID de la carrera existente. Maneja los errores específicos de conflicto (código 409 o mensaje 'Ya existe')."

**Prompts con ChatGPT 📝**
- Prompt para Contenido de la Página de Inicio (Inicio.HTML):  
  "Genera contenido para la página principal de una universidad ficticia llamada 'Instituto 57'. Incluye un título principal, un párrafo de bienvenida, tres secciones destacadas (por ejemplo, 'Oferta Educativa', 'Comunidad', 'Instalaciones') con un ícono, título y breve descripción para cada una. También añade un párrafo 'Acerca de nosotros' y una sección de contacto con dirección, teléfono, email y horario."

- Prompt para Mensajes de Alerta:  
  "Redacta mensajes claros y amigables para alertas de usuario (usando SweetAlert2) en una aplicación de gestión universitaria. Necesito mensajes para: - Registro exitoso de estudiante/carrera/categoría. - Eliminación exitosa. - Campos de formulario incompletos. - Error al conectar con el servidor. - Error genérico al registrar/eliminar."

**Prompts con GitHub Copilot 🤖**
- Autocompletado de bucle forEach para tablas:  
  Sugerencia de Copilot:  
  students.forEach(student => {
    const row = studentsTableBody.insertRow();
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.career}</td>
      <td>${student.age}</td>
      <td>${student.email}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="StudentUI.confirmDeleteStudent('${student.name}')">
          <i class="bi bi-trash-fill"></i> Eliminar
        </button>
      </td>
    `;
  });

- Generación de URLSearchParams:  
  Sugerencia de Copilot:  
  static async getAll(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${this.API_BASE_URL}/students?${params}`;
    return this.handleRequest(url, "GET");
  }

**Prompts con DeepSeek Coder 🧑‍💻**
- Refactorización de handleRequest para contentType:  
  "Analiza el siguiente fragmento de código JavaScript de una función 'handleRequest' y sugiere mejoras para el manejo de la verificación del tipo de contenido de la respuesta. Asegúrate de que sea robusto y capture diferentes escenarios."  
  * (DeepSeek sugirió la inclusión de !contentType para manejar casos donde el header no está presente y el substring para evitar errores en respuestas muy largas.)

- Optimización del filtrado de datos en loadStudents:  
  "Revisa la función `loadStudents` en la clase `StudentUI`. ¿Hay alguna forma de optimizar la lógica de filtrado si la cantidad de estudiantes es muy grande, o si los filtros se vuelven más complejos? Considera el rendimiento y la legibilidad."  
  * (DeepSeek confirmó que el enfoque actual es adecuado para conjuntos de datos pequeños a medianos, pero sugirió que para grandes volúmenes, los filtros deberían ser aplicados en el backend.)

──────────────────────────────────────────────────────────────