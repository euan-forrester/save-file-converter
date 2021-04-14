# Save File Converter

Web-based tool to convert save files from retro game consoles to different formats

![Save file conversion](https://github.com/euan-forrester/save-file-converter/raw/main/images/main-window.png "Save file conversion")

Production instance found at https://savefileconverter.com

Instructions:
1. Find the file you want to convert 
2. Choose which kind of file it is from the top of the window
3. Click the arrow for which way you want to do the conversion
4. Choose the file to convert
5. Change the output filename if necessary
6. Click Convert!

## Upcoming features

- Convert PS1 saves to/from PSP/PS3 virtual memory cards
- Convert Retro Freak files
- I need suggestions!

## Save file formats

- Retron5: https://www.retro5.net/viewtopic.php?f=5&t=67&start=10
- PSP PS1 virtual memory card: https://psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PSP_.28.VMP.29
- PS3 PS1 virtual memory card: https://psdevwiki.com/ps3/PS1_Savedata#Virtual_Memory_Card_PS1_.28.VM1.29
- MemcardRex format: https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs
- DexDrive format (?): https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/Hardware/DexDrive.cs
- GameShark format (GBA, partial): https://gbatemp.net/threads/converting-gsv-or-sps-files-to-sav.51838/#post-664786
- GameShark format (GBA [reading], partial): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1025
- GameShark format (GBA [writing], partial): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1146
- GameShark format (partial): https://github.com/mgba-emu/mgba/blob/master/src/gba/sharkport.c
- GameShark SP format (GBA [reading], partial): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1078
- GameShark format (PS2, partial): https://www.ps2savetools.com/documents/xps-format/
- PS2 memory card formats: http://www.csclub.uwaterloo.ca:11068/mymc/

## GBA save file size difficulty
- https://zork.net/~st/jottings/GBA_saves.html
- https://dillonbeliveau.com/2020/06/05/GBA-FLASH.html

## Devices that can read/write cart saves
- https://kb.speeddemosarchive.com/Save_Managers

## Deployment instructions

### Backend setup: AWS and terraform

First we need to create the infrastructure that the system will run on

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

In your `terraform.tfvars` file, fill in the various parts. If you choose to create a domain, do so manually in the AWS console then put the domain name and Route 53 Zone ID created by Route 53 into this file.

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
and for production:
```
yarn build --mode production
yarn deploy --mode production
yarn deploy:cleanup --mode production
```

Go into S3 to get the domain for your bucket. 

Point your browser there and enjoy!
