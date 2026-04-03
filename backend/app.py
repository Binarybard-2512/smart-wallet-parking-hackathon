from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from config import Config
from models import db, ParkingSlot, Vehicle, BuildingLayout

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')  # ✅ Fixed

@app.route('/')
def home():
    return jsonify({'message': 'Smart Wallet Parking System API running'})

@app.route('/api/slots')
def get_slots():
    slots = ParkingSlot.query.all()
    return jsonify([{
        'id': s.id, 'floor': s.floor, 'row': s.row, 'col': s.col,
        'slottype': s.slottype, 'isoccupied': s.isoccupied
    } for s in slots])

@app.route('/api/vehicles')
def get_vehicles():
    vehicles = Vehicle.query.all()
    return jsonify([{
        'brand': v.brand, 'model': v.model, 'keyfrequency': v.keyfrequency
    } for v in vehicles])

# SocketIO Events (basic)
@socketio.on('connect')
def handle_connect():
    emit('status', {'message': 'Connected!'})

@socketio.on('slot_update')
def handle_slot_update(data):
    emit('slot_updated', data, broadcast=True)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("🚀 Smart Wallet Parking starting...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)