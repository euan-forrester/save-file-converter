import boto3
import urllib.parse
import logging
import sys
import os
import gzip
from botocore.exceptions import ClientError

if logging.getLogger().hasHandlers():
  # The Lambda environment pre-configures a handler logging to stderr. If a handler is already configured,
  # `.basicConfig` does not execute. Thus we set the level directly.
  logging.getLogger().setLevel(logging.INFO)
else:
  logging.basicConfig(level=logging.INFO)

logger = logging.getLogger()

# AWS SDK Clients
s3 = boto3.client('s3')
ses = boto3.client('ses')

# Email address to send logs to
recipient_email = os.environ.get('EMAIL_ADDRESS')

if recipient_email is None:
  logger.error('EMAIL_ADDRESS is not set. Exiting')
  sys.exit(1)

def send_email(from_email_address, to_email_address, subject_line, body_text):
  # Object structure described at https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ses/client/send_email.html#
  send_args = {
    'Source': from_email_address,
    'Destination': {
      'ToAddresses': [to_email_address],
    },
    'Message': {
      'Subject': {'Data': subject_line},
      'Body': {'Text': {'Data': body_text}}
    }
  }
    
  try:
    response = ses.send_email(**send_args)
    message_id = response['MessageId']
    logging.info(f"Sent email '{message_id}' with subject '{subject_line}' from '{from_email_address}' to '{to_email_address}'")
  except ClientError:
    logging.exception(f"Could not send mail from '{from_email_address}' to '{to_email_address}'")
    raise

def download_logs_and_send_email(event, context):
  logger.info(f'Received event: {event}')
  logger.info(f'Received context: {context}')

  build_status = event['BuildStatus']
  project_name = event['ProjectName']
  build_id = event['BuildId']
  build_guid = build_id.split(':')[-1]
  bucket = event['LogsBucketId']
  key_prefix = event['LogsDirectory'].removeprefix('/') # S3 Object keys don't start with "/"

  logger.info(f"Build status: {build_status}")
  logger.info(f"Project name: {project_name}")
  logger.info(f"Build GUID:   {build_guid}")
  logger.info(f"Bucket:       {bucket}")
  logger.info(f"Key prefix:   {key_prefix}")

  s3_object_key = f"{key_prefix}/{build_guid}.gz"

  logger.info(f"S3 object key: {s3_object_key}")

  s3_object = s3.get_object(Bucket=bucket, Key=s3_object_key)
  s3_stream = s3_object['Body']

  logger.info("Read build log data from S3")

  with gzip.GzipFile(fileobj=s3_stream, mode='rb') as f_in:
    build_logs = f_in.read().decode('utf-8')

  logger.info("Decompressed build log data")

  # Send the build logs via email

  build_status_cased = build_status

  if build_status == 'SUCCEEDED':
    build_status_cased = build_status.lower() # Keep FAILED and STOPPED as all-caps

  subject_line = f"{project_name} Build {build_status_cased}"
  body_text = f"Build logs:\n\n{build_logs}"
        
  send_email(recipient_email, recipient_email, subject_line, body_text)
  
  # And we're all done!

  logger.info(f'Successfully finished execution for build {build_id}')
