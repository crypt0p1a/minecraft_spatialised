# Minecraft x Dolby.io

![Maintainer](https://img.shields.io/badge/maintainer-blipya-blue)

Simple spatialisation implementation using Dolby.IO and Minecraft.

## Description

Easy configuration and installation of a server centric implementation for spatialisation

## Dependencies

* NodeJS
* Java 17 (version depends mostly on the minecraft server used -> 1.19 requires Java 17)

## Installing

* clone this project
* `npm run configure`

## Configuration

### Client

- make sure nodejs is properly installed

### Server

- copy the .env.example file inside the `server` folder
- to .env
- edit this file to set the appropriate values
- note : for https support
  - either install ngrok and forward to the server's port
  - or restart the program after http configuration + Let's Encrypt for instance

### Server (Minecraft's plugin)

- make sure the server folder is properly configured
- nothing more.

## Executing program

### NodeJS server

- make sure the Configuration is done
- build from the root folder `node run build:server`

- start testing with `node run start:server`
- once done, use your favorite service controller (systemctl, circus etc...) to configure starting 

### NodeJS client

- done via above

### Minecraft Plugin

- make sure the Configuration is done
- build from the root folder `node run build:plugin`

- start testing with `node run start:plugin`
- once done, copy the file `server_plugin/position-sender/build/libs/position-sender-1.0.0-all.jar` to your minecraft server's plugin server

## Usage once running

- open your minecraft client
- connect to your Minecraft server
- in game, type the command `/dolbyio-register`

- open a browser to your configured server's address & port
- paste the code obtained from the game
- click the button
- wait for the microphone's permission
- that's it, you're connected (notice the microphone icon in your browser's tabs)

## Full example of usage

```
# update everything
git pull origin

# rebuild the server, client and plugin
npm run configure
npm run build:server
npm run build:plugin

# copy the file to the minecraft server
cp server_plugin/position-sender/build/libs/position-sender-1.0.0-all.jar ../your_server/plugins/position-sender-1.0.0-all.jar

# restart the server & minecraft
systemctl restart spatial_server.service # restart the web server + socket
sleep 1
systemctl restart minecraft.service # restart the minecraft server
```

## Help

Make sure that Java 17 is used to compile de plugin. You can easily control this using SDK Man

NodeJS needs to be used, I'm currently using 15.14.0

## Authors

Contributors names and contact info

- Kévin Le Perf

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](./LICENSE) file for details