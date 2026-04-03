from models import db, Vehicle, ParkingSlot
from app import app
with app.app_context():
    print("Vehicles:", [(v.brand, v.keyfrequency) for v in Vehicle.query.all()])
    print("Slots:", ParkingSlot.query.count())