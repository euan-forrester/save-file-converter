import boto3
import urllib.parse
import logging
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
recipient_email = 'you@example.com'

# The S3 bucket and key for CodeBuild logs
bucket = 'codebuild-logs-bucket'
key_prefix = 'codebuild/logs/'

logger.info(f'Trying to send email to {recipient_email}')

def download_logs_and_send_email(event, context):
  """
  try:
    # Extract the CodeBuild build ID from the CloudWatch event
    build_id = event['detail']['build-id']
        
    # Get the S3 object key for the build logs
    s3_object_key = key_prefix + build_id + '.log'
        
    # Download the build logs from S3
    build_logs = s3.get_object(Bucket=bucket, Key=s3_object_key)['Body'].read().decode('utf-8')
        
    # Send the build logs via email using Amazon SES
    send_email(build_logs)
        
    # Log success
    logger.info(f'Successfully sent CodeBuild logs for build {build_id}')
        
  except Exception as e:
    # Log any errors
    logger.error(f'Error: {str(e)}')
  """
  logger.info(f'Received event: {event}')
  logger.info(f'Received context: {context}')

def send_email(build_logs):
  try:
    # Construct the email message
    message = f"""Subject: CodeBuild Build Failed - Build Logs
        
    Build logs:
    {build_logs}"""
        
    # Send the email
    response = ses.send_email(
      Source=recipient_email,
      Destination={
        'ToAddresses': [recipient_email]
      },
      Message={
        'Subject': {
          'Data': 'CodeBuild Build Failed - Build Logs'
        },
        'Body': {
          'Text': {
            'Data': message
          }
        }
      }
    )
        
    # Log success
    logger.info(f'Successfully sent email: {response["MessageId"]}')
        
  except ClientError as e:
    # Log any errors
    logger.error(f'Error sending email: {e.response["Error"]["Message"]}')
