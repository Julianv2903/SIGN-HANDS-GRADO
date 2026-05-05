-- ============================================
-- SQL para Sistema de Gamificación - SignHands
-- ============================================
-- Ejecuta este script en la consola SQL de Supabase

-- 1. Crear tabla de evaluaciones
CREATE TABLE evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  dificultad VARCHAR(20) NOT NULL CHECK (dificultad IN ('basico', 'medio', 'avanzado')),
  puntos_maximos INT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. Crear tabla de resultados de evaluaciones
CREATE TABLE resultados_evaluaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
  score INT NOT NULL,
  puntos_ganados INT NOT NULL,
  completado_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, evaluacion_id)
);

-- 3. Extender tabla usuarios con campos de gamificación
ALTER TABLE usuarios ADD COLUMN puntos_totales INT DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN nivel INT DEFAULT 1;
ALTER TABLE usuarios ADD COLUMN puntos_para_siguiente_nivel INT DEFAULT 100;
ALTER TABLE usuarios ADD COLUMN evaluaciones_completadas INT DEFAULT 0;

-- 4. Insertar evaluaciones disponibles
INSERT INTO evaluaciones (slug, nombre, descripcion, dificultad, puntos_maximos) VALUES
  ('basico', 'Evaluación Básica', 'Test básico con 5 preguntas sobre vocabulario fundamental', 'basico', 50),
  ('medio', 'Evaluación Media', 'Test intermedio con 8 preguntas de emparejamiento y ordenamiento', 'medio', 75),
  ('avanzado', 'Evaluación Avanzada', 'Test avanzado con 10 preguntas situacionales y contextuales', 'avanzado', 100);

-- 5. Crear índices para optimizar búsquedas
CREATE INDEX idx_resultados_user ON resultados_evaluaciones(user_id);
CREATE INDEX idx_resultados_evaluacion ON resultados_evaluaciones(evaluacion_id);
CREATE INDEX idx_usuarios_nivel ON usuarios(nivel);

-- 6. Crear función para actualizar puntos y nivel (OPCIONAL - para automatización)
CREATE OR REPLACE FUNCTION actualizar_puntos_usuario(
  p_user_id UUID,
  p_puntos_ganados INT
)
RETURNS void AS $$
DECLARE
  v_nuevos_puntos INT;
  v_nivel INT;
  v_puntos_para_nivel INT;
BEGIN
  -- Actualizar puntos totales
  UPDATE usuarios
  SET puntos_totales = puntos_totales + p_puntos_ganados,
      evaluaciones_completadas = evaluaciones_completadas + 1
  WHERE id = p_user_id;
  
  -- Obtener puntos actuales y nivel
  SELECT puntos_totales, nivel INTO v_nuevos_puntos, v_nivel
  FROM usuarios WHERE id = p_user_id;
  
  -- Calcular nuevo nivel (cada nivel requiere 100 puntos más)
  v_nivel := 1 + (v_nuevos_puntos / 100);
  v_puntos_para_nivel := ((v_nivel * 100) - v_nuevos_puntos);
  
  -- Actualizar nivel
  UPDATE usuarios
  SET nivel = v_nivel,
      puntos_para_siguiente_nivel = v_puntos_para_nivel
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear política de seguridad para resultados_evaluaciones (RLS)
ALTER TABLE resultados_evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios solo ven sus propios resultados"
  ON resultados_evaluaciones
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propios resultados"
  ON resultados_evaluaciones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Datos de ejemplo para pruebas (opcional)
-- ============================================
-- Uncomment si quieres agregar preguntas de ejemplo:
/*
CREATE TABLE preguntas_evaluacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
  numero_pregunta INT NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('seleccion_multiple', 'emparejamiento', 'ordenamiento', 'situacional')),
  enunciado TEXT NOT NULL,
  imagen_url VARCHAR(500),
  opciones JSONB,
  respuesta_correcta JSONB,
  puntos_parciales INT DEFAULT 0
);

ALTER TABLE preguntas_evaluacion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver preguntas de evaluación"
  ON preguntas_evaluacion
  FOR SELECT
  USING (true);
*/
