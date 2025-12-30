import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import path from 'path';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Servir Frontend (Archivos estáticos del cliente construido)
// Asumimos que la estructura en prod es: root/client/dist y root/server/dist
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Middleware Catch-All para SPA (Solución robusta para Express/Render)
// En lugar de regex '*', usamos un handler genérico al final
// para evitar problemas con versiones de path-to-regexp
app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

/* 
// Health check (Reemplazado por static serving)
app.get('/', (req, res) => {
    res.send('Neural Charades API is running');
}); 
*/

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
