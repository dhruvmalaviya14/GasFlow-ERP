from flask import Blueprint, request, jsonify
from utils.db import get_db_connection

auth = Blueprint('auth', __name__)

# -------------------------
# 1. LOGIN API
# -------------------------
@auth.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (username, password)
    ).fetchone()
    conn.close()

    if user:
        print(user)
        return jsonify({"success": True})
    else:
        return jsonify({"success": False, "message": "Invalid username or password"})


# -------------------------
# 2. PIN VERIFY API
# -------------------------

CORRECT_PIN = "1111"   

@auth.route('/verify-pin', methods=['POST'])
def verify_pin():
    data = request.json
    pin = data.get("pin", "")

    if pin == CORRECT_PIN:
        return jsonify({"success": True})

    return jsonify({"success": False, "message": "Invalid PIN"}), 400
