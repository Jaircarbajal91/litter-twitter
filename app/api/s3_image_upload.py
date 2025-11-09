import boto3
import botocore  # noqa: F401
import imghdr
import os
import uuid
import logging

from werkzeug.utils import secure_filename

BUCKET_NAME = os.environ.get("S3_BUCKET")
AWS_REGION = os.environ.get("AWS_DEFAULT_REGION", "us-west-2")
logger = logging.getLogger(__name__)

if BUCKET_NAME:
    S3_LOCATION = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/"
else:
    S3_LOCATION = ""
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
}
ALLOWED_IMGHDR_TYPES = {"png", "jpeg", "gif", "webp"}
MAX_IMAGE_FILE_SIZE = int(os.environ.get("MAX_IMAGE_FILE_SIZE", 5 * 1024 * 1024))

s3 = boto3.client(
   "s3",
   region_name=AWS_REGION,
   aws_access_key_id=os.environ.get("S3_KEY"),
   aws_secret_access_key=os.environ.get("S3_SECRET")
)


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def sanitize_filename(filename: str) -> str:
    return secure_filename(filename or "")


def get_unique_filename(filename: str) -> str:
    ext = filename.rsplit(".", 1)[1].lower()
    unique_filename = uuid.uuid4().hex
    return f"{unique_filename}.{ext}"


def validate_image_file(file):
    if not file or not file.filename:
        return False, "image required"

    sanitized_name = sanitize_filename(file.filename)
    if not sanitized_name:
        return False, "invalid filename"

    if not allowed_file(sanitized_name):
        return False, "file type not permitted"

    if file.mimetype not in ALLOWED_MIME_TYPES:
        return False, "mimetype not permitted"

    # Determine file size without consuming the stream
    file.stream.seek(0, os.SEEK_END)
    file_size = file.stream.tell()
    file.stream.seek(0)

    if file_size > MAX_IMAGE_FILE_SIZE:
        return False, "file too large"

    header_bytes = file.stream.read(512)
    file.stream.seek(0)
    image_type = imghdr.what(None, header_bytes)
    if image_type not in ALLOWED_IMGHDR_TYPES:
        return False, "file content not recognized as an image"

    return True, sanitized_name


def upload_file_to_s3(file, acl="public-read"):
    try:
        # Note: When Object Ownership is set to "ACLs disabled", we don't set ACL
        # Access is controlled via bucket policy instead
        extra_args = {
            "ContentType": file.content_type
        }
        
        # Only set ACL if bucket has ACLs enabled (for backward compatibility)
        # With ACLs disabled (recommended), bucket policy handles public access
        # Uncomment the line below only if you have ACLs enabled:
        # extra_args["ACL"] = acl
        
        s3.upload_fileobj(
            file,
            BUCKET_NAME,
            file.filename,
            ExtraArgs=extra_args
        )
    except Exception as e:
        # in case the our s3 upload fails
        logger.exception("S3 upload failed")
        return {"errors": str(e)}

    return {"url": f"{S3_LOCATION}{file.filename}"}
