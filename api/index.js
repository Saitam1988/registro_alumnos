const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5001;

const API_KEY = "12345ABCDEF";

app.use(cors());
app.use(express.json());

const STUDENTS_FILE = path.join(__dirname, 'students.json');
const CAREERS_FILE = path.join(__dirname, 'careers.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

function authenticateApiKey(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing.' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== API_KEY) {
        return res.status(403).json({ error: 'Invalid API Key.' });
    }
    next();
}

function loadData(filePath) {
    try {
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error loading data from ${filePath}:`, error);
        return [];
    }
}

function saveData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving data to ${filePath}:`, error);
    }
}

// --- Estudiantes ---
app.post('/api/students', authenticateApiKey, (req, res) => {
    let students = loadData(STUDENTS_FILE);
    const { id, name, career, age, email } = req.body;

    if (!id || !name || !career || age === undefined || !email) {
        return res.status(400).json({ error: "Todos los campos (id, nombre, carrera, edad, email) son obligatorios." });
    }

    if (students.some(s => s.id == id)) {
        return res.status(409).json({ error: `El ID '${id}' ya está registrado.` });
    }
    if (students.some(s => s.email === email)) {
        return res.status(409).json({ error: `El email '${email}' ya está registrado.` });
    }

    const newStudent = { id, name, career, age: parseInt(age), email };
    students.push(newStudent);
    saveData(STUDENTS_FILE, students);
    res.status(201).json(newStudent);
});

app.get('/api/students', authenticateApiKey, (req, res) => {
    let students = loadData(STUDENTS_FILE);
    const { career, name, id } = req.query;
    let filtered = students;

    if (id) filtered = filtered.filter(s => s.id.toString().toLowerCase().includes(id.toLowerCase()));
    if (career) filtered = filtered.filter(s => s.career.toLowerCase().includes(career.toLowerCase()));
    if (name) filtered = filtered.filter(s => s.name.toLowerCase().includes(name.toLowerCase()));

    res.status(200).json(filtered);
});

app.delete('/api/students/by-name/:name', authenticateApiKey, (req, res) => {
    let students = loadData(STUDENTS_FILE);
    const nameToDelete = decodeURIComponent(req.params.name);
    const initialLength = students.length;
    students = students.filter(s => s.name.toLowerCase() !== nameToDelete.toLowerCase());

    if (students.length === initialLength) {
        return res.status(404).json({ error: `Estudiante con nombre '${nameToDelete}' no encontrado para eliminar.` });
    }
    saveData(STUDENTS_FILE, students);
    res.status(200).json({ message: `Estudiante '${nameToDelete}' eliminado exitosamente.` });
});

// --- Carreras ---
app.post('/api/careers', authenticateApiKey, (req, res) => {
    let careers = loadData(CAREERS_FILE);
    let { id, name, duration, category } = req.body;

    if (!name || !duration || !category) {
        return res.status(400).json({ error: "El nombre, la duración y la categoría de la carrera son obligatorios." });
    }
    if (isNaN(duration) || Number(duration) < 1) {
        return res.status(400).json({ error: "Ingresa una duración válida (número entero >=1)." });
    }
    if (careers.some(c => c.name && c.name.toLowerCase() === name.toLowerCase())) {
        return res.status(409).json({ error: "Ya existe una carrera con ese nombre." });
    }

    if (!id) {
        id = careers.length > 0 ? Math.max(...careers.map(c => parseInt(c.id || c.ID || 0)).filter(Number.isFinite)) + 1 : 1;
    } else {
        if (careers.some(c => c.id == id)) {
            return res.status(409).json({ error: `El ID de carrera '${id}' ya está registrado.` });
        }
    }

    const newCareer = { id: parseInt(id), name, duration: parseInt(duration), category };
    careers.push(newCareer);
    saveData(CAREERS_FILE, careers);
    res.status(201).json(newCareer);
});

app.get('/api/careers', authenticateApiKey, (req, res) => {
    let careers = loadData(CAREERS_FILE);
    const { name, id } = req.query;
    let filtered = careers;

    if (name) filtered = filtered.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
    if (id) filtered = filtered.filter(c => c.id == id);

    res.status(200).json(filtered);
});

app.put('/api/careers/:id', authenticateApiKey, (req, res) => {
    let careers = loadData(CAREERS_FILE);
    const id = parseInt(req.params.id);
    const { name, duration, category } = req.body;

    const idx = careers.findIndex(c => c.id == id);
    if (idx === -1) {
        return res.status(404).json({ error: "Carrera no encontrada para actualizar." });
    }
    if (careers.some(c => c.name.toLowerCase() === name.toLowerCase() && c.id != id)) {
        return res.status(409).json({ error: "Ya existe una carrera con ese nombre." });
    }
    if (!name || !duration || !category) {
        return res.status(400).json({ error: "El nombre, la duración y la categoría de la carrera son obligatorios." });
    }
    if (isNaN(duration) || Number(duration) < 1) {
        return res.status(400).json({ error: "Ingresa una duración válida (número entero >=1)." });
    }

    careers[idx] = { id, name, duration: parseInt(duration), category };
    saveData(CAREERS_FILE, careers);
    res.status(200).json(careers[idx]);
});

app.delete('/api/careers/:id', authenticateApiKey, (req, res) => {
    let careers = loadData(CAREERS_FILE);
    let students = loadData(STUDENTS_FILE);
    const id = parseInt(req.params.id);
    const initialLength = careers.length;

    const careerToDelete = careers.find(c => c.id == id);
    if (careerToDelete && students.some(s => s.career === careerToDelete.name)) {
        return res.status(409).json({ error: "No se puede eliminar la carrera porque hay estudiantes asociados a ella." });
    }

    careers = careers.filter(c => c.id != id);

    if (careers.length === initialLength) {
        return res.status(404).json({ error: "Carrera no encontrada para eliminar." });
    }
    saveData(CAREERS_FILE, careers);
    res.status(200).json({ message: "Carrera eliminada exitosamente." });
});

// --- Categorías ---
app.post('/api/categories', authenticateApiKey, (req, res) => {
    let categories = loadData(CATEGORIES_FILE);
    const { name, branch } = req.body;

    if (!name || !branch) {
        return res.status(400).json({ error: "El nombre y la rama de la categoría son obligatorios." });
    }
    if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        return res.status(409).json({ error: "Ya existe esa categoría." });
    }

    const newCategory = { id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1, name, branch };
    categories.push(newCategory);
    saveData(CATEGORIES_FILE, categories);
    res.status(201).json(newCategory);
});

app.get('/api/categories', authenticateApiKey, (req, res) => {
    let categories = loadData(CATEGORIES_FILE);
    res.status(200).json(categories);
});

app.delete('/api/categories/:id', authenticateApiKey, (req, res) => {
    let categories = loadData(CATEGORIES_FILE);
    const id = parseInt(req.params.id);
    const initialLength = categories.length;

    categories = categories.filter(cat => cat.id !== id);

    if (categories.length === initialLength) {
        return res.status(404).json({ error: "Categoría no encontrada para eliminar." });
    }
    saveData(CATEGORIES_FILE, categories);
    res.status(200).json({ message: "Categoría eliminada exitosamente." });
});

// --- Servidor ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
