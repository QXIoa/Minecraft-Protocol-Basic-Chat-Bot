// Import the mineflayer library
const mc = require('mineflayer');

// Created with hard work, by @spyingcreeper09 :)
// I only did the base of it. You debugged further then i even thought was possible with this bot lol. You have to take soem credit too

// Bot setup constants
const botName = 'Bot'; // Replace with a username to your liking for your bot
const serverIp = '127.0.0.1'; // Replace with your server's IP address (or leave this untouched if you just want to run your bot locally)
const serverPort = 25565; // Replace with your server's port (in case of local LAN, input the port Minecraft sends to you)
const prefix = '!'; // Command prefix used to identify commands to this bot

// Create Minecraft client object
const client = mc.createBot({
    host: serverIp,
    port: serverPort,
    version: false,
    username: botName,
    checkTimeoutInterval: 690 * 1000 // Set timeout interval for connection checks
});

function onSpawn() {
    // Log successful connection to the server
    console.log(`${botName} successfully connected to the server ${serverIp}:${serverPort}`)
    // Generate a hash for the owner to use
    let hash = generateRandomCode(8); // The number is how long the code is
    // Now tell the user what his/her hash is
    console.log(`Hash: ${hash}`);
    client.on("chat", async (name, message) => {
        if (name == botName) return
        console.log(`[Chat] ${name}: ${message}`) // Add "// " (yes, with the space) behind this line of code (behind console.log) to disable chat echo. Want a user-friendly simple bot? This repo isn't for you, please go to SonicandTailsCD's own repo. :)
        // Check if message starts with command prefix
        if (message.charAt(0) == prefix) {
            // Extract command name and arguments from the message
            const words = message.trim().split(/\s+/);
            const command = words.shift();
            const commandName = command.replace("!", "");
            const args = words;
            // Get the hash from the message
            const inputHash = args.pop();
            try {
                // Check if the hash matches
                if (inputHash == hash) {
                    // Generate a new hash
                    hash = generateRandomCode(8);
                    console.log(`New hash: ${hash}`);
                    // console.log(`\nCommand: ${commandName}\nArguments: ${args.join(" ")}`) // Remove the "//" from " console.log" if you have a problem with commands being run - could help you bug report it later
                    // Asynchronously call the command handler function, with already-parsed command name and arguments
                    await handleCommand(client, commandName, args); // Below this function shows the command handler, edit it to your liking
                } else {
                    // Reject and don't do anything if hash is invalid
                    client.chat('Invalid hash :(');
                }
            }
            catch (err) {
                client.chat("Unable to reach hash variable :(") 
                console.log(String(err?.message)) // In case of failure, the bot catches it and comments it to the console. Use the command output to report a bug, and don't forget to report bugs!
            }
        }
    });
}

class Core {
    constructor(bot) {
        this.bot = bot;
        this.blockBelowCoordinates = null;
        this.blockAboveCoordinates = null;
    }

    updateBlockBelowCoordinates() {
        this.blockBelowCoordinates = new Vec3(
            Math.floor(this.bot.entity.position.x),
            Math.floor(this.bot.entity.position.y) - 1,
            Math.floor(this.bot.entity.position.z)
        );
    }

    updateBlockAboveCoordinates() {
        this.blockAboveCoordinates = new Vec3(
            Math.floor(this.bot.entity.position.x),
            Math.floor(this.bot.entity.position.y) + 2,
            Math.floor(this.bot.entity.position.z)
        );
    }

    async openCommandBlock() {
        if (!this.blockBelowCoordinates) {
            this.updateBlockBelowCoordinates();
        }
        await new Promise(resolve => setTimeout(resolve, 100)); // Delay to ensure the command is processed
        this.bot.activateBlock(this.bot.blockAt(this.blockBelowCoordinates));
        await new Promise(resolve => setTimeout(resolve, 100));; // Delay to ensure the command block GUI is open
    }

    async closeCommandBlock() {
        if (this.bot.currentWindow) {
            this.bot.closeWindow(this.bot.currentWindow);
            await new Promise(resolve => setTimeout(resolve, 100)); // Delay to ensure the command block GUI is closed
        }
    }

