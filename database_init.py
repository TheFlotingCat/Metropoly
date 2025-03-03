from __future__ import annotations
from sqlalchemy import create_engine, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship, Mapped
from sqlalchemy.schema import Column
from sqlalchemy.types import Integer, String


engine = create_engine('sqlite:///database/database.db', echo=True)

Session = sessionmaker(bind=engine)

session = Session()

Base = declarative_base()


class Users(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)

    name = Column('name', String(20))
    password = Column('password', String(50))
    current_game_id = Column('game id', Integer, default=0)
    amount_of_played_games = Column('amount of games', Integer, default=0)

    token: Mapped["Tokens"] = relationship(back_populates='user')


class Tokens(Base):
    __tablename__ = 'tokens'

    id = Column(Integer, primary_key=True)

    token = Column('token', String(100))
    user_id = Column(ForeignKey('users.id'))

    user: Mapped["Users"] = relationship(back_populates='token')


class Rooms(Base):
    __tablename__ = 'rooms'

    id = Column(Integer, primary_key=True)

    password = Column('password', String(50))
    websocket_address = Column('websocket', String(50))
    max_players = Column('max_players', Integer)
    amount_of_players = Column('players', Integer, default=0)


Base.metadata.create_all(engine)
