document.addEventListener('DOMContentLoaded', () => {
    const inputPrompt = document.getElementById('input-prompt');
    const optimizeButton = document.getElementById('optimize-button');
    const outputPrompt = document.getElementById('output-prompt');
    const copyButton = document.getElementById('copy-button');
    const fileUpload = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');

    optimizeButton.addEventListener('click', () => {
        const originalPrompt = inputPrompt.value;
        if (originalPrompt.trim() === '') {
            alert('Por favor, introduce un prompt o carga un archivo.');
            return;
        }

        const optimizedPrompt = optimizarPrompt(originalPrompt);
        outputPrompt.value = optimizedPrompt;
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
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (fileExtension === 'txt') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    inputPrompt.value = e.target.result;
                };
                reader.onerror = (e) => {
                    console.error('Error al leer el archivo TXT: ', e);
                    alert('Error al leer el archivo TXT. Inténtalo de nuevo.');
                };
                reader.readAsText(file);
            } else if (['pdf', 'docx'].includes(fileExtension)) {
                // Para PDF/DOCX, generamos un prompt genérico ya que no podemos leer su contenido directamente en el navegador
                inputPrompt.value = `Genera un resumen detallado y los puntos clave del documento llamado "${file.name}".`;
                alert(`Se ha generado un prompt para el archivo ${file.name}. Ten en cuenta que el contenido del archivo no se ha leído directamente.`);
            } else {
                alert('Tipo de archivo no soportado. Por favor, sube un archivo .txt, .pdf o .docx.');
                inputPrompt.value = '';
                fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            }
        } else {
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            inputPrompt.value = '';
        }
    });

    function optimizarPrompt(prompt) {
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
