// Archivo principal de JavaScript para el frontend
console.log('🚀 Template MVC cargado correctamente');

// Función para verificar el estado de la API
async function checkApiHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('✅ Estado de la API:', data);
    } catch (error) {
        console.error('❌ Error al verificar la API:', error);
    }
}

// Verificar API al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado completamente');
    checkApiHealth();
});
