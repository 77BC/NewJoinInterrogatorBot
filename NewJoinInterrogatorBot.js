require("dotenv").config();
require("discord-reply"); // Initializing Discord-Reply
require("fs");
const Discord = require("discord.js");
const fs = require('fs');

const allFileContents = fs.readFileSync('./questions.txt', 'utf-8');
var questionAnswerMapping = {};
allFileContents.split(/\r?\n/).forEach(line =>  {
    const splited = line.split("#");
    const question = splited[0];
    const answer = splited[1];
    questionAnswerMapping[question] = answer;
});

var bot = new Discord.Client({
    token: process.env.discordToken,
    autorun: true
});

console.log("---bot initialized---")
bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

bot.on('guildMemberAdd', member => {
    const randomQuestionAnswerMapping = questionAnswerMapping[Math.floor(Math.random() * questionAnswerMapping.length)];
    console.log(randomQuestionAnswerMapping);
    member.guild.channels.get('channelID').send("Welcome"); 
});

bot.login(process.env.discordToken);

