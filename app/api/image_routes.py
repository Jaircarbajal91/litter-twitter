from flask import Blueprint, request
from app.models import db, Image, User
from flask_login import current_user, login_required
from .s3_image_upload import (
    upload_file_to_s3,
    get_unique_filename,
    validate_image_file,
)

import boto3
import os

image_routes = Blueprint("images", __name__)


@image_routes.route("/", methods=["POST"])
@image_routes.route("", methods=["POST"])
@login_required
def upload_image():
    if "image" not in request.files:
        return {"errors": "image required"}, 400

    image = request.files["image"]
    form_type = request.form.get('type')
    user_id = request.form.get('user_id')

    is_valid, validation_result = validate_image_file(image)
    if not is_valid:
        return {"errors": validation_result}, 400

    sanitized_name = validation_result

    image.filename = get_unique_filename(sanitized_name)

    upload = upload_file_to_s3(image)

    if "url" not in upload:
        # if the dictionary doesn't have a url key
        # it means that there was an error when we tried to upload
        # so we send back that error message
        return upload, 400

    url = upload["url"]
    # flask_login allows us to get the current user from the request
    if user_id:
        try:
            user_id_int = int(user_id)
        except (TypeError, ValueError):
            return {"errors": "invalid user id"}, 400
        if user_id_int != int(current_user.get_id()):
            return {"errors": "unauthorized user id"}, 403
    else:
        return {"errors": "user id required"}, 400

    if form_type == 'tweet':
      try:
        tweet_id = int(request.form.get('tweet_id'))
      except (TypeError, ValueError):
        return {"errors": "tweet id required"}, 400
      new_image = Image(user_id=user_id_int, url=url, type=form_type, tweet_id=tweet_id, key=image.filename)
      db.session.add(new_image)
      db.session.commit()
      return {"url": url}
    if form_type == 'comment':
      try:
        comment_id = int(request.form.get('comment_id'))
      except (TypeError, ValueError):
        return {"errors": "comment id required"}, 400
      new_image = Image(user_id=user_id_int, url=url, type=form_type, comment_id=comment_id, key=image.filename)
      db.session.add(new_image)
      db.session.commit()
      return {"url": url}
    if form_type == 'user':
      new_image = Image(user_id=user_id_int, url=url, type=form_type, key=image.filename)
      db.session.add(new_image)
      # Update user's profile_image field
      user = User.query.get(user_id_int)
      if user:
        user.profile_image = url
      db.session.commit()
      return {"url": url}

    return {"errors": "invalid form type"}, 400


@image_routes.route("/", methods=["DELETE"])
@image_routes.route("", methods=["DELETE"])
@login_required
def delete_image_from_bucket():
  key = request.form.get('key')
  bucket_name = os.environ.get("S3_BUCKET")
  s3_recource=boto3.client(
    's3',
    aws_access_key_id=os.environ.get("S3_KEY"),
    aws_secret_access_key=os.environ.get("S3_SECRET")
  )
  s3_recource.delete_object(
    Bucket=bucket_name,
    Key=key
  )
  id = request.form.get('id')
  image = Image.query.get(id)
  if image is not None:
        image_dict = image.to_dict()
        if image_dict['user_id'] != int(current_user.get_id()):
            return {'errors': 'You are unauthorized to delete this tweet'}, 403
        else:
            db.session.delete(image)
            db.session.commit()
            return {"message": "item successfully deleted from s3 bucket"}
  return {"error": "Image not found"}
