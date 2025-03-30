import os


class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///health_portal.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.urandom(24)
    CORS_ORIGINS = [os.getenv("FRONTEND_URL", "http://localhost:5173")]
