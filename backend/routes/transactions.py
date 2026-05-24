from flask import Blueprint, request, jsonify, send_file
from utils.db import get_db_connection
from utils.pdf_generator import generate_bill_pdf

transactions = Blueprint('transactions', __name__)


# =============================
# 1. RECORD CYLINDER EXCHANGE
# =============================
@transactions.route('/exchange', methods=['POST'])
def exchange():
    data = request.json
    hotel_id = data["hotel_id"]
    filled_given = int(data["filled_given"])
    empty_taken = int(data["empty_taken"])

    conn = get_db_connection()

    # Get hotel stock
    hotel_row = conn.execute(
        "SELECT rate, filled, empty FROM hotels WHERE id=?",
        (hotel_id,)
    ).fetchone()

    if not hotel_row:
        return jsonify({"success": False, "message": "Hotel not found"})

    rate = hotel_row["rate"]
    hotel_filled = hotel_row["filled"]
    hotel_empty = hotel_row["empty"]

    # Convert all previously filled bottles → empty
    hotel_empty += hotel_filled
    hotel_filled = 0

    # Validate empty bottles taken
    if empty_taken > hotel_empty:
        return jsonify({
            "success": False,
            "message": f"Hotel has only {hotel_empty} empty bottles"
        })

    # Get farm inventory
    farm = conn.execute(
        "SELECT filled, empty FROM inventory WHERE id=1"
    ).fetchone()

    farm_filled = farm["filled"]
    farm_empty = farm["empty"]

    if filled_given > farm_filled:
        return jsonify({
            "success": False,
            "message": f"Farm has only {farm_filled} filled bottles"
        })

    # Update hotel stock
    hotel_filled += filled_given
    hotel_empty -= empty_taken

    conn.execute("""
        UPDATE hotels SET filled=?, empty=? WHERE id=?
    """, (hotel_filled, hotel_empty, hotel_id))

    # Update farm inventory
    conn.execute("""
        UPDATE inventory
        SET filled = filled - ?, empty = empty + ?
        WHERE id=1
    """, (filled_given, empty_taken))

    # Save transaction
    amount = rate * filled_given

    conn.execute("""
        INSERT INTO transactions (hotel_id, filled_given, empty_taken, amount)
        VALUES (?, ?, ?, ?)
    """, (hotel_id, filled_given, empty_taken, amount))

    conn.commit()
    conn.close()

    # Log entry
    try:
        log_conn = get_db_connection()
        log_conn.execute(
            "INSERT INTO logs (user, action) VALUES (?, ?)",
            ("system", f"Exchanged {filled_given} filled & took {empty_taken} empty for hotel ID {hotel_id}")
        )
        log_conn.commit()
        log_conn.close()
    except:
        pass

    return jsonify({"success": True, "amount": amount})


# =============================
# 2. GET ALL TRANSACTIONS
# =============================
@transactions.route('/transactions', methods=['GET'])
def get_transactions():
    conn = get_db_connection()
    data = conn.execute("SELECT * FROM transactions ORDER BY id DESC").fetchall()
    conn.close()
    return jsonify([dict(row) for row in data])


# =============================
# 3. BILL SUMMARY (FINAL FIX)
# =============================
@transactions.route('/bill/<hotel_id>', methods=['GET'])
def bill_summary(hotel_id):
    conn = get_db_connection()

    hotel = conn.execute(
        "SELECT name, rate FROM hotels WHERE id=?",
        (hotel_id,)
    ).fetchone()

    if not hotel:
        return jsonify({"error": "Hotel not found"})

    # Total bottles & total cost
    tx = conn.execute(
        "SELECT filled_given, amount FROM transactions WHERE hotel_id=?",
        (hotel_id,)
    ).fetchall()

    total_bottles = sum(row["filled_given"] for row in tx)
    total_amount = sum(row["amount"] for row in tx)

    # Total paid
    paid_row = conn.execute(
        "SELECT IFNULL(SUM(amount),0) AS paid FROM payments WHERE hotel_id=?",
        (hotel_id,)
    ).fetchone()
    
    paid = paid_row["paid"]
    pending = total_amount - paid

    conn.close()

    return jsonify({
        "hotel": hotel["name"],
        "rate": hotel["rate"],
        "total_bottles": total_bottles,
        "total_amount": total_amount,
        "paid": paid,
        "pending": pending,
        "status": "done" if pending == 0 else "pending"
    })



# =============================
# 4. DOWNLOAD BILL PDF
# =============================
@transactions.route('/bill/download/<hotel_id>', methods=['GET'])
def download_bill(hotel_id):
    conn = get_db_connection()

    # Fetch hotel
    hotel = conn.execute(
        "SELECT name, rate FROM hotels WHERE id=?",
        (hotel_id,)
    ).fetchone()

    # Fetch transactions
    tx = conn.execute(
        "SELECT filled_given, amount FROM transactions WHERE hotel_id=?",
        (hotel_id,)
    ).fetchall()

    # Fetch payments
    payment_row = conn.execute(
        "SELECT IFNULL(SUM(amount),0) AS paid FROM payments WHERE hotel_id=?",
        (hotel_id,)
    ).fetchone()

    conn.close()

    if not hotel:
        return jsonify({"error": "Hotel not found"})

    total_bottles = sum(row["filled_given"] for row in tx)
    total_amount = sum(row["amount"] for row in tx)
    paid = payment_row["paid"]
    pending = total_amount - paid

    filename = f"bill_hotel_{hotel_id}.pdf"

    # Updated PDF generator (must support paid+pending)
    generate_bill_pdf(
        hotel_name=hotel["name"],
        rate=hotel["rate"],
        total_bottles=total_bottles,
        total_amount=total_amount,
        paid=paid,
        pending=pending,
        filename=filename
    )

    return send_file(filename, as_attachment=True)



