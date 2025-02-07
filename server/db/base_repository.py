from contextlib import contextmanager
from sqlalchemy.orm import scoped_session


class BaseRepository:
    def __init__(self, session_factory):
        self.session_factory = scoped_session(session_factory)

    @contextmanager
    def session_scope(self):
        """Provide a transactional scope around a series of operations."""
        session = self.session_factory()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
            self.session_factory.remove()
