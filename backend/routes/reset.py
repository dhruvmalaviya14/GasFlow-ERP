from flask import Blueprint, request, jsonify
from utils.db import get_db_connection
from utils.logger import insert_log

reset_bp = Blueprint("reset_bp", __name__)

CORRECT_PIN = "1111"

@reset_bp.route("/reset-system", methods=["POST"])
def reset_system():
    data = request.json
    user = data.get("user", "unknown")
    pin = data.get("pin", "")

    # verify PIN
    if pin != CORRECT_PIN:
        return jsonify({"success": False, "message": "Invalid PIN"}), 400

    conn = get_db_connection()

    # 1. Clear all transactions
    conn.execute("DELETE FROM transactions")

    # 2. Clear logs
    conn.execute("DELETE FROM logs")

    # 3. Reset hotels stock (but DO NOT reset farm inventory!)
    conn.execute("UPDATE hotels SET filled=0, empty=0")

    conn.commit()
    conn.close()

    # 4. Add log entry
    insert_log(user, "Performed system reset (transactions & logs only)")

    return jsonify({"success": True, "message": "System reset successful"})
