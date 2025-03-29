from flask import Flask
from flask_cors import CORS
from config.config import Config
from models.models import db
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.health import health_bp

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app, origins=Config.CORS_ORIGINS, supports_credentials=True)
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(health_bp)
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001) 