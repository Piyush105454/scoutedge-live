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
# Configure CORS to be more flexible for production and development
allowed_origins = [
    os.getenv("FRONTEND_URL", "https://scoutedge.vercel.app"),
    "https://scoutedge.vercel.app",
    "https://scoutedge.vercel.app/",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8081",
    "http://localhost:8080"
]
# Remove any accidental trailing slashes and filter out empty strings
allowed_origins = [origin.rstrip('/') for origin in allowed_origins if origin]
CORS(app, origins=allowed_origins, supports_credentials=True)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 # 50MB limit
app.config['MAX_FORM_MEMORY_SIZE'] = 2 * 1024 * 1024 # Only allow 2MB of non-file form data in RAM


# Register all routes
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(analysis_bp, url_prefix='/api')
app.register_blueprint(matches_bp, url_prefix='/api')
app.register_blueprint(players_bp, url_prefix='/api')
app.register_blueprint(jobs_bp, url_prefix='/api')

@app.route('/')
def index():
    return {"status": "ScoutEdge API running", "version": "1.0"}

@app.route('/api/health')
def health_check():
    # Basic heartbeat/health endpoint
    return {
        "status": "healthy",
        "service": "scoutedge-backend",
        "database": "connected" # You could add real DB check here if needed
    }

if __name__ == '__main__':
    app.run(debug=True, port=5000)
