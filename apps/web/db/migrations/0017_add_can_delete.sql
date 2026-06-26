-- 0017: Agregar can_delete a module_permissions
ALTER TABLE module_permissions ADD COLUMN can_delete INTEGER DEFAULT 0;

-- Actualizar seeds con can_delete
-- root: puede eliminar todo
UPDATE module_permissions SET can_delete = 1 WHERE role = 'root';

-- admin: puede eliminar personas, finanzas, agenda, tareas, configuracion
UPDATE module_permissions SET can_delete = 1 WHERE role = 'admin' AND module IN ('personas', 'finanzas', 'agenda', 'tareas', 'configuracion');

-- doctor: puede eliminar en agenda y tareas
UPDATE module_permissions SET can_delete = 1 WHERE role = 'doctor' AND module IN ('agenda', 'tareas');

-- asistente: puede eliminar personas, finanzas, agenda, tareas
UPDATE module_permissions SET can_delete = 1 WHERE role = 'asistente' AND module IN ('personas', 'finanzas', 'agenda', 'tareas');
