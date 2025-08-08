require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Importar el paquete cors

const app = express();
const port = process.env.PORT || 3000;

// Validar la API Key de Gemini al inicio
if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: La variable de entorno GEMINI_API_KEY no está configurada.');
    console.error('Por favor, crea un archivo .env en la carpeta backend con GEMINI_API_KEY=TU_CLAVE_AQUI');
    process.exit(1); // Salir de la aplicación si la clave no está configurada
}

// Configuración de Multer para la subida de archivos
const upload = multer({ dest: 'uploads/' });

// Configuración de la API de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Usar el middleware cors

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Backend del Optimizador de Prompts funcionando!');
});

// Ruta para la subida de archivos y procesamiento con IA
app.post('/upload', upload.single('document'), async (req, res) => {
    let fileContent = '';
    const { promptText, promptType, specificInstructions } = req.body; // Obtener datos del formulario

    // Si se subió un archivo, procesarlo
    if (req.file) {
        const filePath = req.file.path;
        const originalFileName = req.file.originalname;
        const fileExtension = path.extname(originalFileName).toLowerCase();

        try {
            if (fileExtension === '.txt') {
                fileContent = fs.readFileSync(filePath, 'utf8');
            } else {
                fs.unlinkSync(filePath); // Eliminar archivo no soportado
                console.error(`Tipo de archivo no soportado: ${fileExtension}`);
                return res.status(400).json({ error: 'Tipo de archivo no soportado. Solo .txt.' });
            }
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Asegurarse de eliminar el archivo temporal en caso de error
            }
            return res.status(500).json({ error: 'Error al leer el contenido del archivo.' });
        } finally {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Eliminar archivo temporal después de procesar
            }
        }
    } else if (promptText) {
        // Si no hay archivo, pero hay texto directo del prompt
        fileContent = promptText;
    } else {
        console.error('No se recibió archivo ni texto de prompt.');
        return res.status(400).json({ error: 'No se ha subido ningún archivo ni se ha proporcionado texto de prompt.' });
    }

    // Construir el prompt para Gemini basado en la intención del usuario y reglas de prompting
    let geminiPrompt = `Eres un experto en ingeniería de prompts y tu tarea es transformar el siguiente contenido/idea en un prompt optimizado para un modelo de IA. El prompt optimizado debe ser claro, conciso, completo y seguir las mejores prácticas de prompting, incluyendo:
- **Rol:** Define un rol claro para la IA si es relevante.
- **Tarea:** Describe la tarea principal de forma inequívoca.
- **Contexto:** Proporciona cualquier información de fondo necesaria.
- **Formato de Salida:** Especifica cómo debe ser la respuesta (ej. lista, código, resumen, tabla).
- **Tono:** Si es aplicable (ej. formal, creativo, técnico).
- **Restricciones/Condiciones:** Cualquier limitación o requisito específico.

Contenido/Idea base para el prompt:

${fileContent}

`;

    switch (promptType) {
        case 'summary':
            geminiPrompt += `La intención del usuario es obtener un resumen o síntesis. El prompt optimizado debe pedir un resumen conciso y preciso del contenido.`;
            break;
        case 'code':
            geminiPrompt += `La intención del usuario es generar código. El prompt optimizado debe especificar el lenguaje de programación, la funcionalidad deseada y cualquier requisito técnico.`;
            break;
        case 'roleplay':
            geminiPrompt += `La intención del usuario es crear un rol o personaje. El prompt optimizado debe describir las características, personalidad, habilidades y contexto del rol.`;
            break;
        case 'explanation':
            geminiPrompt += `La intención del usuario es obtener una explicación o definición. El prompt optimizado debe pedir una explicación clara, sencilla y con ejemplos si es posible.`;
            break;
        case 'brainstorm':
            geminiPrompt += `La intención del usuario es generar ideas o realizar un brainstorming. El prompt optimizado debe fomentar la creatividad, la diversidad de ideas y el formato de salida deseado para las ideas.`;
            break;
        case 'image_description':
            geminiPrompt += `La intención del usuario es generar una descripción detallada para una IA generadora de imágenes. El prompt optimizado debe ser altamente descriptivo, visual y especificar el estilo o elementos clave de la imagen.`;
            break;
        case 'general':
        default:
            geminiPrompt += `La intención del usuario es una optimización general del prompt, aplicando las mejores prácticas.`;
            break;
    }

    if (specificInstructions) {
        geminiPrompt += `

Instrucciones adicionales del usuario para la optimización: ${specificInstructions}`; 
    }

    geminiPrompt += `

Ahora, genera el prompt optimizado. Tu respuesta debe contener ÚNICAMENTE el prompt optimizado, sin ninguna introducción, explicación o texto adicional.`;

    try {
        const model = genAI.getGenerativeModel({ model: 