document.addEventListener('DOMContentLoaded', () => {
    const inputPrompt = document.getElementById('input-prompt');
    const optimizeButton = document.getElementById('optimize-button');
    const outputPrompt = document.getElementById('output-prompt');

    optimizeButton.addEventListener('click', () => {
        const originalPrompt = inputPrompt.value;
        if (originalPrompt.trim() === '') {
            alert('Por favor, introduce un prompt.');
            return;
        }

        const optimizedPrompt = optimizarPrompt(originalPrompt);
        outputPrompt.value = optimizedPrompt;
    });

    function optimizarPrompt(prompt) {
        // Lógica de optimización (se implementará en el siguiente paso)
        const promptOptimizado = `**Rol:** Eres un asistente experto.

**Tarea:** ${prompt}

**Instrucciones Adicionales:**
- Proporciona una respuesta clara y concisa.
- Si es un tema complejo, divídelo en puntos clave.
- Asegúrate de que el tono sea profesional y útil.

**Formato de Salida Deseado:** Texto plano.`;

        return promptOptimizado;
    }
});