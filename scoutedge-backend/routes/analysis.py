from flask import Blueprint, jsonify

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analyze', methods=['POST'])
def start_analysis():
    return jsonify({"message": "Analysis started", "job_id": "123"}), 202
