ALTER TABLE services ADD COLUMN max_participants INTEGER;
ALTER TABLE services ADD COLUMN is_online INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN landing_description TEXT;
ALTER TABLE services ADD COLUMN landing_image TEXT;
ALTER TABLE services ADD COLUMN created_by_user_id TEXT;
ALTER TABLE services ADD COLUMN updated_by_user_id TEXT;
