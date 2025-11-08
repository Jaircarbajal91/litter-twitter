from .db import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


follows = db.Table(
    'follows',
    db.Column('follower_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('following_id', db.Integer, db.ForeignKey('users.id'))
)


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(40), nullable=False, unique=True)
    first_name = db.Column(db.String(40), nullable=False)
    last_name = db.Column(db.String(40), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    profile_image = db.Column(db.String(255), nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)

    user_tweets = db.relationship(
        'Tweet', back_populates='user', cascade='all, delete')

    user_comments = db.relationship(
        'Comment', back_populates='user', cascade='all, delete')

    user_likes = db.relationship(
        'Like', back_populates='user', cascade='all, delete')

    user_images = db.relationship(
        'Image', back_populates='user', cascade='all, delete')

    @property
    def password(self):
        return self.hashed_password

    @password.setter
    def password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def to_dict(self):
        banner_image = next(
            (image.url for image in self.user_images if getattr(image, 'type', None) == 'user_header'),
            None
        )
        return {
            'id': self.id,
            'username': self.username,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'profileImage': self.profile_image,
            'profileBannerImage': banner_image,
            'user_tweets': [x.to_dict() for x in self.user_tweets],
            'followers': [user.id for user in self.followers],
            'following': [user.id for user in self.following]
        }

    followers = db.relationship(
            'User',
            secondary=follows,
            primaryjoin=(follows.c.following_id == id),
            secondaryjoin=(follows.c.follower_id == id),
            backref=db.backref("following", lazy="dynamic"),
            lazy="dynamic",
            cascade='all, delete'
        )
