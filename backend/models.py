from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
db = SQLAlchemy()

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    keyfrequency = db.Column(db.Float, nullable=False)
    lengthmm = db.Column(db.Integer, nullable=False)
    widthmm = db.Column(db.Integer, nullable=False)
    heightmm = db.Column(db.Integer, nullable=False)
    sizecategory = db.Column(db.String(20), nullable=False)

class ParkingSlot(db.Model):
    __tablename__ = 'parkingslots'
    id = db.Column(db.Integer, primary_key=True)
    buildingid = db.Column(db.Integer, nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    row = db.Column(db.Integer, nullable=False)
    col = db.Column(db.Integer, nullable=False)
    slottype = db.Column(db.String(20), nullable=False)
    widthmm = db.Column(db.Integer, nullable=False)
    depthmm = db.Column(db.Integer, nullable=False)
    isoccupied = db.Column(db.Boolean, default=False)
    currentvehicleid = db.Column(db.Integer, nullable=True)
    rfidcardid = db.Column(db.String(30), nullable=True)  # NEW: Track RFID

class ParkingSession(db.Model):
    __tablename__ = 'parkingsessions'
    id = db.Column(db.Integer, primary_key=True)
    rfidcardid = db.Column(db.String(30), nullable=False)  # Composite key 1
    keyfrequencydetected = db.Column(db.Float, nullable=False)  # Composite key 2
    vehicleid = db.Column(db.Integer, nullable=True)
    slotid = db.Column(db.Integer, nullable=True)
    entrytime = db.Column(db.DateTime, default=datetime.utcnow)
    exittime = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default='entering')

class BuildingLayout(db.Model):
    __tablename__ = 'buildinglayouts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    totalfloors = db.Column(db.Integer, nullable=False)
    rowsperfloor = db.Column(db.Integer, nullable=False)
    colsperfloor = db.Column(db.Integer, nullable=False)

class TrafficLane(db.Model):
    __tablename__ = 'trafficlanes'
    id = db.Column(db.Integer, primary_key=True)
    buildingid = db.Column(db.Integer, nullable=False)
    lanetype = db.Column(db.String(10), nullable=False)
    lanename = db.Column(db.String(10), nullable=False)
    currentqueue = db.Column(db.Integer, default=0)