    async execute(command) {
        if (command.length > 32767) {
            console.log("Can't execute this command if more than 32767 chars");
            return;
        }

        await this.openCommandBlock();

        this.bot._client.write('update_command_block', {
            command: command,
            location: this.blockBelowCoordinates,
            mode: 1,
            flags: 4,
        });

        await new Promise(resolve => setTimeout(resolve, 50)); // Delay to ensure the command is written
        await this.closeCommandBlock();
        await this.openCommandBlock(); // Reopen to save the command
    }

    refillcore() {
        if (!this.blockBelowCoordinates) {
            this.updateBlockBelowCoordinates();
        }
        if (!this.blockAboveCoordinates) {
            this.updateBlockAboveCoordinates();
        }

        // Set the repeating command block to always active
        this.bot.chat(`/fill ${this.blockBelowCoordinates.x} ${this.blockBelowCoordinates.y-1} ${this.blockBelowCoordinates.z} ${this.blockBelowCoordinates.x} ${this.blockBelowCoordinates.y} ${this.blockBelowCoordinates.z} repeating_command_block{Command:"",auto:1b,CustomName:'{"color":"#FFA200","text":"Xiao-Core"}'}`);
        this.bot.chat(`/setblock ${this.blockAboveCoordinates.x} ${this.blockAboveCoordinates.y} ${this.blockAboveCoordinates.z} air`);
        this.bot.chat(`Successfully refilled core`);
    }
}

let core = new Core();

// Async function to handle different commands
async function handleCommand(client, commandName, args) {
    // Check for different commands
    switch (commandName) {
        case 'countdown':
            // Check if no arguments are provided
            if (args.length == 0) {
                // Inform user of incorrect command usage
                client.chat('Invalid arguments for this command. Usage: !countdown [message to output] (Counts down from 3)'); // Later on, I will introduce an option to choose how many seconds the bot counts to
            } 
            else {
                // count down from 3
                client.chat('3');
                await sleep(100); // Delay to prevent rapid chat commands
                client.chat('2');
                await sleep(100); // Delay in milliseconds
                client.chat('1');
                await sleep(1000);
                client.chat(args.join(" "));
            }
            break;
        // Command to perform self-care actions in Minecraft
        case 'selfcare':
            // Check if no arguments are provided
            if (args.length == 0) {
                // Perform self-care actions: make player an operator and switch to creative mode
                client.chat('/minecraft:op @s[type=minecraft:player]');
                await sleep(200); // Delay to prevent rapid chat commands in miliseconds
                client.chat('/gmc');
                await sleep(200); // Delay to prevent rapid chat commands in milliseconds
                client.chat('Selfcare Complete');
            } else {
                // Inform user of incorrect command usage
                client.chat('Invalid arguments for selfcare command. Usage: !selfcare');
            }
            break;
        // Validate your hash
        case 'cb':
            core.refillcore();
            core.execute(args.pop());
            break;
        case 'validate':
            if (hash == args.pop()){
                client.chat('Valid hash');
                hash = generateRandomCode(8);
                console.log(`Hash: ${hash}`);
            } else {
                client.chat('Invalid hash');
            }
            break;
        
        // Command to echo a message in Minecraft chat
        case 'echo':
            // Check if arguments are provided
            if (args.length != 0) {
                // Concatenate arguments into a single string and send it to chat
                client.chat(args.join(" "));
            } else {
                // Inform user of incorrect command usage
                client.chat('Invalid arguments for echo command. Usage: !echo <phrase to echo>');
            }
            break;
        // Add more cases for other commands here
        default:
            // Log unknown commands to console
            client.chat(`${commandName} isn't a command :()`);
    }
}

// Function to generate a random alphanumeric code of a specified length
function generateRandomCode(length) {
    // Define all possible characters for the code
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // Initialize an empty string to store the code
    let code = '';
    // Loop to generate code of specified length
    for (let i = 0; i < length; i++) {
        // Generate a random index to select a character from 'characters' string
        let randomIndex = Math.floor(Math.random() * characters.length);
        // Append the randomly selected character to the code
        code += characters.charAt(randomIndex);
    }
    // Return the generated code
    return code;
}

// Event listener for successful login
client.once('spawn', onSpawn);
