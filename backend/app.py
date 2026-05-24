from flask import Flask
from flask_cors import CORS
from models import create_tables
from routes.auth import auth
from routes.hotels import hotels
from routes.inventory import inventory
from routes.transactions import transactions
from routes.logs import logs_bp
from routes.reset import reset_bp
from utils.db import get_db_connection

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(auth, url_prefix="/api")
app.register_blueprint(hotels, url_prefix="/api")
app.register_blueprint(inventory, url_prefix="/api")
app.register_blueprint(transactions, url_prefix="/api")
app.register_blueprint(logs_bp, url_prefix="/api")
app.register_blueprint(reset_bp, url_prefix="/api")

create_tables()

conn = get_db_connection()
conn.execute("INSERT OR IGNORE INTO users (username, password) VALUES ('bharat', 'bharat')")
conn.execute("INSERT OR IGNORE INTO users (username, password) VALUES ('lalo', 'lalo')")
conn.commit()
conn.close()

@app.route('/')
def home():
    return "Backend running successfully!"

@app.after_request
def apply_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response

if __name__ == "__main__":
    app.run(debug=True)
