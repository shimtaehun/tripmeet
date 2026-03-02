import os
import uuid
import boto3
from botocore.config import Config

def _get_r2_client():
    """Cloudflare R2 클라이언트 생성 (S3 호환 API)"""
    return boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT_URL"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_image(file_bytes: bytes, content_type: str, folder: str = "images") -> str:
    """
    이미지를 Cloudflare R2에 업로드하고 퍼블릭 URL을 반환한다.
    클라이언트에서 500KB 이하로 압축된 파일을 전달받는 것을 전제로 한다.

    :param file_bytes: 이미지 바이트 데이터
    :param content_type: MIME 타입 (예: image/jpeg)
    :param folder: R2 내 저장 경로 prefix
    :return: 퍼블릭 접근 가능한 이미지 URL
    """
    bucket = os.environ["R2_BUCKET_NAME"]
    public_url_base = os.environ["R2_PUBLIC_URL"].rstrip("/")

    ext = content_type.split("/")[-1]
    key = f"{folder}/{uuid.uuid4()}.{ext}"

    client = _get_r2_client()
    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )

    return f"{public_url_base}/{key}"
