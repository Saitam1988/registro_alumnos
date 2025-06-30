class ApiService {
    static API_BASE_URL = "http://localhost:5001/api";
    static API_KEY = "12345ABCDEF";

    static headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ApiService.API_KEY}`
    };

    // Realiza una petición HTTP genérica y maneja errores y respuestas
    static async handleRequest(url, method, body = null) {
        const options = {
            method,
            headers: ApiService.headers
        };
        if (body) options.body = JSON.stringify(body);

        let response;
        try {
            response = await fetch(url, options);
        } catch (err) {
            throw new Error("No se pudo conectar con el servidor.");
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new Error(
                "El servidor respondió con un formato inesperado:\n" +
                text.substring(0, 200)
            );
        }

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Error en la petición ${method} a ${url}`);
        }
        return data;
    }
}

class StudentService extends ApiService {
    // Registra un nuevo estudiante
    static async register(id, name, career, age, email) {
        const url = `${this.API_BASE_URL}/students`;
        return this.handleRequest(url, "POST", { id, name, career, age, email });
    }

    // Obtiene todos los estudiantes, con filtros opcionales
    static async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const url = `${this.API_BASE_URL}/students?${params}`;
        return this.handleRequest(url, "GET");
    }

    // Elimina un estudiante por nombre
    static async deleteByName(name) {
        const url = `${this.API_BASE_URL}/students/by-name/${encodeURIComponent(name)}`;
        return this.handleRequest(url, "DELETE");
    }
}

class CareerService extends ApiService {
    // Registra una nueva carrera
    static async register(id, name, duration, category) {
        const url = `${this.API_BASE_URL}/careers`;
        const payload = { name, duration, category };
        if (id) payload.id = id;
        return this.handleRequest(url, "POST", payload);
    }

    // Obtiene todas las carreras, con filtros opcionales
    static async getAll(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const url = `${this.API_BASE_URL}/careers?${params}`;
        return this.handleRequest(url, "GET");
    }

    // Elimina una carrera por ID
    static async delete(id) {
        const url = `${this.API_BASE_URL}/careers/${id}`;
        return this.handleRequest(url, "DELETE");
    }

    // Actualiza una carrera existente
    static async update(id, name, duration, category) {
        const url = `${this.API_BASE_URL}/careers/${id}`;
        return this.handleRequest(url, "PUT", { name, duration, category });
    }
}

class CategoryService extends ApiService {
    // Registra una nueva categoría
    static async register(name, branch) {
        const url = `${this.API_BASE_URL}/categories`;
        return this.handleRequest(url, "POST", { name, branch });
    }

    // Obtiene todas las categorías
    static async getAll() {
        const url = `${this.API_BASE_URL}/categories`;
        return this.handleRequest(url, "GET");
    }

    // Elimina una categoría por ID
    static async delete(id) {
        const url = `${this.API_BASE_URL}/categories/${id}`;
        return this.handleRequest(url, "DELETE");
    }
}

class StudentUI {
    // Registra un estudiante desde el formulario
    static async register() {
        const id = document.getElementById('registerId').value.trim();
        const name = document.getElementById('registerName').value.trim();
        const career = document.getElementById('registerCareer').value.trim();
        const age = document.getElementById('registerAge').value.trim();
        const email = document.getElementById('registerEmail').value.trim();

        if (!id || !name || !career || !age || !email) {
            this.showAlert('warning', 'Campos Incompletos', 'Por favor, rellena todos los campos para registrar al estudiante.');
            return;
        }

        try {
            const result = await StudentService.register(id, name, career, parseInt(age), email);
            this.showAlert('success', '¡Registro Exitoso!', `Estudiante ${result.name} (${result.id}) registrado correctamente.`);
            this.clearStudentForm();
            this.loadStudents();
        } catch (error) {
            console.error("Error al registrar estudiante:", error);
            this.showAlert('error', 'Error de Registro', error.message || 'Hubo un problema al registrar el estudiante.');
        }
    }

