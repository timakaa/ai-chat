from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, UTC
from typing import List, Dict

Base = declarative_base()


class Database:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance

    def __init__(self, db_path: str = "chat_history.db"):
        if not hasattr(self, "initialized"):
            DATABASE_URL = f"sqlite:///{db_path}"
            self.engine = create_engine(DATABASE_URL, echo=False)
            Base.metadata.create_all(self.engine)

            # Create session factory with scoped_session
            session_factory = sessionmaker(
                bind=self.engine,
                expire_on_commit=False,  # Prevents detached instance errors
            )

            self.Session = session_factory
            self.initialized = True


db = Database()

__all__ = ["Database", "Conversation", "Message", "db"]
