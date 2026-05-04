import pytest
from app import app as flask_app
from models.database import get_db_connection
import os
from dotenv import load_dotenv

load_dotenv()

@pytest.fixture
def app():
    flask_app.config.update({
        "TESTING": True,
    })
    return flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture
def db_conn():
    conn = get_db_connection()
    yield conn
    conn.close()
