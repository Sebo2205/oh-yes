const CommandError = require('../CommandError');
const stuff = require('../stuff')

module.exports = {
    name: "buy",
    description: "buys something from the shop",
    usage: "buy <item>",
    cooldown: 2,

    execute(message, args, _extraArgs, _extraArgsObject, discount = 1) {
        var item = args[0];
        var useOldShop = _extraArgsObject.oldShop || stuff.getUserConfig(message.author.id).useOldShop;

        if (!item) {
            var entries = Object.entries(stuff.shopItems).sort(function(a, b) {
                return b[1].price - a[1].price;
            }).filter(el => {
                return !el[1].unlisted && el[1].price
            })
            var itemNames = []
            var page = (parseInt(_extraArgsObject.page) || 1) - 1;
            var itemsPerPage = useOldShop ? 30 : 10
            var startFrom = 0 + (itemsPerPage * page);

            entries.forEach(entry => {
                if (!useOldShop) itemNames.push(`${entry[1].icon} \`${entry[0]}\` **${entry[1].name}** ─ ${((entry[1].currency || "ip") == "ip") ? "<:ip:770418561193607169>" : ":coin:"} __${stuff.format(entry[1].price)}__ ${(discount < 1) ? `${(1 - discount) * 100}% OFF` : ``}${(entry[1].type) ? ` ─ ${entry[1].type}` : ``}${(entry[1].extraInfo) ? `\n${entry[1].extraInfo}` : ``}`);
                if (useOldShop) itemNames.push(`${entry[1].icon} \`${entry[0]}\` **${entry[1].name}**, ${stuff.format(entry[1].price)} ${((entry[1].currency || "ip") == "ip") ? "Internet Points" : "Gold"}  ${(discount < 1) ? `${(1 - discount) * 100}% OFF` : ``}`);
            })

            var embed = {
                title: "Shop",
                color: 0x34a1eb,
                description: itemNames.slice(startFrom, startFrom + itemsPerPage).join(useOldShop ? "\n" : "\n\n"),

                footer: {
                    text: `page ${page + 1}/${stuff.clamp(Math.ceil(entries.length / itemsPerPage), 1, Infinity)}, add --page <page number> at the end to see a different page`
                }
                
            }
            if (useOldShop) embed.title = "Shop (old version)"
            if (useOldShop) embed.color = 0x34eb86

            message.channel.send({embed: embed});
        } else {
            if (stuff.shopItems[item] != undefined) {

                var repeatAmount = stuff.clamp(parseInt(args[1]) || 1, 1, stuff.getConfig("massBuyLimit"));
                var it = stuff.shopItems[item];
                if (it.unlisted) throw `You can't buy that item lol`
                var embed = {
                    title: `${it.icon} ${it.name}`,
                    description: `You bought ${it.icon} ${it.name} for ${stuff.format(it.price * discount)} ️${(curr == "ip") ? "<:ip:770418561193607169>" : ":coin:"}`
                }
                
                
                var curr = it.currency || "ip"
                var price = it.price;
                stuff.repeat(i => {
                    var cantAfford = stuff.getPoints(message.author.id) < stuff.shopItems[item].price * discount;
                    if (curr != "ip") cantAfford = stuff.getGold(message.author.id) < stuff.shopItems[item].price * discount
                    if (stuff.shopItems[item].inStock > 0) {
                        if (cantAfford) {
                            throw `you need ${((stuff.shopItems[item].price * discount) - stuff.getPoints(message.author.id)).toFixed(1)} more ${(curr == "ip") ? "<:ip:770418561193607169>" : ":coin:"} to buy this item!`
                        } else {      
                            
                            
                            stuff.addItem(message.author.id, {name: it.name, onUse: it.onUse, icon: it.icon, id: item, extraData: {...it.extraData}, rarity: it.rarity})
                            if(curr == "ip") stuff.addPoints(message.author.id, -it.price * discount)
                            if(curr == "gold") stuff.addGold(message.author.id, -it.price * discount)
        
                            
                            if (it.rarity) {
                                embed.color = it.rarity;
                            }
                            stuff.shopItems[item].inStock -= 1;
                        }
                        
                        
                    } else {
                        throw "that item isn't in stock anymore lolololo"
                    }
                }, repeatAmount).then(([repeat, err]) => {                    
                    embed.description = `You bought ${repeat} ${it.icon} ${it.name} for ${stuff.format(it.price * discount * repeat)} ${(curr == "ip") ? "<:ip:770418561193607169>" : ":coin:"}`;
                    if (err) stuff.sendError(message.channel, err);
                    message.channel.send({embed: embed})
                })

                

            } else {
                throw `the item \`${item}\` doesn't exist`
            }
        }
    }
}