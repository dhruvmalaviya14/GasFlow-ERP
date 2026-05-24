from flask import Blueprint, request, jsonify
from utils.db import get_db_connection
from utils.logger import insert_log

hotels = Blueprint("hotels", __name__)


@hotels.route('/hotels', methods=['GET'])
def get_hotels():
    conn = get_db_connection()
    data = conn.execute("SELECT * FROM hotels").fetchall()
    conn.close()
    return jsonify([dict(row) for row in data])


@hotels.route('/hotel', methods=['POST'])
def add_hotel():
    data = request.json

    conn = get_db_connection()
    conn.execute("""
        INSERT INTO hotels (name, address, contact, rate)
        VALUES (?, ?, ?, ?)
    """, (data["name"], data["address"], data["contact"], data["rate"]))
    conn.commit()
    conn.close()

    # 🔥 Add log
    insert_log("bharat", f"Added hotel {data['name']}")

    return jsonify({"success": True})


@hotels.route('/hotel/<id>', methods=['PUT'])
def update_hotel(id):
    data = request.json

    conn = get_db_connection()
    conn.execute("""
        UPDATE hotels SET name=?, address=?, contact=?, rate=?
        WHERE id=?
    """, (data["name"], data["address"], data["contact"], data["rate"], id))
    conn.commit()
    conn.close()

    insert_log("bharat", f"Updated hotel {data['name']}")

    return jsonify({"success": True})


@hotels.route('/hotel/<id>', methods=['DELETE'])
def delete_hotel(id):
    conn = get_db_connection()

    hotel = conn.execute("SELECT name FROM hotels WHERE id=?", (id,)).fetchone()

    conn.execute("DELETE FROM hotels WHERE id=?", (id,))
    conn.commit()
    conn.close()

    if hotel:
        insert_log("bharat", f"Deleted hotel {hotel['name']}")

    return jsonify({"success": True})
