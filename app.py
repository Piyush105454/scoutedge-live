from flask import Flask
from flask_cors import CORS
from routes.upload import upload_bp
from routes.analysis import analysis_bp
from routes.matches import matches_bp
from routes.players import players_bp
from routes.jobs import jobs_bp

import os
if not os.path.exists('static/clips'):
    os.makedirs('static/clips', exist_ok=True)

app = Flask(__name__, static_folder='static')
CORS(app)  # allows React frontend to connect

# Register all routes
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(analysis_bp, url_prefix='/api')
app.register_blueprint(matches_bp, url_prefix='/api')
app.register_blueprint(players_bp, url_prefix='/api')
app.register_blueprint(jobs_bp, url_prefix='/api')

@app.route('/')
def health():
    return {"status": "ScoutEdge API running", "version": "1.0"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
