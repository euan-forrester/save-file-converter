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

- Decrypt PSP saves
- Be able to autodetect the format of a given save file (note that raw files need their size checked, unrecognized size means invalid file)
- PS2 formats (check out https://gamefaqs.gamespot.com/ps2/536777-suikoden-iii/saves for a potential list)
- What are the 64kB `.srm` files for SNES etc on thetechgame.com? Want to extract a 'normal' `.srm` file from them
- I need suggestions!

## Save file formats

- Retron5
  - https://www.retro5.net/viewtopic.php?f=5&t=67&start=10
- GameShark (GBA)
  - (partial): https://gbatemp.net/threads/converting-gsv-or-sps-files-to-sav.51838/#post-664786
  - (reading): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1025
  - (writing): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1146
  - (partial): https://github.com/mgba-emu/mgba/blob/master/src/gba/sharkport.c
- GameShark SP (GBA)
  - (reading): https://github.com/visualboyadvance-m/visualboyadvance-m/blob/master/src/gba/GBA.cpp#L1078
- GameShark (PS2)
  - (partial): https://www.ps2savetools.com/documents/xps-format/
- PS3 PS1/PS2 virtual memory card: https://github.com/bucanero/psv-save-converter
- PS2
  - Save Tools: https://www.ps2savetools.com/
  - Save tool: http://www.csclub.uwaterloo.ca:11068/mymc/
  - Memory card format: http://www.csclub.uwaterloo.ca:11068/mymc/ps2mcfs.html
- Wii Virtual Console save game format (note that the files are encrypted)
  - https://wiibrew.org/wiki/Wii_Savegame_Parser
  - https://wiibrew.org/wiki/Savegame_Files
  - https://wiibrew.org/wiki/FE100
  - https://hackmii.com/2008/04/keys-keys-keys/
  - https://github.com/Plombo/segher-wii-tools
  - (writing) https://github.com/Plombo/segher-wii-tools/blob/master/twintig.c
  - https://github.com/Plombo/vcromclaim
  - https://github.com/JanErikGunnar/vcromclaim
- PSP save file decryption/encryption (note that some files require a per-game key):
  - https://www.psdevwiki.com/ps3/PSP_Savedata
  - https://github.com/BrianBTB/SED-PC (PC application that decrypts/encrypts saves)
  - https://github.com/retrohead/PSPo2iSaveEditor/blob/master/CSEncryptDecrypt/encryptRoutineType.cs (PC application that allows save editing for a specific game)
  - https://wololo.net/talk/viewtopic.php?t=37556 (PSP plugin that dumps a game's key)
  - https://github.com/TheHellcat/psp-hb/blob/master/SavegameDeemer_620TN/deemer_hooker/main.c#L204 Code for a plugin that does this. It intercepts the call to save the game, and writes out a copy of the save in plaintext, plus the key
  - https://wololo.net/talk/viewtopic.php?p=137153&sid=37bd385d91e7c2d89cf1ff8d70e8c640#p137153 Discussion saying that you need to either use a plugin, or parse the executable for look for code around a certain system call to figure out what value is being passed to it
  - I can't seem to find an online list of game keys, and requiring users to install a plugin on their PSP then type a gamekey into the interface seems like too much to ask.
- NES/SNES Classic save game format
  - https://github.com/TeamShinkansen/Hakchi2-CE (tool used to write games onto the devices)
  - https://github.com/JanErikGunnar/ClassicEditionTools (scripts to convert raw saves to/from NES Classic format)
  - http://darkakuma.z-net.us/p/sfromtool.html (convert SNES ROMs and/or saves to the SNES Classic ROM and/or save format)
  - I'm not sure there's enough demand for a web-based tool that does this. The devices aren't available for sale anymore and you already have to run a Windows program to transfer the games. Also the Windows tool for the SNES Classic has the ability to convert saves already.
- PS1:
  - https://www.psdevwiki.com/ps3/PS1_Savedata
  - MemcardRex format: https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs
  - DexDrive format: https://github.com/ShendoXT/memcardrex/blob/master/MemcardRex/ps1card.cs
  - Signing a PSP .VMP file: https://github.com/dots-tb/vita-mcr2vmp
- N64:
  - https://github.com/bryc/mempak
    - https://bryc.github.io/mempak/ (online preview)
  - https://github.com/bryc/mempak/wiki/DexDrive-.N64-format
  - https://github.com/bryc/mempak/wiki/MemPak-structure
  - https://github.com/heuripedes/pj64tosrm (convert raw save to emulator format)
  - http://micro-64.com/database/gamesave.shtml (list of games which use each save type)
  - https://www.reddit.com/r/n64/comments/ezhleg/guide_how_to_backup_your_n64_saves_to_your_pc/
  - https://www.youtube.com/watch?v=PpolokImIeU (convert individual note to .eep format)
  - https://github.com/ssokolow/saveswap Swap endianness of N64 saves to move between Everdrive/emulators/etc
  - Game serial codes:
    - https://niwanetwork.org/wiki/List_of_Nintendo_64_games_by_serial_code
    - https://meanwhileblog.wordpress.com/n64-game-code-list/
- Goomba emulator
  - https://www.reddit.com/r/everdrive/comments/qcgus7/using_a_gba_x5_goomba_sram_save_file_on_a_gbc_x7/

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