    // Carga y muestra la lista de estudiantes
    static async loadStudents() {
        const studentsTableBody = document.getElementById('studentsTableBody');
        const noStudentsMessage = document.getElementById('noStudentsMessage');
        if (!studentsTableBody || !noStudentsMessage) return;

        studentsTableBody.innerHTML = '';

        const searchById = document.getElementById('searchById')?.value.trim();
        const searchByName = document.getElementById('searchByName')?.value.trim();
        const searchByCareer = document.getElementById('searchByCareer')?.value.trim();

        const filters = {};
        if (searchById) filters.id = searchById;
        if (searchByName) filters.name = searchByName;
        if (searchByCareer) filters.career = searchByCareer;

        try {
            const students = await StudentService.getAll(filters);

            if (students.length === 0) {
                noStudentsMessage.style.display = 'block';
                return;
            }
            noStudentsMessage.style.display = 'none';

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
        } catch (error) {
            console.error("Error al cargar estudiantes:", error);
            this.showAlert('error', 'Error de Carga', error.message || 'No se pudieron cargar los estudiantes.');
        }
    }

    // Filtra la lista de estudiantes según los campos de búsqueda
    static filterStudents() {
        this.loadStudents();
    }

    // Confirma y elimina un estudiante por nombre
    static async confirmDeleteStudent(studentName) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Estás a punto de eliminar a ${studentName}. ¡Esta acción no se puede deshacer!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await StudentService.deleteByName(studentName);
                    this.showAlert('success', '¡Eliminado!', response.message || 'El estudiante ha sido eliminado.');
                    this.loadStudents();
                } catch (error) {
                    console.error("Error al eliminar estudiante:", error);
                    this.showAlert('error', 'Error al Eliminar', error.message || 'No se pudo eliminar al estudiante.');
                }
            }
        });
    }

    // Limpia el formulario de registro de estudiantes
    static clearStudentForm() {
        document.getElementById('registerId').value = '';
        document.getElementById('registerName').value = '';
        document.getElementById('registerCareer').value = '';
        document.getElementById('registerAge').value = '';
        document.getElementById('registerEmail').value = '';
    }

    // Muestra una alerta usando SweetAlert2
    static showAlert(icon, title, text) {
        Swal.fire({ icon, title, text });
    }
}

class CareerUI {
    // Registra o actualiza una carrera desde el formulario
    static async register() {
        const id = document.getElementById('careerId')?.value.trim();
        const name = document.getElementById('careerName')?.value.trim();
        const duration = document.getElementById('careerDuration')?.value.trim();
        const category = document.getElementById('careerCategory')?.value.trim();

        if (!name || !duration || !category) {
            StudentUI.showAlert('warning', 'Campos Incompletos', 'Por favor, rellena el nombre, la duración y la categoría para registrar la carrera.');
            return;
        }

        if (isNaN(duration) || parseInt(duration) <= 0) {
            StudentUI.showAlert('warning', 'Duración Inválida', 'Por favor, ingresa una duración válida (número entero mayor que 0).');
            return;
        }

        try {
            const allCareers = await CareerService.getAll();
            const existingCareer = allCareers.find(c =>
                c.name?.toLowerCase() === name.toLowerCase()
            );

            if (existingCareer) {
                const result = await Swal.fire({
                    icon: 'question',
                    title: 'Carrera Existente',
                    html: `Ya existe una carrera con el nombre <strong>"${name}"</strong>.<br><br>¿Deseas actualizar la carrera existente?`,
                    showCancelButton: true,
                    confirmButtonText: 'Sí, actualizar',
                    cancelButtonText: 'No, cancelar',
                    reverseButtons: true
                });

                if (result.isConfirmed) {
                    const updatedCareer = await CareerService.update(
                        existingCareer.id,
                        name,
                        parseInt(duration),
                        category
                    );

                    StudentUI.showAlert('success', '¡Actualización Exitosa!', `Carrera <strong>"${name}"</strong> actualizada correctamente.`);
                }
            } else {
                const result = await CareerService.register(id, name, parseInt(duration), category);
                StudentUI.showAlert('success', '¡Registro Exitoso!', `Carrera <strong>"${name}"</strong> registrada correctamente.`);
            }

            this.clearCareerForm();
            this.loadCareers();
            this.populateCareersDropdowns();
        } catch (error) {
            console.error("Error al registrar/actualizar carrera:", error);
            let errorMessage = 'Hubo un problema al procesar la solicitud.';

            if (error.message.includes('409') || error.message.includes('Ya existe')) {
                errorMessage = `Ya existe una carrera con el nombre "${name}".`;
            } else if (error.message) {
                errorMessage = error.message;
            }

            StudentUI.showAlert('error', 'Error', errorMessage);
        }
    }

