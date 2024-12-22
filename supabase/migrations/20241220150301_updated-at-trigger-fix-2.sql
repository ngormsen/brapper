-- Drop the existing trigger first
DROP TRIGGER IF EXISTS set_updated_at ON nodes;

-- Create the new trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON nodes
    FOR EACH ROW
    WHEN (
        NEW.updated_at IS NULL OR 
        NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at
    )
    EXECUTE FUNCTION update_updated_at_column();