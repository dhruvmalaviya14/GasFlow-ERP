from utils.db import get_db_connection

def insert_log(user, action):
    conn = get_db_connection()
    conn.execute(
        "INSERT INTO logs (user, action) VALUES (?, ?)",
        (user, action)
    )
    conn.commit()
    conn.close()
