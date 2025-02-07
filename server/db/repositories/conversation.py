from db.base_repository import BaseRepository
from db.models.Conversation import Conversation
from db.models.Message import Message
from typing import List, Dict
from sqlalchemy import func


class ConversationRepository(BaseRepository):
    def __init__(self, session_factory):
        super().__init__(session_factory)

    def create_conversation(self, title: str) -> int:
        with self.session_scope() as session:
            conversation = Conversation(title=title)
            session.add(conversation)
            session.commit()
            return conversation.id

    def get_conversation(self, conversation_id: int) -> List[Dict]:
        with self.session_scope() as session:
            messages = (
                session.query(Message)
                .filter(Message.conversation_id == conversation_id)
                .order_by(Message.created_at)
                .all()
            )
            return [{"role": msg.role, "content": msg.content} for msg in messages]

    def get_conversations(self) -> List[Dict]:
        with self.session_scope() as session:
            conversations = (
                session.query(
                    Conversation,
                    func.count(Message.id).label("message_count"),
                )
                .outerjoin(Message)
                .group_by(Conversation.id)
                .order_by(Conversation.created_at.desc())
                .all()
            )

            return [
                {
                    "id": conv.Conversation.id,
                    "created_at": conv.Conversation.created_at,
                    "title": conv.Conversation.title,
                    "message_count": conv.message_count,
                }
                for conv in conversations
            ]

    def delete_conversation(self, conversation_id: int):
        with self.session_scope() as session:
            conversation = (
                session.query(Conversation)
                .filter(Conversation.id == conversation_id)
                .first()
            )
            if conversation:
                session.delete(conversation)
                session.commit()
