const fs = require('fs');
const Discord = require("discord.js")
const config = require("./Data/config.json")

const intents = new Discord.Intents(32767)
const client = new Discord.Client({intents})

client.on("ready", async ()=>{
    console.log("Text Message Scraper Bot Online")
})

client.on("messageCreate", async (message)=>{
    if(!message.content.startsWith(config.prefix)) return 
    const args = message.content.substring(config.prefix.length).split(/ +/);
    console.log(args)

    if(args.length > 0 && args[0] === "scrap"){
        if(args.length === 1 || ((args.length === 2 || args.length === 3) && args[1] === "text")){
            console.log("Taken Text Scraper Command")
            message.reply("Scraping the Last Text Messages")
            let guildName;
            let Messages = {}
            const manageChannels = client.channels
            const channelKeys = manageChannels.cache.keys()
            let limit = Number.MAX_SAFE_INTEGER
            if(args.length === 3){
                let l = parseFloat(args[2])
                if(typeof(l) === Number) limit = Math.floor(l)
            } 
            for(key of channelKeys){
                const channel = await client.channels.fetch(key)
                Messages[channel.name] = []
                if(channel.messages !== undefined && channel.messages !== null){
                    let last_id;
                    while(true){
                        const options = { limit: 100 }
                        if (last_id) options.before = last_id;
                        const messages = await channel.messages.fetch(options)
                        console.log(`Received ${messages.size} messages`)  
                        
                        messages.forEach((message) => {
                            const mess = {
                                content : message.content,
                                type : message.type,
                                authorUsername : message.author.username,
                                authorId : message.author.id,
                                createdAt : message.createdTimestamp,
                                id : message.id,
                                channelName : channel.name,
                                channelId : message.channelId,
                                guildId : message.guildId,
                                isSystem : message.system,
                                isDeleted : message.deleted
                            } 
                            Messages[channel.name].push(mess);
                            last_id = message.id;
                        })
                        if (messages.size !== 100 || Messages[channel.name].length >= limit){
                            break;
                        }
                    }
                }
            }   
            
            const scrapingTimestamp = Date.now()
            const toSave = {
                messages : Messages, scrapingTimestamp
            }
            const data = JSON.stringify(toSave)
            const filename = `outputs/op${scrapingTimestamp}.json`
            fs.writeFile(filename, data, 'utf8', function (err) {
                if (err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err);
                } 
                console.log("JSON file has been saved.");
            });

        } 
    }
    
})

client.login(config.token)


  
