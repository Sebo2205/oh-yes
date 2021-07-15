module.exports = {
    name: "snipe",
    async execute(message, a, _a, flags) {
        var del = message.client.snipe[0];
        var max = 5;
        var left = max;
        console.log("h")
        while (del != undefined && left > 0) {
            if (!del) throw `There is nothing to snipe!!1!11`
            console.log("the")
            var embed = {
                author: {
                    name: del.author.username,
                    icon_url: del.author.displayAvatarURL()
                },
                description: del.content.slice(0, 2000),
                footer: { text: `Messages left: ${message.client.snipe.length - 1}/${message.client.snipeLimit}` },
                color: 0x2f3136
            }
            if (del.embeds[0]) {
                var e = del.embeds[0];
                embed.fields = []
                if (e.title) embed.fields.push({ name: "Title", value: e.title })
                if (e.author) embed.fields.push({ name: "Author", value: e.author.name })
                if (e.description) embed.fields.push({ name: "Description", value: e.description })
                if (e.footer?.text) embed.fields.push({ name: "Footer", value: e.footer?.text })
                if (e.fields) {
                    var i = 1;
                    for (var field of e.fields) {
                        embed.fields.push({ name: `${field.name} (Field)`, value: `${field.value}` })
                        i++;
                    }
                }
                embed.fields = embed.fields.slice(0, 25)
                if (e.color) embed.color = e.color;
            }
            if (del.message.guild.id != message.guild.id) embed.description = "message isn't from this server so get rekt"
            await message.channel.send({embed: embed})
            message.client.snipe.shift();
            if (!flags.all) break;
            del = message.client.snipe[0]
            left--;
        }
    }
}
