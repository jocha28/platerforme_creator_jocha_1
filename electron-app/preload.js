// Preload isolé — pas d'exposition de l'API Node.js au renderer
window.addEventListener('DOMContentLoaded', () => {
  // Identifier l'environnement Electron dans la page web si besoin
  document.documentElement.setAttribute('data-platform', 'electron')
})
