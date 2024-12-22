-- 1) Drop the old trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON nodes;

-- 2) Recreate the function with the desired logic
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set updated_at to NOW() if the user hasn't already provided a value.
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3) Create the new trigger - no WHEN clause needed now
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON nodes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();