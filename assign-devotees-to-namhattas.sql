-- Script to assign devotees to namhattas
-- This will distribute 250 devotees across 100 namhattas (average 2-3 devotees per namhatta)

WITH devotee_namhatta_assignment AS (
  SELECT 
    d.id as devotee_id,
    n.id as namhatta_id,
    ROW_NUMBER() OVER (ORDER BY d.id) as devotee_row,
    ROW_NUMBER() OVER (ORDER BY n.id) as namhatta_row
  FROM devotees d
  CROSS JOIN namhattas n
  WHERE (ROW_NUMBER() OVER (ORDER BY d.id) - 1) % 100 + 1 = ROW_NUMBER() OVER (ORDER BY n.id)
)
UPDATE devotees 
SET namhatta_id = (
  SELECT namhatta_id 
  FROM devotee_namhatta_assignment 
  WHERE devotee_namhatta_assignment.devotee_id = devotees.id
);