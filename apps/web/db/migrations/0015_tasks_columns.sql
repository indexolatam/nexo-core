ALTER TABLE tasks ADD COLUMN related_entity_type TEXT;
ALTER TABLE tasks ADD COLUMN related_entity_id TEXT;
ALTER TABLE tasks ADD COLUMN completed_by_user_id TEXT;
ALTER TABLE tasks ADD COLUMN updated_by_user_id TEXT;
