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
s3 = boto3.resource('s3')
ses = boto3.client('ses')

# Email address to send logs to
recipient_email = os.environ.get('EMAIL_ADDRESS')

if recipient_email is None:
  logger.error('EMAIL_ADDRESS is not set. Exiting')
  sys.exit(1)

def download_logs_and_send_email(event, context):
  logger.info(f'Received event: {event}')
  logger.info(f'Received context: {context}')

  build_status = event['BuildStatus']
  project_name = event['ProjectName']
  build_id = event['BuildId']
  build_guid = build_id.split(':')[-1]
  bucket = event['LogsBucketId']
  key_prefix = event['LogsDirectory']

  logger.info(f'Build status: {build_status}')
  logger.info(f'Project name: {project_name}')
  logger.info(f'Build GUID:   {build_guid}')
  logger.info(f'Bucket:       {bucket}')
  logger.info(f'Key prefix:   {key_prefix}')

  try:
    s3_object_key = key_prefix + '/' + build_guid + '.gz'

    logger.info(f'S3 object key: {s3_object_key}')

    s3_object = s3.Object(bucket, s3_object_key)
    s3_stream = s3_object.get()['Body']

    with gzip.GzipFile(fileobj=s3_stream, mode='rb') as f_in:
      build_logs = f_in.read()
        
    # Send the build logs via email using Amazon SES
    send_email(event, build_logs)
        
    # Log success
    logger.info(f'Successfully sent CodeBuild logs for build {build_id}')
        
  except Exception as e:
    # Log any errors
    logger.error(f'Error: {str(e)}')
    sys.exit(1)

def send_email(event, build_logs):
  try:
    # Construct the email message
    #message = f"""Subject: CodeBuild Build Failed - Build Logs
    #    
    #Build logs:
    #{build_logs}"""
     
    '''   
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
    '''
     
    logger.info(f'Found build log: {build_logs}')

    # Log success
    #logger.info(f'Successfully sent email: {response["MessageId"]}')
    sys.exit(0)    

  except ClientError as e:
    # Log any errors
    logger.error(f'Error sending email: {e.response["Error"]["Message"]}')
    sys.exit(1)
