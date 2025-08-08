document.addEventListener('DOMContentLoaded', () => {
    const inputPrompt = document.getElementById('input-prompt');
    const optimizeButton = document.getElementById('optimize-button');
    const outputPrompt = document.getElementById('output-prompt');
    const copyButton = document.getElementById('copy-button');
    // const fileUpload = document.getElementById('file-upload'); // Eliminado
    // const fileNameDisplay = document.getElementById('file-name'); // Eliminado
    const promptTypeSelect = document.getElementById('prompt-type');
    const specificInstructionsInput = document.getElementById('specific-instructions');

    // URL de tu backend. ¡IMPORTANTE! Cambia esto cuando despliegues tu backend. 
    const BACKEND_URL = 'http://localhost:3000'; 

    optimizeButton.addEventListener('click', () => {
        const originalPromptText = inputPrompt.value;
        const selectedPromptType = promptTypeSelect.value;
        const specificInstructions = specificInstructionsInput.value;

        if (originalPromptText.trim() === '') {
            alert('Por favor, introduce un prompt.');
            return;
        }

        // Siempre enviar la solicitud al backend para optimización por IA
        handleOptimizationRequest(originalPromptText, selectedPromptType, specificInstructions);
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

    // Eliminado: fileUpload.addEventListener

    async function handleOptimizationRequest(promptText, promptType, specificInstructions) {
        const formData = new FormData();
        formData.append('promptText', promptText);
        formData.append('promptType', promptType);
        formData.append('specificInstructions', specificInstructions);

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
            console.error('Error al comunicarse con el backend:', error);
            outputPrompt.value = `Error al procesar la solicitud: ${error.message}. Asegúrate de que el backend esté funcionando y la API Key de Gemini esté configurada.`;
            alert(`Error: ${error.message}`);
        }
    }
});