    // Carga y muestra la lista de carreras
    static async loadCareers() {
        const careersTableBody = document.getElementById('careersTableBody');
        const noCareersMessage = document.getElementById('noCareersMessage');

        if (!careersTableBody || !noCareersMessage) return;

        careersTableBody.innerHTML = '';

        const searchCareerById = document.getElementById('searchCareerById')?.value.trim();
        const searchCareerByName = document.getElementById('searchCareerByName')?.value.trim();

        const filters = {};
        if (searchCareerById) filters.id = searchCareerById;
        if (searchCareerByName) filters.name = searchCareerByName;

        try {
            const response = await CareerService.getAll(filters);
            const careers = Array.isArray(response) ? response : [response];

            if (careers.length === 0) {
                noCareersMessage.style.display = 'block';
                return;
            }
            noCareersMessage.style.display = 'none';

            careers.forEach(career => {
                const row = careersTableBody.insertRow();
                row.innerHTML = `
                    <td>${career.id}</td>
                    <td>${career.name}</td>
                    <td>${career.duration}</td>
                    <td>${career.category}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="CareerUI.confirmDeleteCareer('${career.id}')">
                            <i class="bi bi-trash-fill"></i> Eliminar
                        </button>
                    </td>
                `;
            });
        } catch (error) {
            console.error("Error al cargar carreras:", error);
            StudentUI.showAlert('error', 'Error de Carga', error.message || 'No se pudieron cargar las carreras.');
        }
    }

    // Filtra la lista de carreras según los campos de búsqueda
    static filterCareers() {
        this.loadCareers();
    }

    // Confirma y elimina una carrera por ID
    static async confirmDeleteCareer(careerId) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Estás a punto de eliminar la carrera con ID ${careerId}. ¡Esta acción no se puede deshacer!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await CareerService.delete(careerId);
                    StudentUI.showAlert('success', '¡Eliminada!', response.message || 'La carrera ha sido eliminada.');
                    this.loadCareers();
                    this.populateCareersDropdowns();
                } catch (error) {
                    console.error("Error al eliminar carrera:", error);
                    StudentUI.showAlert('error', 'Error al Eliminar', error.message || 'No se pudo eliminar la carrera.');
                }
            }
        });
    }

    // Limpia el formulario de registro de carreras
    static clearCareerForm() {
        document.getElementById('careerId').value = '';
        document.getElementById('careerName').value = '';
        document.getElementById('careerDuration').value = '';
        document.getElementById('careerCategory').value = '';
    }

    // Llena los dropdowns de carreras en los formularios
    static async populateCareersDropdowns() {
        const registerCareerSelect = document.getElementById('registerCareer');
        const searchByCareerSelect = document.getElementById('searchByCareer');

        if (registerCareerSelect) {
            registerCareerSelect.innerHTML = '<option value="">Seleccione una carrera</option>';
        }
        if (searchByCareerSelect) {
            searchByCareerSelect.innerHTML = '<option value="">Buscar por Carrera</option>';
        }

        try {
            const careers = await CareerService.getAll();
            careers.forEach(career => {
                const careerName = career.name;
                if (!careerName) return;

                const optionRegister = document.createElement('option');
                optionRegister.value = careerName;
                optionRegister.textContent = careerName;

                if (registerCareerSelect) {
                    registerCareerSelect.appendChild(optionRegister);
                }

                const optionSearch = document.createElement('option');
                optionSearch.value = careerName;
                optionSearch.textContent = careerName;

                if (searchByCareerSelect) {
                    searchByCareerSelect.appendChild(optionSearch);
                }
            });
        } catch (error) {
            console.error("Error al cargar carreras para dropdowns:", error);
            StudentUI.showAlert('error', 'Error', 'No se pudieron cargar las carreras para los dropdowns.');
        }
    }
}

