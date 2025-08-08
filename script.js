document.addEventListener('DOMContentLoaded', () => {
    const inputPrompt = document.getElementById('input-prompt');
    const optimizeButton = document.getElementById('optimize-button');
    const outputPrompt = document.getElementById('output-prompt');
    const copyButton = document.getElementById('copy-button');
    const fileUpload = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');

    // URL de tu backend. ¡IMPORTANTE! Cambia esto cuando despliegues tu backend. 
    const BACKEND_URL = 'http://localhost:3000'; 

    optimizeButton.addEventListener('click', () => {
        const originalPrompt = inputPrompt.value;
        if (originalPrompt.trim() === '') {
            alert('Por favor, introduce un prompt o carga un archivo.');
            return;
        }

        // Si hay un archivo seleccionado, la optimización se hará vía backend
        if (fileUpload.files.length > 0) {
            handleFileUpload(fileUpload.files[0]);
        } else {
            // Si no hay archivo, usa la lógica de optimización del frontend
            const optimizedPrompt = optimizarPromptFrontend(originalPrompt);
            outputPrompt.value = optimizedPrompt;
        }
    });

    copyButton.addEventListener('click', () => {
        outputPrompt.select();
        outputPrompt.setSelectionRange(0, 99999); // For mobile devices
        navigator.clipboard.writeText(outputPrompt.value)
            .then(() => {
                alert('¡Prompt copiado al portapapeles!');
            })
            .catch(err => {
                console.error('Error al copiar: ', err);
                alert('No se pudo copiar el prompt. Por favor, cópialo manualmente.');
            });
    });

    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            // Cuando se selecciona un archivo, automáticamente lo enviamos al backend
            handleFileUpload(file);
        } else {
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            inputPrompt.value = '';
        }
    });

    async function handleFileUpload(file) {
        const formData = new FormData();
        formData.append('document', file);

        outputPrompt.value = 'Cargando y optimizando prompt con IA... Por favor, espera...';
        inputPrompt.value = ''; // Limpiar el input principal

        try {
            const response = await fetch(`${BACKEND_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            outputPrompt.value = data.optimizedPrompt;

        } catch (error) {
            console.error('Error al subir el archivo o comunicarse con el backend:', error);
            outputPrompt.value = `Error al procesar el archivo: ${error.message}. Asegúrate de que el backend esté funcionando y la API Key de Gemini esté configurada.`;
            alert(`Error: ${error.message}`);
        }
    }

    // Esta función ahora solo se usa para prompts escritos directamente en el frontend
    function optimizarPromptFrontend(prompt) {
        let rol = "Eres un asistente experto.";
        let instruccionesAdicionales = [
            "Proporciona una respuesta clara y concisa.",
            "Si es un tema complejo, divídelo en puntos clave.",
            "Asegúrate de que el tono sea profesional y útil."
        ];
        let formatoSalida = "Texto plano.";

        const lowerCasePrompt = prompt.toLowerCase();

        if (lowerCasePrompt.includes("código") || lowerCasePrompt.includes("code") || lowerCasePrompt.includes("programar")) {
            rol = "Eres un programador experto y asistente de codificación.";
            instruccionesAdicionales.push("Proporciona el código completo y funcional.", "Incluye comentarios si es necesario.");
            formatoSalida = "Bloque de código en el lenguaje especificado.";
        } else if (lowerCasePrompt.includes("resume") || lowerCasePrompt.includes("resumen") || lowerCasePrompt.includes("sintetiza")) {
            rol = "Eres un experto en síntesis de información.";
            instruccionesAdicionales.push("El resumen debe ser conciso y capturar los puntos clave.", "No excedas las 5 oraciones.");
            formatoSalida = "Resumen en texto plano.";
        } else if (lowerCasePrompt.includes("lista") || lowerCasePrompt.includes("enumera") || lowerCasePrompt.includes("elementos")) {
            rol = "Eres un asistente organizador.";
            instruccionesAdicionales.push("Presenta la información en formato de lista numerada o con viñetas.");
            formatoSalida = "Lista.";
        } else if (lowerCasePrompt.includes("explica") || lowerCasePrompt.includes("definir") || lowerCasePrompt.includes("qué es")) {
            rol = "Eres un educador y experto en explicaciones claras.";
            instruccionesAdicionales.push("Explica el concepto de manera sencilla y con ejemplos si es posible.", "Evita la jerga técnica innecesaria.");
            formatoSalida = "Explicación detallada.";
        }

        const promptOptimizado = `**Rol:** ${rol}

**Tarea:** ${prompt}

**Instrucciones Adicionales:**
${instruccionesAdicionales.map(inst => `- ${inst}`).join('\n')}

**Formato de Salida Deseado:** ${formatoSalida}`;

        return promptOptimizado;
    }
});