# =============================
# 5. HOTEL + FARM STATS
# =============================
@transactions.route('/hotel/<hotel_id>/stats', methods=['GET'])
def get_hotel_stats(hotel_id):
    conn = get_db_connection()

    hotel = conn.execute(
        "SELECT name, rate, filled, empty FROM hotels WHERE id=?",
        (hotel_id,)
    ).fetchone()

    farm = conn.execute(
        "SELECT filled AS farm_filled, empty AS farm_empty FROM inventory WHERE id=1"
    ).fetchone()

    conn.close()

    if not hotel:
        return jsonify({"error": "Hotel not found"})

    return jsonify({
        "hotel_name": hotel["name"],
        "rate": hotel["rate"],
        "hotel_filled": hotel["filled"],
        "hotel_empty": hotel["empty"],
        "farm_filled": farm["farm_filled"],
        "farm_empty": farm["farm_empty"]
    })


# =============================
# 6. MONTHLY REPORT
# =============================
@transactions.route('/monthly-report', methods=['GET'])
def monthly_report():
    conn = get_db_connection()

    rows = conn.execute("""
        SELECT 
            SUM(filled_given) AS total_filled,
            SUM(empty_taken) AS total_empty,
            SUM(amount) AS total_amount
        FROM transactions
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    """).fetchone()

    conn.close()

    return jsonify({
        "month": "current",
        "total_filled": rows["total_filled"] or 0,
        "total_empty": rows["total_empty"] or 0,
        "total_amount": rows["total_amount"] or 0
    })


# =============================
# 7. RESET SYSTEM (UPDATED)
# =============================
@transactions.route('/reset-system', methods=['POST'])
def reset_system():
    try:
        conn = get_db_connection()

        # Clear all transactions & logs
        conn.execute("DELETE FROM transactions")
        conn.execute("DELETE FROM logs")

        # Clear all payments & reset hotels' paid_amount
        conn.execute("DELETE FROM payments")
        conn.execute("UPDATE hotels SET paid_amount = 0")

        conn.commit()
        conn.close()

        return jsonify({"success": True})

    except Exception as e:
        print("RESET ERROR:", e)
        return jsonify({"success": False, "message": str(e)}), 500


# =============================
# 8. Current Bottles Per Hotel
# =============================
@transactions.route('/hotel-status', methods=['GET'])
def hotel_status():
    conn = get_db_connection()

    rows = conn.execute("""
        SELECT 
            h.id,
            h.name,
            h.rate,
            (h.filled + h.empty) AS current_bottles,
            IFNULL(SUM(t.filled_given), 0) AS total_given,
            IFNULL(SUM(t.amount), 0) AS total_amount
        FROM hotels h
        LEFT JOIN transactions t ON h.id = t.hotel_id
        GROUP BY h.id
        ORDER BY h.name;
    """).fetchall()

    conn.close()

    return jsonify([dict(r) for r in rows])


# =============================
# 9. PAYMENT STATUS API
# =============================
@transactions.route('/payment-status', methods=['GET'])
def payment_status():
    conn = get_db_connection()

    rows = conn.execute("""
        SELECT 
            h.id,
            h.name,
            h.rate,
            h.paid_amount,
            IFNULL(SUM(t.filled_given), 0) AS bottles_given,
            IFNULL(SUM(t.amount), 0) AS total_amount
        FROM hotels h
        LEFT JOIN transactions t ON h.id = t.hotel_id
        GROUP BY h.id
        ORDER BY h.name;
    """).fetchall()

    conn.close()

    result = []
    for row in rows:
        pending = row["total_amount"] - row["paid_amount"]

        result.append({
            "hotel_id": row["id"],
            "name": row["name"],
            "bottles_given": row["bottles_given"],
            "total_amount": row["total_amount"],
            "paid": row["paid_amount"],
            "pending": pending,
            "status": "done" if pending == 0 else "pending"
        })

    return jsonify(result)


# =============================
# 10. UPDATE PAYMENT API
# =============================
@transactions.route('/payment/update', methods=['POST'])
def update_payment():
    data = request.json
    hotel_id = data["hotel_id"]
    amount = int(data["amount"])

    conn = get_db_connection()

    # Save payment record
    conn.execute("""
        INSERT INTO payments (hotel_id, amount)
        VALUES (?, ?)
    """, (hotel_id, amount))

    # Update running total for Payment Status page
    conn.execute("""
        UPDATE hotels
        SET paid_amount = paid_amount + ?
        WHERE id = ?
    """, (amount, hotel_id))

    conn.commit()
    conn.close()

    return jsonify({"success": True})
