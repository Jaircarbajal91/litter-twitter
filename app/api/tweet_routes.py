from flask import Blueprint, jsonify, session, request
from flask_login import login_required, current_user
from app.models import Tweet, comments, db, User, Comment, Like
from app.forms import TweetForm
from .auth_routes import validation_errors_to_error_messages
from sqlalchemy.orm import joinedload, selectinload


tweet_routes = Blueprint('tweets', __name__)


def _serialize_user_basic(user):
    if not user:
        return None
    return {
        'id': user.id,
        'username': user.username,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'profileImage': user.profile_image
    }


@tweet_routes.route('/<path:username>/')
@tweet_routes.route('/<path:username>')
@login_required
def get_all_user_tweets(username):
    user = User.query.filter(User.username == username).first()
    if not user:
        return {"error": "username not found"}, 404

    tweets = (
        Tweet.query.filter(Tweet.user_id == user.id)
        .options(
            selectinload(Tweet.tweet_comments).joinedload(Comment.user),
            selectinload(Tweet.tweet_comments).selectinload(Comment.comment_images),
            selectinload(Tweet.tweet_likes),
            selectinload(Tweet.tweet_images),
        )
        .order_by(Tweet.created_at.desc())
        .all()
    )

    tweets_details = []
    for tweet in tweets or []:
        tweet_dict = tweet.to_dict()
        tweet_dict["user"] = _serialize_user_basic(tweet.user)
        tweet_dict["tweet_comments"] = [
            {
                **comment.to_dict(),
                "user": _serialize_user_basic(comment.user),
            }
            for comment in sorted(
                tweet.tweet_comments,
                key=lambda c: c.created_at,
                reverse=True,
            )
        ]
        tweets_details.append(tweet_dict)

    return {
        "user": user.to_dict(),
        "tweets": tweets_details,
    }


@tweet_routes.route('/home/')
@tweet_routes.route('/home')
@login_required
def get_all_tweets():
    # Get pagination parameters from query string
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # Query with pagination, ordered by created_at descending
    # Use eager loading to prevent N+1 queries
    paginated_tweets = db.session.query(Tweet) \
        .options(
            joinedload(Tweet.user),  # Load user (one-to-one)
            selectinload(Tweet.tweet_comments).joinedload(Comment.user),  # Load comments and their users
            selectinload(Tweet.tweet_comments).selectinload(Comment.comment_images),  # Load comment images
            selectinload(Tweet.tweet_likes),  # Load likes
            selectinload(Tweet.tweet_images)  # Load images
        ) \
        .order_by(Tweet.created_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    tweets_details = []
    if paginated_tweets.items:
        for tweet in paginated_tweets.items:
            tweet_dict = tweet.to_dict()
            tweet_dict['user'] = _serialize_user_basic(tweet.user)
            tweet_dict['tweet_comments'] = [
                {
                    **comment.to_dict(),
                    'user': _serialize_user_basic(comment.user)
                } for comment in sorted(
                    tweet.tweet_comments,
                    key=lambda c: c.created_at,
                    reverse=True
                )
            ]
            tweets_details.append(tweet_dict)

    return {
        'tweets': tweets_details,
        'has_more': paginated_tweets.has_next,
        'page': page,
        'per_page': per_page
    }


@tweet_routes.route('/detail/<int:id>/', methods=['GET'])
@tweet_routes.route('/detail/<int:id>', methods=['GET'])
@login_required
def get_single_tweet(id):
    tweet = db.session.query(Tweet).options(
        joinedload(Tweet.user),
        selectinload(Tweet.tweet_comments).joinedload(Comment.user),
        selectinload(Tweet.tweet_comments).selectinload(Comment.comment_images),
        selectinload(Tweet.tweet_likes),
        selectinload(Tweet.tweet_images)
    ).filter(Tweet.id == id).one_or_none()

    if tweet is None:
        return {'errors': 'Tweet not found'}, 404

    tweet_dict = tweet.to_dict()
    tweet_dict['user'] = _serialize_user_basic(tweet.user)
    tweet_dict['tweet_comments'] = [
        {
            **comment.to_dict(),
            'user': _serialize_user_basic(comment.user)
        } for comment in sorted(
            tweet.tweet_comments,
            key=lambda c: c.created_at,
            reverse=True
        )
    ]

    return tweet_dict


@tweet_routes.route('/', methods=['POST'])
@tweet_routes.route('', methods=['POST'])
@login_required
def post_new_tweet():
    form = TweetForm()
    form['csrf_token'].data = request.cookies['csrf_token']
    if form.validate_on_submit():
        new_tweet = Tweet(
            content=form.data['content'],
            user_id=int(current_user.get_id())
        )
        db.session.add(new_tweet)
        db.session.commit()
        return new_tweet.to_dict()
    return {'errors': validation_errors_to_error_messages(form.errors)}, 400


@tweet_routes.route('/<int:id>/', methods=['PUT'])
@tweet_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_tweet(id):
    tweet = Tweet.query.get(id)
    if tweet is not None:
        tweet_dict = tweet.to_dict()
        if tweet_dict['user_id'] != int(current_user.get_id()):
            return {'errors': 'You are unauthorized to update this tweet'}, 403
        else:
            user = User.query.filter(User.id == tweet_dict["user_id"]).first()
            comments = Comment.query.filter(Comment.tweet_id == tweet_dict["id"]).all()
            form = TweetForm()
            form['csrf_token'].data = request.cookies['csrf_token']
            if form.validate_on_submit():
                tweet.content = form.data["content"]
                result = tweet.to_dict()
                result["user"] = user.to_dict()
                if comments is not None and len(comments) > 0:
                    comments_result = [comment.to_dict() for comment in comments]
                    result["comments"] = comments_result
                else:
                    result["comments"] = []
                db.session.commit()
                return result
            return {'errors': validation_errors_to_error_messages(form.errors)}, 400
    else:
        return {'errors': 'Tweet not found'}, 404


@tweet_routes.route('/<int:id>/', methods=['DELETE'])
@tweet_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_tweet(id):
    tweet = Tweet.query.get(id)
    if tweet is not None:
        tweet_dict = tweet.to_dict()
        if tweet_dict['user_id'] != int(current_user.get_id()):
            return {'errors': 'You are unauthorized to delete this tweet'}, 403
        else:
            form = TweetForm()
            form['csrf_token'].data = request.cookies['csrf_token']
            db.session.delete(tweet)
            db.session.commit()
            return {"message": "Tweet successfully deleted"}
    return {'errors': 'Tweet not found'}, 404


@tweet_routes.route('/<int:id>/like/', methods=['POST'])
@tweet_routes.route('/<int:id>/like', methods=['POST'])
def like_tweet(id):
    tweet = Tweet.query.get(id)
    if tweet is not None:
        tweet_dict = tweet.to_dict()
        likes_list = tweet_dict["tweet_likes"]
        user_likes = [x for x in likes_list if x["user_id"] == int(current_user.get_id())]
        if len(user_likes) > 0:
            return {"message": "Cannot like a tweet more than once"}, 400
        new_like = Like(
            user_id = int(current_user.get_id()),
            tweet_id = id
        )
        db.session.add(new_like)
        db.session.commit()
        return new_like.to_dict()
    else:
        return {"message": "Tweet does not exist"}, 404
