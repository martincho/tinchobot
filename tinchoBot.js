// tinchoBot
// Copyright © 2012 Martin Pereyra (martinbfg10k@gmail.com)
// License: MIT

commands = [];  // Global commands. Plugins must insert their stuff here.

var irc = require('irc');
var config = require('./config');

var ircSession = new irc.Client('stockholm.se.quakenet.org', 'tBot', {
        userName: 'TinchoBot',
        realName: 'TinchoBot: nodeJS IRC bot www.tinchobot.com',
        debug: true,
        showErrors: true,
        channels: ['#tinchoTest']
});
    
// --------------------------------------------------------
// Event listeners
// --------------------------------------------------------

ircSession.addListener('message', function (from, to, message) {
    if(message.charAt(0)===config.commandPrefix) {
        parseCommand(from, to, message.slice(1));
    }
    else {
        console.log(from + ' => ' + to + ': ' + message);
    }
});

ircSession.addListener('join', function (channel, nick, message) {
    //console.log(nick + ' joins ' + channel + ': ');
    //console.log(message);
});


// --------------------------------------------------------
// Parse commands from the config command list
// --------------------------------------------------------
function parseCommand(from, to, message) {
    var command = message;
    var param   = "";
    var commandIndex = message.indexOf(" ")
    if(commandIndex > 0) {
        command = message.slice(0, commandIndex);
        param = message.slice(commandIndex+1);
    }
    for (var i = 0, len = commands.length; i < len; ++i) {
        if(command === commands[i].name || isShortCommand(command, commands[i].name)) {
            commands[i].callback(ircSession, from, to, param)
            return;
        }
    }
}

function isShortCommand(testCommand, command) {
    if(testCommand.length >= command.length)
        return false;
    for (var i = 0, len = testCommand.length; i < len; ++i) {
        var index = command.search(testCommand[i]);
        if(index < 0)
            return false;
        command = command.slice(index+1);
    }
    return true;
}

