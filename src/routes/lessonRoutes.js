import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Recrear __dirname y __filename para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.get('/lessons/powershell', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'lessons', 'powershell.html'));
});

router.get('/lessons/cyberhack', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'lessons', 'cyberhack.html'));
});

router.get('/lessons/practicas', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'lessons', 'practicas_powershell.html'));
});

router.get('/lessons/powershell/pw_anatomia', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'lessons', 'powershell', 'pw_anatomia.html'));
});
router.get('/lessons/nodejs/resolucion', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'lessons', 'nodejs', 'resolucion.html'));
});
router.get('/lessons/nodejs/guia-jwt', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'lessons', 'nodejs', 'guia-jwt.html'));
});
router.get('/lessons/mantenimiento/mantenimiento_pc', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'lessons', 'mantenimiento', 'mantenimiento_pc.html'));
});

router.get('/diurno', (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'public', 'diurno', 'diurno.html'));
});
export default router;