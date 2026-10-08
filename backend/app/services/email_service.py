import os

from dotenv import load_dotenv
from email.message import EmailMessage
import aiosmtplib


load_dotenv()


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


async def send_email(
    recipient: str,
    subject: str,
    body: str
):
    message = EmailMessage()

    message["From"] = SMTP_USERNAME
    message["To"] = recipient
    message["Subject"] = subject

    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
        start_tls=True
    )