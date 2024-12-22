-- Create nodes_backup table with same structure as nodes
CREATE TABLE nodes_backup (LIKE nodes INCLUDING ALL);

-- Create links_backup table with same structure as links
CREATE TABLE links_backup (LIKE links INCLUDING ALL);

-- Add foreign key constraints to links_backup
ALTER TABLE links_backup
ADD CONSTRAINT links_backup_source_id_fkey FOREIGN KEY (source_id) REFERENCES nodes_backup(id),
ADD CONSTRAINT links_backup_target_id_fkey FOREIGN KEY (target_id) REFERENCES nodes_backup(id);
