from flask import Blueprint, request, jsonify
from utils.db import get_db_connection
from utils.logger import insert_log

inventory = Blueprint("inventory", __name__)


@inventory.route("/inventory", methods=["GET"])
def get_inventory():
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM inventory WHERE id=1").fetchone()
    conn.close()
    return jsonify(dict(row))


@inventory.route("/inventory/update", methods=["POST"])
def update_inventory():
    data = request.json
    filled = data["filled"]
    empty = data["empty"]

    conn = get_db_connection()
    conn.execute("UPDATE inventory SET filled=?, empty=? WHERE id=1",
                 (filled, empty))
    conn.commit()
    conn.close()

    insert_log("bharat", f"Updated inventory → Filled: {filled}, Empty: {empty}")

    return jsonify({"success": True})