class CategoryUI {
    // Registra una nueva categoría desde el formulario
    static async register() {
        const name = document.getElementById('categoryName')?.value.trim();
        const branch = document.getElementById('categoryBranch')?.value.trim();

        if (!name || !branch) {
            StudentUI.showAlert('warning', 'Campos Incompletos', 'Por favor, ingresa el nombre y la rama de la categoría.');
            return;
        }

        try {
            const result = await CategoryService.register(name, branch);
            StudentUI.showAlert('success', '¡Registro Exitoso!', `Categoría "${result.name}" (Rama: ${result.branch}) registrada correctamente.`);
            this.clearCategoryForm();
            this.loadCategories();
            this.populateCategoriesDropdowns();
        } catch (error) {
            console.error("Error al registrar categoría:", error);
            StudentUI.showAlert('error', 'Error de Registro', error.message || 'Hubo un problema al registrar la categoría.');
        }
    }

    // Carga y muestra la lista de categorías
    static async loadCategories() {
        const categoriesTableBody = document.getElementById('categoriesTableBody');
        const noCategoriesMessage = document.getElementById('noCategoriesMessage');

        if (!categoriesTableBody || !noCategoriesMessage) return;

        categoriesTableBody.innerHTML = '';

        try {
            const categories = await CategoryService.getAll();

            if (categories.length === 0) {
                noCategoriesMessage.style.display = 'block';
                return;
            }
            noCategoriesMessage.style.display = 'none';

            categories.forEach(category => {
                const row = categoriesTableBody.insertRow();
                row.innerHTML = `
                    <td>${category.id}</td>
                    <td>${category.name}</td>
                    <td>${category.branch}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="CategoryUI.confirmDeleteCategory(${category.id})">
                            <i class="bi bi-trash-fill"></i> Eliminar
                        </button>
                    </td>
                `;
            });
        } catch (error) {
            console.error("Error al cargar categorías:", error);
            StudentUI.showAlert('error', 'Error de Carga', error.message || 'No se pudieron cargar las categorías.');
        }
    }

    // Confirma y elimina una categoría por ID
    static async confirmDeleteCategory(categoryId) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Estás a punto de eliminar la categoría con ID ${categoryId}. ¡Esta acción no se puede deshacer!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await CategoryService.delete(categoryId);
                    StudentUI.showAlert('success', '¡Eliminada!', response.message || 'La categoría ha sido eliminada.');
                    this.loadCategories();
                    this.populateCategoriesDropdowns();
                } catch (error) {
                    console.error("Error al eliminar categoría:", error);
                    StudentUI.showAlert('error', 'Error al Eliminar', error.message || 'No se pudo eliminar la categoría.');
                }
            }
        });
    }

    // Llena el dropdown de categorías en el formulario de carreras
    static async populateCategoriesDropdowns() {
        const careerCategorySelect = document.getElementById('careerCategory');
        if (!careerCategorySelect) return;

        careerCategorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';

        try {
            const categories = await CategoryService.getAll();
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                careerCategorySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar categorías para dropdown:", error);
        }
    }

    // Limpia el formulario de registro de categorías
    static clearCategoryForm() {
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryBranch').value = '';
    }
}

// Inicialización de funciones al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Para la página de estudiantes
    if (document.getElementById('studentsTableBody')) {
        StudentUI.loadStudents();
        CareerUI.populateCareersDropdowns();
    }
    // Para la página de carreras
    if (document.getElementById('careersTableBody')) {
        CareerUI.loadCareers();
        CategoryUI.populateCategoriesDropdowns();
    }
    // Para la página de categorías
    if (document.getElementById('categoriesTableBody')) {
        CategoryUI.loadCategories();
    }
    document.getElementById('currentYear').textContent = new Date().getFullYear();
});