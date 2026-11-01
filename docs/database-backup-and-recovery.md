# SaanMura Backend — Database Backup, RLS Auditing & Recovery Guide

## 1. Automated Backups & Retention Strategy

SaanMura utilizes PostgreSQL WAL-G and Supabase automated physical & logical backups:
- **Daily Full Logical Snapshots**: Exported at 02:00 PHT (UTC+8) and retained for 30 days.
- **Continuous Write-Ahead Log (WAL) Archiving**: Point-In-Time Recovery (PITR) with 7-day to 30-day granularity.
- **Offsite Redundancy**: AES-256 encrypted backups stored in AWS S3 (ap-southeast-1, Singapore region).

---

## 2. Manual Backup Procedures

### Logical Schema and Data Export via Supabase CLI
```bash
# Export complete schema and data
supabase db dump --data-only -f supabase/backups/saanmura_data_$(date +%Y%m%d).sql

# Export schema only
supabase db dump --schema-only -f supabase/backups/saanmura_schema_$(date +%Y%m%d).sql
```

### PostgreSQL Native `pg_dump`
```bash
pg_dump \
  -h aws-0-ap-southeast-1.pooler.supabase.com \
  -p 5432 \
  -d postgres \
  -U postgres.your-project \
  --format=custom \
  --file=saanmura_full_backup.dump
```

---

## 3. Disaster Recovery & Restoration

### Point-in-Time Recovery (PITR)
If unintended data corruption or accidental table modification occurs:
1. Access **Supabase Dashboard -> Database -> Backups -> Point in Time**.
2. Select target recovery timestamp (e.g. `2026-10-31 08:30:00 UTC+8`).
3. Trigger automated restoration to a cloned instance or restore in-place.

### Manual Database Restoration
```bash
pg_restore \
  -h aws-0-ap-southeast-1.pooler.supabase.com \
  -p 5432 \
  -d postgres \
  -U postgres.your-project \
  --clean \
  --if-exists \
  saanmura_full_backup.dump
```

---

## 4. Row Level Security (RLS) Verification Script

Run the following query periodically to verify that every single client-accessible table has RLS enabled:

```sql
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```
Every table must report `rowsecurity = true`.
