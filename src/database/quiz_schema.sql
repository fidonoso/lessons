-- Esquema de base de datos para sistema de quiz
-- Centro de Formación Técnica de la Región de Valparaíso
-- Profesor: Fernando Donoso

-- Tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    quiz_id VARCHAR(100) UNIQUE NOT NULL, -- ej: "powershell-cybersecurity"
    title VARCHAR(200) NOT NULL,
    description TEXT,
    time_limit INTEGER, -- en minutos, NULL = sin límite
    passing_score INTEGER DEFAULT 70, -- porcentaje mínimo para aprobar
    max_attempts INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de preguntas
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id VARCHAR(100) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple-choice', -- 'multiple-choice', 'true-false', 'checkbox', etc.
    question_text TEXT NOT NULL,
    options JSONB, -- Array de opciones para multiple choice
    correct_answer JSONB NOT NULL, -- Respuesta correcta (puede ser index, boolean, array, etc.)
    explanation TEXT, -- Retroalimentación para la pregunta
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de intentos de quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    quiz_id VARCHAR(100) REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    score DECIMAL(5,2), -- Porcentaje obtenido
    total_points INTEGER,
    earned_points INTEGER,
    passed BOOLEAN,
    time_spent INTEGER, -- segundos
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(student_id, quiz_id, attempt_number)
);

-- Tabla de respuestas individuales
CREATE TABLE IF NOT EXISTS quiz_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
    student_answer JSONB, -- Respuesta del estudiante
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_quiz ON quiz_attempts(student_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt ON quiz_answers(attempt_id);

-- Insertar el quiz de PowerShell como ejemplo
INSERT INTO quizzes (quiz_id, title, description, time_limit, passing_score, max_attempts) 
VALUES (
    'powershell-cybersecurity',
    'PowerShell para Ciberseguridad',
    'Evaluación de conocimientos sobre PowerShell aplicado a ciberseguridad y diagnóstico de sistemas',
    30,
    70,
    5
) ON CONFLICT (quiz_id) DO NOTHING;

-- Insertar preguntas de ejemplo para PowerShell
INSERT INTO quiz_questions (quiz_id, question_number, question_type, question_text, options, correct_answer, explanation, points) VALUES
(
    'powershell-cybersecurity',
    1,
    'multiple-choice',
    '¿Cuál es el cmdlet correcto para listar todos los procesos en ejecución?',
    '["Get-Process", "List-Process", "Show-Process", "View-Process"]',
    '0',
    'Get-Process es el cmdlet estándar de PowerShell para mostrar información sobre los procesos que se ejecutan en el sistema local.',
    10
),
(
    'powershell-cybersecurity',
    2,
    'multiple-choice',
    '¿Qué comando utilizarías para ver las conexiones de red activas?',
    '["Get-NetConnection", "Get-NetTCPConnection", "Show-Network", "Get-Connection"]',
    '1',
    'Get-NetTCPConnection muestra información sobre las conexiones TCP actuales en el sistema, esencial para análisis de red en ciberseguridad.',
    10
),
(
    'powershell-cybersecurity',
    3,
    'multiple-choice',
    '¿Cuál es la principal ventaja de PowerShell para profesionales de ciberseguridad?',
    '["Es más rápido que CMD", "Permite automatización y análisis profundo del sistema", "Solo funciona en Windows", "Es más fácil de usar"]',
    '1',
    'PowerShell permite automatización avanzada, análisis profundo del sistema y es especialmente útil para tareas de ciberseguridad como detección de amenazas y análisis forense.',
    10
),
(
    'powershell-cybersecurity',
    4,
    'multiple-choice',
    '¿Qué cmdlet usarías para obtener eventos del registro de seguridad de Windows?',
    '["Get-EventLog", "Get-WinEvent", "Show-SecurityLog", "Get-SecurityEvent"]',
    '1',
    'Get-WinEvent es el cmdlet moderno y más potente para acceder a los logs de eventos de Windows, incluyendo el registro de seguridad.',
    10
),
(
    'powershell-cybersecurity',
    5,
    'multiple-choice',
    '¿Cuál de estas técnicas NO es una buena práctica de seguridad al usar PowerShell?',
    '["Verificar la política de ejecución", "Ejecutar scripts sin revisar su contenido", "Usar módulos firmados digitalmente", "Monitorear la actividad de PowerShell"]',
    '1',
    'Ejecutar scripts sin revisar su contenido es peligroso y va contra las mejores prácticas de seguridad. Siempre debes verificar y entender el código antes de ejecutarlo.',
    10
),
(
    'powershell-cybersecurity',
    6,
    'multiple-choice',
    '¿Qué comando te permite verificar el hash SHA256 de un archivo para comprobar su integridad?',
    '["Get-Hash", "Get-FileHash", "Test-FileIntegrity", "Verify-Hash"]',
    '1',
    'Get-FileHash es el cmdlet que calcula el hash criptográfico de un archivo, útil para verificar integridad y detectar modificaciones maliciosas.',
    10
),
(
    'powershell-cybersecurity',
    7,
    'multiple-choice',
    '¿Cuál es el comando correcto para listar todos los servicios de Windows en estado "Running"?',
    '["Get-Service | Where-Object {$_.Status -eq \"Running\"}", "Get-Service -Status Running", "Show-Service -Running", "List-Service -Active"]',
    '0',
    'Get-Service | Where-Object {$_.Status -eq "Running"} filtra los servicios por su estado, mostrando solo aquellos que están ejecutándose actualmente.',
    10
),
(
    'powershell-cybersecurity',
    8,
    'multiple-choice',
    '¿Qué cmdlet utilizarías para buscar archivos modificados recientemente en el sistema?',
    '["Find-RecentFiles", "Get-ChildItem con filtro LastWriteTime", "Search-ModifiedFiles", "Get-FileChanges"]',
    '1',
    'Get-ChildItem combinado con Where-Object y filtros de LastWriteTime permite encontrar archivos modificados en un período específico, útil para análisis forense.',
    10
),
(
    'powershell-cybersecurity',
    9,
    'multiple-choice',
    '¿Cuál es la forma correcta de ejecutar PowerShell con privilegios elevados desde línea de comandos?',
    '["powershell -admin", "powershell -elevated", "Start-Process powershell -Verb RunAs", "powershell -administrator"]',
    '2',
    'Start-Process powershell -Verb RunAs es el método correcto para iniciar PowerShell con privilegios de administrador desde un script o sesión actual.',
    10
),
(
    'powershell-cybersecurity',
    10,
    'multiple-choice',
    '¿Qué información NO puedes obtener directamente con el cmdlet Get-ComputerInfo?',
    '["Versión del sistema operativo", "Cantidad de memoria RAM", "Contraseñas de usuarios locales", "Información del procesador"]',
    '2',
    'Get-ComputerInfo proporciona información detallada del sistema pero nunca expone información sensible como contraseñas. Las contraseñas están protegidas y encriptadas en el sistema.',
    10
)
ON CONFLICT DO NOTHING; 