import json
import random
from app import app
from models import db, Vehicle, ParkingSlot, BuildingLayout, TrafficLane, ParkingSession

with app.app_context():
    # COMPLETE RESET
    db.drop_all()
    db.create_all()
    
    # Vehicles with key frequencies
    vehicles = [
        ('Toyota', 'Camry', 315.00, 4885, 1840, 1445, 'sedan'),
        ('Honda', 'Civic', 315.25, 4549, 1800, 1415, 'compact'),
        ('Tesla', 'Model 3', 315.50, 4694, 1849, 1443, 'sedan'),
        ('Hyundai', 'Creta', 433.25, 4300, 1790, 1635, 'suv'),
        ('BMW', 'X5', 868.00, 4922, 2004, 1745, 'suv'),
        ('Ford', 'F-150', 315.75, 5890, 2029, 1961, 'truck'),
        ('Maruti', 'Swift', 433.00, 3845, 1735, 1530, 'compact'),
        ('Toyota', 'Fortuner', 315.60, 4795, 1855, 1835, 'suv')
    ]
    
    for v in vehicles:
        db.session.add(Vehicle(brand=v[0], model=v[1], keyfrequency=v[2], 
                             lengthmm=v[3], widthmm=v[4], heightmm=v[5], sizecategory=v[6]))
    
    # Layout
    layout = BuildingLayout(name='Mall B1', totalfloors=1, rowsperfloor=6, colsperfloor=10)
    db.session.add(layout)
    db.session.flush()
    
    # 58 FREE SLOTS (ALL EMPTY)
    obstacles = [(2,4), (3,4)]
    slot_configs = [
        (0, 'compact', 2300, 4500), (1, 'compact', 2300, 4500),
        (2, 'standard', 2600, 5200), (3, 'standard', 2600, 5200),
        (4, 'large', 3000, 5800), (5, 'xl', 3500, 6500)
    ]
    
    for row in range(6):
        for col in range(10):
            if (row, col) in obstacles: continue
            slottype, width, depth = slot_configs[row][1:]
            db.session.add(ParkingSlot(
                buildingid=layout.id, floor=0, row=row, col=col, slottype=slottype,
                widthmm=width, depthmm=depth, isoccupied=False, rfidcardid=None
            ))
    
    db.session.commit()
    print('✅ Database RESET: 58 FREE slots + 8 vehicles ready!')