const CommandError = require("../CommandError");
const RestrictedCommand = require('../RestrictedCommand')
const stuff = require("../stuff");
var execute = function(message, args) {
    var user = message.mentions.users.first();
    if (!user) throw CommandError.undefinedError;
    var reason = args.slice(1).join(" ");
    if (args.length < 2) throw CommandError.undefinedError;
    var code = user.id + "-" + stuff.randomString(7);
    stuff.db.push(`/${user.id}/warns[]`, {
        date: Date.now(),
        reason: reason,
        code: code,
    })
    stuff.globalData.push(`/warns/${code}`, {
        date: Date.now(),
        reason: reason,
        user: user.id,
    })
    var channel = message.client.channels.cache.get(stuff.getConfig("reportsChannel"))
    channel.send({embed: {
        title: `Warn alert!!!1!!1!!1`,
        description: `${message.author} warned ${user}`,
        fields: [
            {
                name: "reason",
                value: reason,
            },
            {
                name: "channel",
                value: "" + message.channel
            },
            {
                name: "warn code",
                value: `\`${code}\``
            }
        ],
        timestamp: Date.now()
    }})
}
var cmd = new RestrictedCommand("warn", execute, ["KICK_MEMBERS", "BAN_MEMBERS"], "warns someone lol");
cmd.usage = "warn <user> <reason>";
module.exports = cmd;


