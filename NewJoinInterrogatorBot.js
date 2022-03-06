require("dotenv").config();
require("discord-reply"); // Initializing Discord-Reply
require("fs");
const { MessageEmbed, Client, Intents } = require("discord.js");
const fs = require('fs');

const allFileContents = fs.readFileSync('./questions.txt', 'utf-8');
var questionAnswerMapping = {};
allFileContents.split(/\r?\n/).forEach(line =>  {
    const splited = line.split("#");
    const question = splited[0];
    const answer = splited[1];
    questionAnswerMapping[question] = answer;
});

var bot = new Client({
    token: process.env.discordToken,
    autorun: true,
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
}); 

console.log("---bot initialized---");
bot.on("ready", () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});

var memberToRandomQuestionAnswerEntry = {};
var memberToRandomChoices = {};
var memberToTimer = {};
var memberToChances = {};
var idToMember = {};
const choices = ["A", "B", "C", "D"];
bot.on('messageCreate', async message => {
    const id = message.author.id;
    var content = message.content;
    if (message.channel.type == 'DM' && message.author.username != "NewJoinInterrogatorBot") {
        console.log(message);
        if(memberToChances[id] === undefined) {
            handleReply(content, id);
            return;
        }
        content = content.toUpperCase();
        if(!choices.includes(content)) {
            message.reply("请输入A/B/C/D");
            return;
        }
        const correctAnswer = memberToRandomQuestionAnswerEntry[id][1].split(" ")[0];
        if(memberToRandomChoices[id][content.codePointAt(0) - 'A'.codePointAt(0)] == correctAnswer) {
            message.reply("✅做得好, 欢迎来到浪宣部, 将大翻译运动进行到底！！✅");
            idToMember[id].disableCommunicationUntil(null, "---verifitcation compeled---");
            clearTimeout(memberToTimer[id]);
            cleanUpMap(id);
        } else {   
            memberToChances[id]--;
            if(memberToChances[id] == 0) {
                idToMember[id].send("💀连续两次答错问题，已移除💀");
                idToMember[id].kick("Wrong answer!!");
                cleanUpMap(id);
                return;
            }
            message.reply("❌错误，还剩一次机会❌");
        }
    }
});

bot.on('guildMemberAdd', member => {
    console.log("---someone joined---");
    idToMember[member.id] = member;
    console.log("---init chances---")
    memberToChances[member.id] = 2;
    memberToRandomQuestionAnswerEntry[member.id] = getRandomElement(questionAnswerMapping);
    memberToRandomChoices[member.id] = shuffleArray(memberToRandomQuestionAnswerEntry[member.id][1].split(" "));
    const embeded = new MessageEmbed()
                    .setColor('#00ffff')
                    .setDescription(memberToRandomQuestionAnswerEntry[member.id][0] + " 请回复A/B/C/D" + "\r\n" 
                    + "A.  " + memberToRandomChoices[member.id][0] + "\r\n"
                    + "B.  " + memberToRandomChoices[member.id][1] + "\r\n"
                    + "C.  " + memberToRandomChoices[member.id][2] + "\r\n"
                    + "D.  " + memberToRandomChoices[member.id][3]);
    member.send({ embeds: [embeded] });
    member.disableCommunicationUntil(Date.now() + 144000, "新人进discord要先答题").then((member) => {
        memberToTimer[member.id] = setTimeout(function(){
            console.log("time is up");
            member.kick("答题时间超时");
        }, 144000);
    });
});

bot.login(process.env.discordToken);

function getRandomElement(obj) {
    var keys = Object.keys(obj);
    var len = keys.length;
    var rnd = Math.floor(Math.random()*len);
    var key = keys[rnd];
    return [key, obj[key]];
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function handleReply(content, id){
    idToMember[id].send("🐭吱吱吱🐭");
}

function cleanUpMap(id){
    delete memberToRandomQuestionAnswerEntry[id];
    delete memberToRandomChoices[id];
    delete memberToChances[id];
}
