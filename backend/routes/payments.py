from flask import Blueprint, request, jsonify
from utils.db import get_db_connection

payments = Blueprint('payments', __name__)

# 1️⃣ GET PAYMENT STATUS FOR ALL HOTELS
@payments.route('/payment-status', methods=['GET'])
def payment_status():
    conn = get_db_connection()

    rows = conn.execute("""
        SELECT 
            h.id,
            h.name,
            h.rate,
            IFNULL(SUM(t.filled_given), 0) AS total_bottles,
            IFNULL(SUM(t.amount), 0) AS total_amount,
            IFNULL((SELECT SUM(amount) FROM payments WHERE hotel_id = h.id), 0) AS paid_amount
        FROM hotels h
        LEFT JOIN transactions t ON h.id = t.hotel_id
        GROUP BY h.id
    """).fetchall()

    conn.close()

    data = []
    for r in rows:
        pending = r["total_amount"] - r["paid_amount"]
        status = "Done" if pending <= 0 else "Pending"

        data.append({
            "hotel_id": r["id"],
            "hotel": r["name"],
            "total_bottles": r["total_bottles"],
            "total_amount": r["total_amount"],
            "paid_amount": r["paid_amount"],
            "pending_amount": pending,
            "status": status
        })

    return jsonify(data)


# 2️⃣ ADD PAYMENT
@payments.route('/add-payment', methods=['POST'])
def add_payment():
    data = request.json
    hotel_id = data["hotel_id"]
    amount = float(data["amount"])

    conn = get_db_connection()
    conn.execute("INSERT INTO payments (hotel_id, amount) VALUES (?, ?)", (hotel_id, amount))
    conn.commit()
    conn.close()

    return jsonify({"success": True})
