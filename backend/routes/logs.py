from flask import Blueprint, jsonify
from utils.db import get_db_connection

logs_bp = Blueprint('logs_bp', __name__)

@logs_bp.route('/logs', methods=['GET'])
def get_logs():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM logs ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])
