from db.base_repository import BaseRepository
from db.models.Message import Message


class MessageRepository(BaseRepository):
    def __init__(self, session_factory):
        super().__init__(session_factory)

    def add_message(self, conversation_id: int, role: str, content: str):
        with self.session_scope() as session:
            message = Message(
                conversation_id=conversation_id, role=role, content=content
            )
            session.add(message)
            session.commit()
