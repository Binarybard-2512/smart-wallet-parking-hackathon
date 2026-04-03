from flask import Blueprint, request, jsonify
entry_bp = Blueprint('entry', __name__)

# Full entry.py from paste.txt: /start, /detect-vehicle, /assign-slot, /confirm-park