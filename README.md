# save-file-converter
Web-based tool to convert save files from retro game consoles to different formats

Retron5 save file format: https://www.retro5.net/viewtopic.php?f=5&t=67&start=10
PSP PS1 virtual memory card format: https://psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PSP_.28.VMP.29

## Instructions

### Backend setup: AWS and terraform

First we need to create the infrastructure that the various parts of the system will run on

#### Install packages

```
brew install terraform
```

#### Create an AWS account

Go to https://aws.amazon.com/ and click on "Create an AWS Account"

Then create an IAM user within that account. This user will need to have various permissions to create different kinds of infrastructure.

Copy the file `terraform/aws_credentials.example` to `terraform/aws_credentials`
- Copy the new user's AWS key and secret key into the new file you just created.

#### Run terraform

Note that this will create infrastructure within your AWS account and could result in billing charges from AWS

Note: Run terraform with the environment variable `TF_LOG=1` to help debug permissions issues.

For convenience we will create a symlink to our `terraform.tfvars` file. You can also import these variables from the command line when you run terraform if you prefer.

```
cd terraform/dev
ln -s ../terraform.tfvars terraform.tfvars
terraform init
terraform plan
terraform apply
```
### Frontend setup

#### Install packages

```
cd ../../frontend
brew install yarn
yarn install
```

#### Optional project dashboard

```
yarn global add @vue/cli
vue ui
```

Then go to: http://localhost:8000/dashboard

#### Deploy the frontend

Edit the bucket names in `frontend/vue.config.js` and `frontend/.env.production` to be the website s3 bucket(s) created by terraform if necessary. Similarly for the CloudFront IDs.

```
yarn build --mode development
yarn deploy --mode development
```

Go into S3 to get the domain for our bucket. 

Point your browser there and enjoy!
