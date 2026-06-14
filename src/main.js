import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Error Visualizer for Debugging
const errorDiv = document.createElement('div');
errorDiv.style.position = 'fixed';
errorDiv.style.bottom = '10px';
errorDiv.style.right = '10px';
errorDiv.style.maxHeight = '200px';
errorDiv.style.width = '350px';
errorDiv.style.overflowY = 'auto';
errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.9)';
errorDiv.style.color = 'white';
errorDiv.style.padding = '10px';
errorDiv.style.borderRadius = '5px';
errorDiv.style.zIndex = '99999';
errorDiv.style.fontFamily = 'monospace';
errorDiv.style.fontSize = '12px';
errorDiv.style.display = 'none';
document.body.appendChild(errorDiv);

const showError = (msg) => {
  errorDiv.style.display = 'block';
  errorDiv.innerText += '\n' + msg;
};

window.onerror = (message, source, lineno, colno, error) => {
  showError(`Error: ${message} at ${source}:${lineno}`);
};

const originalError = console.error;
console.error = (...args) => {
  originalError.apply(console, args);
  showError('Console error: ' + args.join(' '));
};

createApp(App).mount('#app')

