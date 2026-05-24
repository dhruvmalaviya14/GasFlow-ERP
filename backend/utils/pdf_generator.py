from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import green, red, black

def generate_bill_pdf(hotel_name, rate, total_bottles, total_amount, paid, pending, filename):
    c = canvas.Canvas(filename, pagesize=A4)

    # Title
    c.setFont("Helvetica-Bold", 22)
    c.drawString(200, 800, "Gas Cylinder Bill")

    # Main Details
    c.setFont("Helvetica", 14)
    c.drawString(50, 760, f"Hotel Name: {hotel_name}")
    c.drawString(50, 740, f"Rate per Bottle: ₹{rate}")
    c.drawString(50, 720, f"Total Bottles Supplied: {total_bottles}")
    c.drawString(50, 700, f"Total Amount: ₹{total_amount}")

    # Payment Details
    c.setFont("Helvetica-Bold", 15)
    c.drawString(50, 660, "Payment Summary:")

    c.setFont("Helvetica", 14)
    c.drawString(70, 640, f"Paid Amount: ₹{paid}")
    c.drawString(70, 620, f"Pending Amount: ₹{pending}")

    # Status color (GREEN if done, RED if pending)
    status_text = "DONE" if pending == 0 else "PENDING"
    status_color = green if pending == 0 else red

    c.setFillColor(status_color)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(70, 590, f"Status: {status_text}")
    c.setFillColor(black)

    # Line and signature
    c.line(50, 560, 550, 560)
    c.setFont("Helvetica", 14)
    c.drawString(50, 530, "Signature: ___________________")

    c.save()
