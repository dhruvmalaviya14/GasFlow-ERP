from utils.db import get_db_connection

def create_tables():
    conn = get_db_connection()
    cursor = conn.cursor()

    # -------------------------
    # Users Table
    # -------------------------
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    ''')

    # -------------------------
    # Hotels Table
    # -------------------------
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hotels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            address TEXT,
            contact TEXT,
            rate REAL,
            filled INTEGER DEFAULT 0,
            empty INTEGER DEFAULT 0,
            paid_amount REAL DEFAULT 0    -- NEW COLUMN
        )
    ''')

    # Add paid_amount column safely (for older DB versions)
    try:
        cursor.execute("ALTER TABLE hotels ADD COLUMN paid_amount REAL DEFAULT 0")
    except:
        pass  # Column already exists

    # -------------------------
    # Inventory Table
    # -------------------------
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY,
            filled INTEGER DEFAULT 0,
            empty INTEGER DEFAULT 0
        )
    ''')

    # Ensure single inventory record exists
    cursor.execute("INSERT OR IGNORE INTO inventory (id, filled, empty) VALUES (1, 0, 0)")

    # -------------------------
    # Transactions Table
    # -------------------------
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hotel_id INTEGER,
            filled_given INTEGER,
            empty_taken INTEGER,
            amount REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # -------------------------
    # Logs Table
    # -------------------------
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            action TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # -------------------------
    # Payments Table
    # -------------------------
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hotel_id INTEGER,
            amount REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
