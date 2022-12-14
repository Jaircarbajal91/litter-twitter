from .db import db
from flask_login import UserMixin
from sqlalchemy.orm import relationship
from sqlalchemy.schema import Column, ForeignKey
from sqlalchemy.types import Integer, String, Float, DateTime, Date
from app.models import User

# tweet_likes = db.Table()

class Tweet(db.Model, UserMixin):
    __tablename__ = 'tweets'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(280), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), onupdate=db.func.now())


    user = db.relationship(
        'User', back_populates='user_tweets', foreign_keys=[user_id])

    tweet_comments = db.relationship('Comment', back_populates='tweet', cascade='all, delete')

    tweet_likes = db.relationship('Like', back_populates='tweet', cascade='all, delete')

    tweet_images = db.relationship('Image', back_populates='tweet', cascade='all, delete')


    @property
    def tweet_details(self):
        return self.to_dict()

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'user_id': self.user_id,
            'created_at': self.created_at,
            'tweet_comments': [x.to_dict() for x in self.tweet_comments],
            'tweet_likes': [like.to_dict() for like in self.tweet_likes],
            'tweet_images': [image.to_dict() for image in self.tweet_images]
        }
