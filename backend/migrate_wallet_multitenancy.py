"""
migrate_wallet_multitenancy.py

Removes the UNIQUE constraint from suppliers.wallet so one wallet
can have multiple business registrations.

Also adds validity_days column if missing.

Run from the backend directory:
    python migrate_wallet_multitenancy.py
"""
import sqlite3, os, shutil
from datetime import datetime

DB_PATH = os.getenv("SQLITE_PATH", "./verifychain.db")

if not os.path.exists(DB_PATH):
    print(f"Database not found at {DB_PATH} — nothing to migrate.")
    raise SystemExit(0)

# Backup first
backup = DB_PATH + f".bak_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
shutil.copy2(DB_PATH, backup)
print(f"Backup created: {backup}")

conn = sqlite3.connect(DB_PATH)
conn.execute("PRAGMA foreign_keys = OFF")
conn.execute("BEGIN TRANSACTION")

try:
    # 1. Check if unique constraint exists on wallet
    schema = conn.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='suppliers'"
    ).fetchone()
    if schema and "UNIQUE" in (schema[0] or "") and "wallet" in (schema[0] or ""):
        print("Removing UNIQUE constraint from suppliers.wallet …")

        # 2. Get current columns
        cols_info = conn.execute("PRAGMA table_info(suppliers)").fetchall()
        col_names = [c[1] for c in cols_info]

        # 3. Check validity_days
        has_validity = "validity_days" in col_names
        validity_col = "" if has_validity else ",\n    validity_days INTEGER"

        cols_str = ",\n    ".join(
            f"{c[1]} {c[2]}"
            + (" PRIMARY KEY AUTOINCREMENT" if c[5] == 1 else "")
            + ("" if c[3] or c[5] else " ")  # nullable
            for c in cols_info
            if c[1] != "wallet"   # we'll re-add wallet without unique
        )

        # 4. Recreate table
        conn.execute("""
            CREATE TABLE suppliers_new (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet        VARCHAR(42) NOT NULL,
                company_name  VARCHAR(255) NOT NULL,
                tax_id        VARCHAR(100) NOT NULL UNIQUE,
                country       VARCHAR(100) NOT NULL,
                email         VARCHAR(255),
                status        VARCHAR(20) DEFAULT 'pending',
                tier          INTEGER DEFAULT 1,
                validity_days INTEGER,
                token_id      INTEGER,
                docs_ipfs     VARCHAR(255),
                created_at    DATETIME,
                approved_at   DATETIME,
                expires_at    DATETIME
            )
        """)

        # 5. Copy data
        shared_cols = [c for c in col_names if c in (
            "id","wallet","company_name","tax_id","country","email",
            "status","tier","token_id","docs_ipfs","created_at","approved_at","expires_at"
        )]
        shared = ", ".join(shared_cols)
        conn.execute(f"INSERT INTO suppliers_new ({shared}, validity_days) SELECT {shared}, NULL FROM suppliers")

        # 6. Drop old, rename new
        conn.execute("DROP TABLE suppliers")
        conn.execute("ALTER TABLE suppliers_new RENAME TO suppliers")
        conn.execute("CREATE INDEX ix_suppliers_wallet ON suppliers (wallet)")

        print("  Done — wallet uniqueness removed.")
    else:
        print("No UNIQUE constraint on wallet found — checking validity_days …")
        if "validity_days" not in (schema[0] if schema else ""):
            try:
                conn.execute("ALTER TABLE suppliers ADD COLUMN validity_days INTEGER")
                print("  Added validity_days column.")
            except Exception as e:
                print(f"  validity_days already exists or error: {e}")
        else:
            print("  validity_days already present.")

    conn.execute("COMMIT")
    print("Migration complete.")

except Exception as e:
    conn.execute("ROLLBACK")
    print(f"Migration FAILED: {e}")
    print(f"Restored from backup: {backup}")
    shutil.copy2(backup, DB_PATH)
    raise

finally:
    conn.execute("PRAGMA foreign_keys = ON")
    conn.close()
