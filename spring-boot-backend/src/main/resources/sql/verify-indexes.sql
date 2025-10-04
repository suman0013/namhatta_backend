-- Database Index Verification Script
-- This script verifies the existence of required indexes for the Namhatta Management System
-- IMPORTANT: This script only verifies - it does NOT create indexes

-- Verify indexes on users table
SELECT 
    'users.username' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' AND indexname LIKE '%username%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'users.email' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' AND indexname LIKE '%email%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL
-- Verify indexes on devotees table
SELECT 
    'devotees.legal_name' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'devotees' AND indexname LIKE '%legal_name%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'devotees.email' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'devotees' AND indexname LIKE '%email%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'devotees.namhatta_id' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'devotees' AND indexname LIKE '%namhatta_id%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'devotees.leadership_role' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'devotees' AND indexname LIKE '%leadership_role%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'devotees.reporting_to_devotee_id' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'devotees' AND indexname LIKE '%reporting_to_devotee_id%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL
-- Verify indexes on namhattas table
SELECT 
    'namhattas.code' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'namhattas' AND indexname LIKE '%code%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'namhattas.registration_no' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'namhattas' AND indexname LIKE '%registration_no%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'namhattas.district_supervisor_id' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'namhattas' AND indexname LIKE '%district_supervisor_id%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'namhattas.status' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'namhattas' AND indexname LIKE '%status%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL
-- Verify indexes on addresses table
SELECT 
    'addresses.country' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'addresses' AND indexname LIKE '%country%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'addresses.state_name_english' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'addresses' AND indexname LIKE '%state_name_english%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'addresses.district_name_english' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'addresses' AND indexname LIKE '%district_name_english%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'addresses.pincode' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'addresses' AND indexname LIKE '%pincode%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status

UNION ALL
-- Verify indexes on jwt_blacklist table
SELECT 
    'jwt_blacklist.token_hash' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'jwt_blacklist' AND indexname LIKE '%token_hash%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'jwt_blacklist.expired_at' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'jwt_blacklist' AND indexname LIKE '%expired_at%'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
ORDER BY index_name;

-- Summary of all indexes in the database
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
