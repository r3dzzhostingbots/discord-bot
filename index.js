const Discord = require("discord.js");
const {Permissions, MessageEmbed, MessageActionRow, WebhookClient, MessageSelectMenu,MessageButton, MessageAttachment } = require('discord.js')
const discordModals = require('discord-modals');
const config = require('./Files/Bot/config.js')
const ticket = require('./Files/Bot/ticket.js')
const discordTranscripts = require('discord-html-transcripts');
const { Database } = require("quick.mongodb");
const db = new Database(config.DataBase.Url)
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        Discord.Intents.FLAGS.GUILD_WEBHOOKS,
        Discord.Intents.FLAGS.GUILD_INVITES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_PRESENCES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
    allowedMentions: {
        parse: ["users", "roles"], repliedUser: false
    },
    partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"]
});
discordModals(client);
client.on("ready", async () => {
    console.clear()
    console.log(`Is Online [${client.user.id} | ${client.user.username}]`)
	let guild = client.guilds.cache.get(config.Setting.GuildId)
    await client.application?.commands.set([])
    client.guilds.cache.forEach(guild => {
        if (guild.id != guild) return;
        guild.commands?.set([{
            name: "ticket-add",
            description: "add user in ticket",
            options: [
                {
                    name: 'user',
                    description: 'enter user',
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "ticket-remove",
            description: "remove user in ticket",
            options: [
                {
                    name: 'user',
                    description: 'enter user',
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "ticket-close",
            description: "close in ticket",
        },
        {
            name: "ticket-setup",
            description: "setup in ticket",
        },
        {
            name: "blacklist-add",
            description: "add user in blacklist",
            options: [
                {
                    name: 'user',
                    description: 'enter user',
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "blacklist-remove",
            description: "add user in blacklist",
            options: [
                {
                    name: 'user',
                    description: 'enter user',
                    type: 6,
                    required: true,
                },
            ]
        },
        {
            name: "fix",
            description: "Fix Bot",
            options: [
                {
                    name: 'user',
                    description: 'enter user',
                    type: 6,
                    required: true,
                },
            ]
        },
        {
            name: "set-name",
            description: "تعديل اسم البوت",
            options: [
                {
                    name: 'name',
                    description: 'Enter Bot Name',
                    type: 3,
                    required: true,
                },
            ]
        },
        {
            name: "set-avatar",
            description: "تعديل صورة البوت",
            options: [
                {
                    name: 'avatar',
                    description: 'Enter Bot Avatar',
                    type: 11,
                    required: true,
                },
            ]
        },
        ])
    })
})
client.on("interactionCreate", async interaction => {
    if (interaction.isButton()) {
        const TicketLog = interaction.guild.channels.cache.get(ticket.LOGS);
        const TicketFiles = interaction.guild.channels.cache.get(ticket.TRANSCRIPT);
        const Url = ticket.DOMAIN
        if (interaction.customId === "close") {
            const channelEmoji = interaction.channel.name.length > 1 ? interaction.channel.name.substring(0, 1) + "" : interaction.channel.name;
            //interaction.reply(`\`${channelEmoji}\``)
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split(`🔒・`)[1]}`);
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId('closed').setStyle('DANGER').setEmoji('🔒'),
                    new MessageButton().setCustomId('notclose').setStyle('SECONDARY').setEmoji('🔓'),
                );
            const embed = new MessageEmbed()
                .setAuthor({ name: `Ticket System`, iconURL: interaction.guild.iconURL() })
                .setDescription(`**🤔 | هل أنت متأكد أنك تريد أقفال التذكرة؟**`)
                .setColor(`#FF0000`)
            interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
        }
        if (interaction.customId === "notclose") {
            const embed = new MessageEmbed()
                .setAuthor({ name: `Ticket System`, iconURL: interaction.guild.iconURL() })
                .setDescription(`**👍🏻 | تم الغاء قفل التذكرة**`)
                .setColor(`#e6c452`)
            interaction.update({ embeds: [embed], components: [], ephemeral: true })
        }
        if (interaction.customId === "closed") {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId('transcript').setLabel('حفظ نسخة').setStyle('SUCCESS').setEmoji('📑'),
                    new MessageButton().setCustomId('open').setLabel('أعادة التذكرة').setStyle('PRIMARY').setEmoji('🔓'),
                    new MessageButton().setCustomId('delete').setLabel('حذف التذكرة').setStyle('DANGER').setEmoji('⛔'),
                );
            interaction.channel.permissionOverwrites.edit(interaction.user.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
            const embeddone = new MessageEmbed()
                .setDescription(`🔒 | التذكرة مغلقة من قبل: <@${interaction.user.id}>`)
                .setColor('RED')
          interaction.channel.send({ embeds: [embeddone] })
            ///////STAFF
            const embed = new MessageEmbed()
                .setDescription('```قائمة التحكم بالتذكرة```')
                .setColor(`BLUE`)
                interaction.channel.send({ embeds: [embed], components: [row] })

            let member = interaction.guild.members.cache.find(m => m.id === interaction.channel.topic.split("OPEN : ")[1]);
            if(member) {
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split(`🔒・`)[1]}`);
            if(!data) interaction.channel.delete()
            await db.delete(`ticketSpammer_${interaction.guild.id}_${member.id}`, true)
            await db.delete(`ticketSpammerChannel_${interaction.guild.id}_${member.id}`)
            const staff = await db.get(`TicketStaff_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            let sss = interaction.guild.members.cache.find(r => r.id === staff);
            const date = await db.get(`TicketDate_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const rolestaff = await db.get(`TicketStaffRole_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const closeed = new MessageEmbed()
                .setAuthor({ name: `Ticket System`, iconURL: interaction.guild.iconURL() })
                .setDescription(`**👍🏻 | تم قفل التذكرة**`)
                .setColor(`#e6c452`)
            await interaction.update({ embeds: [closeed], components: [], ephemeral: true })
            const tarnscript = await discordTranscripts.createTranscript(interaction.channel, {
                fileName: 'transcript.html'
            });
            TicketFiles.send({ files: [tarnscript], }).then(msg => {
                let attachment_url = msg.attachments.first().url;
                const save = new MessageEmbed()
                    .setTitle(`🎟 | مرفقات التذكرة`)
                    .addField(`📑 \`:\` رقم التذكرة`, `\`${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}\``)
                    .addField(`👑 \`:\` مشرفين التذكرة`, `<@&${rolestaff}>`)
                    .addField(`🛡 \`:\` مسؤول التذكرة`, `${sss || `لم يتم أستلام التذكرة`}`)
                    .addField(`📅 \`:\` وقت التذكرة`, `\`${date}\``)
                    .addField(`🗂 \`:\` ملف التذكرة`, `[Link](${ticket.DOMAIN}direct?url=${attachment_url})`)
                    .setDescription(`**💛 : نتمنى لك يوماً سعيداً**`)
                    .setThumbnail(`https://cdn.discordapp.com/attachments/969900879392174101/977571900110827540/folder-3440973-2888147.png`)
                    .setColor(`#FFD733`)
                member.send({ embeds: [save] })
                const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('one').setEmoji('1️⃣').setStyle('SECONDARY'),new MessageButton().setCustomId('two').setEmoji('2️⃣').setStyle('SECONDARY'),new MessageButton().setCustomId('three').setEmoji('3️⃣').setStyle('SECONDARY'),new MessageButton().setCustomId('four').setEmoji('4️⃣').setStyle('SECONDARY'),new MessageButton().setCustomId('five').setEmoji('5️⃣').setStyle('SECONDARY'));
				const filter = i => ['one', 'two', 'three', 'four', 'five'].includes(i.customId) && i.user.id == member.id;
                if(sss) member.send({ embeds: [{ title: '⭐ : نظام التقييم', color: '#FFD733', description: `**✨ : مرحباً ${member} نرجو منك تقييم ${sss}**` }], components: [row] }).then(async (msg) => {
                    const collector = msg.channel.createMessageComponentCollector({
                        filter,
                        time: 600000000,
                        max: 1
                    });
                collector.on('collect', async (i) => {
                    collector.stop("done")
                    msg.edit({ embeds: [{ title: '⭐ : نظام التقييم', color: '#FFD733', description: `**😊 : شكراً على تقييمك**` }], components: [] })
                    if(TicketFiles) TicketFiles.send({
                        embeds: [
                            new MessageEmbed()
                                .setTitle(`⭐ : نظام التقييم`)
                                .setDescription(`✨ : قام ${member} بتقييم ${sss}`)
                                .addFields(
                                    { name: `⭐ : عدد النجوم`, value: `\`\`\`${i.customId
                                        .replace("five", "5")
                                        .replace("four", "4")
                                        .replace("three", "3")
                                        .replace("two", "2")
                                        .replace("one", "1")}/5\`\`\`` },
                                        { name: `🌟 : نقاط المشرف`, value: `\`\`\`${await db.get(`Reate_Staff_Points_${interaction.guild.id}_${sss}`)}\`\`\`` },
                                        { name: `📆 : التاريخ`, value: `\`\`\`${new Date().getDate() + "/"+ (new Date().getMonth() + 1) + "/"+ new Date().getFullYear() + " | "+ new Date().getHours() + ":"+ new Date().getMinutes() + ":"+ new Date().getSeconds()}\`\`\`` },
                                        { name: `🆔 : المقييم`, value: `\`\`\`${member.id}\`\`\`` },
                                        { name: `🆔 : المشرف`, value: `\`\`\`${sss.id}\`\`\`` },
                                )
                                .setThumbnail(sss.displayAvatarURL({ dynamic: true, size: 4096 }))
                                .setTimestamp()
                                .setColor('#FFD733')
                        ]
                    }).catch(console.log);
                    db.add(`Reate_Staff_Points_${interaction.guild.id}_${sss}`, 1)
                })
                collector.on('end', async (i, r) => {
                    if (r != "done") return;
                })
            });
                const logs = new MessageEmbed()
                .setTitle(`🔒 : تذكرة مغلقة`)
                .setDescription(`التذكرة مغلقة من قبل : ${interaction.user}`)
                .addField(`👑 : مالك التذكرة :`,`${member}`,true)
                .addField(`❔ : قسم التذكرة :`,`\`${data.SectionName}\``,true)
                .addField(`🛡 : مشرف التذكرة :`,`${sss || `لم يتم استلام التذكرة`}`,true)
                .addField(`⏲ : تاريخ التذكرة :`,`\`\`\`${date}\`\`\``,true)
                .setThumbnail(`https://cdn.discordapp.com/attachments/969900879392174101/977571900110827540/folder-3440973-2888147.png`)
                .addField(`🗂 : ملف التذكرة`, `**[ملف التذكرة](${ticket.DOMAIN}direct?url=${attachment_url})**`,true)
                .setColor(data.Color)
                TicketLog.send({ embeds: [logs] })
                interaction.channel.permissionOverwrites.edit(interaction.user.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
                const ClosedTicketsCategory = interaction.guild.channels.cache.find(channel => channel.id === data.ClosedTicketsCategoryID).id
                interaction.channel.setParent(ClosedTicketsCategory)
                interaction.channel.setName(`🔒・${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            });
        } else {
                const ClosedTicketsCategory = interaction.guild.channels.cache.find(channel => channel.id === data.ClosedTicketsCategoryID).id
                interaction.channel.setParent(ClosedTicketsCategory)
                interaction.channel.setName(`🔒・${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
        }
        }
        if (interaction.customId === "transcript") {
            const channel = interaction.channel
            let member = interaction.guild.members.cache.find(m => m.id === interaction.channel.topic.split("OPEN : ")[1]);
            if(member) {
            const tarnscript = await discordTranscripts.createTranscript(channel, {
                fileName: 'transcript.html'
            });
            const embed = new MessageEmbed()
                .setDescription(`📑 | ${TicketLog}`)
                .setColor('#10A5A5')
            TicketFiles.send({ files: [tarnscript], }).then(msg => {
                let attachment_url = msg.attachments.first().url;
                const log = new MessageEmbed()
                    .setAuthor({ iconURL: member.user.displayAvatarURL(), name: member.user.tag })
                    .addFields(
                        { name: '[📃] رابط التذكرة', value: `[Link](${ticket.DOMAIN}direct?url=${attachment_url})`, inline: true },
                    )
                    .setAuthor({ iconURL: member.user.displayAvatarURL(), name: member.user.tag })
                    .setColor('#10A5A5')
                    .setThumbnail(member.user.displayAvatarURL())
                TicketLog.send({ embeds: [log] })
                interaction.reply({ embeds: [embed] })
            })
        } if(!member) {
            const tarnscript = await discordTranscripts.createTranscript(channel, {
                fileName: 'transcript.html'
            });
            const embed = new MessageEmbed()
                .setDescription(`📑 | ${TicketLog}`)
                .setColor('#10A5A5')
            TicketFiles.send({ files: [tarnscript], }).then(msg => {
                let attachment_url = msg.attachments.first().url;
                const log = new MessageEmbed()
                    .setAuthor({ iconURL: interaction.user.displayAvatarURL(), name: interaction.user.tag })
                    .addFields(
                        { name: '[📃] رابط التذكرة', value: `[Link](${ticket.DOMAIN}direct?url=${attachment_url})`, inline: true },
                    )
                    .setAuthor({ iconURL: interaction.user.displayAvatarURL(), name: interaction.user.tag })
                    .setColor('#10A5A5')
                    .setThumbnail(interaction.user.displayAvatarURL())
                TicketLog.send({ embeds: [log] })
                interaction.reply({ embeds: [embed] })
            })
        }
        }
        if (interaction.customId === "open") {
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split(`🔒・`)[1]}`);
            let member = interaction.guild.members.cache.find(m => m.id === interaction.channel.topic.split("OPEN : ")[1])
            //const replyy = await interaction.deferReply({ ephemeral: true });
            if(!member) {await interaction.deferReply({ ephemeral: true }); await interaction.editReply({ content: `> 🙄 **- لم أجد العضو**` });} else {
            const embed = new MessageEmbed()
                .setDescription(`تم أعادة التذكرة بواسطة ${interaction.user}`)
                .setColor('BLUE')
            await interaction.update({ embeds: [embed], content: `${member}`, components: [] })
            //await replyy.editReply({ content: `🔓 : تم أعادة التذكرة`, components: [] })
            interaction.channel.permissionOverwrites.set(interaction.guild.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false }).catch(error => interaction.reply({ content: `Error` }));
            interaction.channel.permissionOverwrites.edit(member, { VIEW_CHANNEL: true, SEND_MESSAGES: true }).catch(error => interaction.reply({ content: `Error` }));
            const ClosedTicketsCategory = interaction.guild.channels.cache.find(channel => channel.id === data.CategoryID).id
            await interaction.channel.setParent(ClosedTicketsCategory)
            await interaction.channel.setName(`${data.SectionEmoji}・${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            }
        }
        if (interaction.customId === "delete") {
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split(`🔒・`)[1]}`);
            let member = interaction.guild.members.cache.find(m => m.id === interaction.channel.topic.split("OPEN : ")[1])
            if(member) {
            const staff = await db.get(`TicketStaff_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const date = await db.get(`TicketDate_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const rolestaff = await db.get(`TicketStaffRole_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const mm = await db.get(`TicketCatagory_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const tarnscript = await discordTranscripts.createTranscript(interaction.channel, {
                fileName: 'transcript.html'
            });
            TicketFiles.send({ files: [tarnscript], }).then(msg => {
                let attachment_url = msg.attachments.first().url;
                const log = new MessageEmbed()
                    .setAuthor({ iconURL: member.user.displayAvatarURL(), name: member.user.tag })
                    .setDescription(`**🗑 | تذكرة محذوفة**`)
                    .addFields(
                        { name: `🛡 | مسؤول التذكرة :`, value: `${`<@${staff}>` || `\`لم يتم أستلام التذكر\``}`, inline: true },
                        { name: `👑 | مشرفيين التذكرة :`, value: `<@&${rolestaff}>`, inline: true },
                        { name: `🔒 | المشرف :`, value: `${interaction.user}`, inline: true },
                        { name: `👑 | صاحب التذكرة`, value: `${member}`, inline: true },
                        { name: `🔢 | رقم التذكرة`, value: `\`#${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}\``, inline: true },
                        { name: `📅 | تاريخ التذكرة`, value: `\`\`\`${date}\`\`\``, inline: true },
                        { name: `♦ | قسم التذكرة`, value: `\`${mm}\``, inline: true },
                        { name: `🗂 | ملفات التذكرة`, value: `[رابط الملف](${ticket.DOMAIN}direct?url=${attachment_url})`, inline: true },
                    ).setThumbnail(`https://cdn.discordapp.com/attachments/969900879392174101/977571900110827540/folder-3440973-2888147.png`)
                    .setColor(`#FFD733`)
                TicketLog.send({ embeds: [log] })
            })
            const deletee = new MessageEmbed()
                .setDescription(`جاري حذف التذكرة خلال \`5s\``)
                .setColor('RED')
            setTimeout(function () {
                interaction.channel.delete()
            }, 5000),
                interaction.reply({ embeds: [deletee], components: [] })
        }
        if(!member) {
            const deletee = new MessageEmbed()
                    .setDescription(`جاري حذف التذكرة خلال \`5s\``)
                    .setColor('RED')
                setTimeout(function () {
                    interaction.channel.delete()
                }, 5000),
                    interaction.reply({ embeds: [deletee], components: [] })
        }
    } 
        if (interaction.customId === "notfi") {
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split("🔒・")[1]}`);
        let admins = data.SupportRolesID;
        
        let isAdmin = true;
        interaction.member._roles.forEach(r => {
            if (admins.includes(r)) {
                isAdmin = false;
            }
        });
            if (isAdmin) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            let member = interaction.guild.members.cache.find(m => m.id === interaction.channel.topic.split("OPEN : ")[1])
            if(!member) return interaction.reply({ content: `> 🙄 **- لم أجد العضو**` });
            interaction.reply({ content: `**🔔 | تم تذكير العضو**`, ephemeral: true })
            const notfi = new MessageEmbed()
                .setDescription(`**🔔 | عميلنا العزيز , لديك تذكرة نتظر الرد عليها : [${interaction.channel}]**`)
                .setColor(`#FFD733`)
                .setThumbnail(`https://cdn.discordapp.com/attachments/934212616677621810/976190881327640636/school-bell-4105651-3404370.webp`)
            member.send({ embeds: [notfi] })
        }
        if (interaction.customId === "cliem") {
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split("🔒・")[1]}`);
        let admins = data.SupportRolesID;
        let isAdmin = true;
        interaction.member._roles.forEach(r => {
            if (admins.includes(r)) {
                isAdmin = false;
            }
        });
            if (isAdmin) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId('close').setStyle('SECONDARY').setEmoji('🔒'),
                    new MessageButton().setCustomId('notfi').setStyle('SECONDARY').setEmoji('🔔'),
                    new MessageButton().setCustomId('cliem').setStyle('SECONDARY').setEmoji('🛠').setDisabled(true),
                );
                let member = interaction.guild.members.cache.find(m => m.id === interaction.channel.topic.split("OPEN : ")[1])
            if(!member) return interaction.reply({ content: `> 🙄 **- لم أجد العضو**` });
            db.add(`ticket_staff_count_${interaction.guild.id}_${interaction.user.id}`, 1)
            db.set(`TicketStaff_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`, interaction.user)
            const date = await db.get(`TicketDate_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const rolestaff = await db.get(`TicketStaffRole_${interaction.guild.id}_${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}`)
            const mmm = await db.get(`TicketCatagory_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split("🔒・")[1]}`);
            const edite = new MessageEmbed()
                    .setAuthor({ name: `Ticket System`, iconURL: interaction.guild.iconURL() })
                    .addField(`مالك التذكرة \`:\` 👥`, `<@${member.id}>`, true)
                    .addField(`مشرف التذكرة \`:\` 👑`, `${interaction.user}`, true)
                    .addField(`تاريخ التذكرة \`:\` ⏱`, `\`${date}\``, true)
                    .addField(`رقم التذكرة \`:\` 🗂`, `\`#${interaction.channel.name.split(`${data.SectionEmoji}・`)[1] || interaction.channel.name.split("🔒・")[1]}\``, true)
                    .addField(`قسم التذكرة \`:\` ❓`, `\`${mmm}\``, true)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setColor(`${data.Color}`)
                    .setImage(data.Banner)
            interaction.update({ embeds: [edite], content: `<@&${rolestaff}> | ${member}`, components: [row] })
            const clime = new MessageEmbed()
                .setDescription(`👑** | مرحباً بك ${member} , هنا ${interaction.user} لخدمتك**`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, }))
                .setColor(data.Color)
                 .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
            interaction.channel.send({ embeds: [clime] })
            const embeddd = new MessageEmbed()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`> 🛠 - **أستلام تذكرة**`)
            .addField(`🛡 : User`,`${interaction.user}`,true)
            .addField(`🎫 : Ticket`,`${interaction.channel.name}`,true)
            .addField(`⭐ : Staff Points`,`${await db.get(`ticket_staff_count_${interaction.guild.id}_${interaction.user.id}`)}`,true)
            TicketLog.send({ embeds: [embeddd] })
        }
    } else if (interaction.isCommand()) {
        if (interaction.commandName == 'set-name') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            const name = interaction.options.getString('name');
            client.user.setUsername(name);
            interaction.reply({ content: `Done` })
        }
        if (interaction.commandName == 'set-avatar') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            const avatar = interaction.options.getAttachment('avatar');
            client.user.setAvatar(avatar);
            interaction.reply({ content: `Done` })
        }
        if (interaction.commandName == 'ticket-add') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            const user = interaction.options.getUser('user');
            if(!user) return interaction.reply({ content: `> 🙄 **- لم أجد العضو**` })
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split("🔒・")[1]}`);
            if(!data) return interaction.reply(`**😒 | هاذا الروم ليس \`Ticket\`**`);
            interaction.channel.permissionOverwrites.edit(user.id, {
                ATTACH_FILES: true, 
                READ_MESSAGE_HISTORY: true,
                SEND_MESSAGES: true,
                VIEW_CHANNEL: true
            });
                const embed = new MessageEmbed()
                    .setDescription(`> ** ➕ - تم أضافة ${user} .**`)
                    .setColor(data.Color)
                interaction.reply({ embeds: [embed] });
        }
        if (interaction.commandName == 'fix') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            const user = interaction.options.getMember('user');
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            await db.delete(`ticketSpammer_${interaction.guild.id}_${user.id}`, true)
            await db.delete(`ticketSpammerChannel_${interaction.guild.id}_${user.id}`)
            const embed = new MessageEmbed()

                .setAuthor({ iconURL: interaction.user.displayAvatarURL(), name: interaction.user.tag })
                .setDescription(`**🛠 | Done**`)
                .setColor(`BLACK`)
            interaction.reply({ embeds: [embed] })
        }
        if (interaction.commandName == 'ticket-remove') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            const user = interaction.options.getUser('user');
            if(!user) return interaction.reply({ content: `> 🙄 **- لم أجد العضو**` })
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split("🔒・")[1]}`);
            if(!data) return interaction.reply(`**😒 | هاذا الروم ليس \`Ticket\`**`);
            interaction.channel.permissionOverwrites.delete(user.id)
                const embed = new MessageEmbed()
                    .setDescription(`> ** ➖ - تم أزالة ${user} .**`)
                    .setColor(data.Color)
                interaction.reply({ embeds: [embed] });
        }
        if (interaction.commandName == 'ticket-close') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            const data = await db.get(`TicketData_${interaction.guild.id}_${interaction.channel.name.split(`${interaction.channel.name.split('・')[0]}・`)[1] || interaction.channel.name.split("🔒・")[1]}`);
            if(!data) return interaction.reply(`**😒 | هاذا الروم ليس \`Ticket\`**`);
            const deletee = new MessageEmbed()
                .setDescription(`جاري حذف التذكرة خلال \`5s\``)
                .setColor('RED')
            setTimeout(function () {
                interaction.channel.delete()
            }, 5000),
                interaction.reply({ embeds: [deletee] })
        }
        if (interaction.commandName == 'blacklist-add') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            const user = interaction.options.getMember('user');
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            db.set(`blacklist_${interaction.guild.id}_${user.user.id}`, true)
            const embed = new MessageEmbed()

                .setAuthor({ iconURL: interaction.user.displayAvatarURL(), name: interaction.user.tag })
                .setDescription(`**📋 | تم اضافة ${user.user} الى \`القائمة السوداء\`**`)
                .setColor(`BLACK`)
            interaction.reply({ embeds: [embed] })

        }
        if (interaction.commandName == 'blacklist-remove') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            const user = interaction.options.getMember('user');
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
            db.delete(`blacklist_${interaction.guild.id}_${user.user.id}`)
            const embed = new MessageEmbed()

                .setAuthor({ iconURL: interaction.user.displayAvatarURL(), name: interaction.user.tag })
                .setDescription(`**📋 | تم ازالة ${user.user} من \`القائمة السوداء\`**`)
                .setColor(`BLACK`)
            interaction.reply({ embeds: [embed] })

        }
        if (interaction.commandName == 'ticket-setup') {
            if (!interaction.guild) return interaction.reply(`**😒 | هاذا ليس خادماً**`);
            if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({ content: `❌ **| هاذا الأمر خاص بالمشرفين**`, ephemeral: true });
           let option = [];
            for (let i = 0; i < ticket.SECTIONS.length; i++) {
                option.push({
                    label: ticket.SECTIONS[i].SectionName,
                    value: ticket.SECTIONS[i].SectionID.toString(),
                    emoji: ticket.SECTIONS[i].SectionEmoji
                })
            }
            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('TicketSelect')
                        .setPlaceholder('🎟️ | قم بأختيار نوع التذكرة')
                        .addOptions(option),
                );
            const embed = new MessageEmbed()
            .setTitle(ticket.Embed.Title)
            .setImage(ticket.Embed.Banner)
            .setColor(ticket.Embed.Color)
            .setDescription(ticket.Embed.Description)
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
            let message = await interaction.channel.send({ embeds: [embed] , components: [row] })
            db.set(`TicketSetupMessage_ChannelId_${interaction.guild.id}`, `${interaction.channel.id}`)
            db.set(`TicketSetupMessage_MessageId_${interaction.guild.id}`, `${message.id}`)
        }
    } else if (interaction.isSelectMenu()) {
        if (interaction.customId == "TicketSelect") {
            const reply = await interaction.deferReply({ ephemeral: true });
            const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('close').setStyle('SECONDARY').setEmoji('🔒'),new MessageButton().setCustomId('notfi').setStyle('SECONDARY').setEmoji('🔔'),new MessageButton().setCustomId('cliem').setStyle('SECONDARY').setEmoji('🛠'),);
            if (await db.get(`ticketSpammer_${interaction.guild.id}_${interaction.user.id}`, true)) return interaction.editReply({ embeds: [{ description: `\`❌\` | لديك تذكرة سابقة : [<#${await db.get(`ticketSpammerChannel_${interaction.guild.id}_${interaction.user.id}`)}>]`,color: 'RED' }], ephemeral: true });
            const count = await db.get(`counts_${interaction.guild.id}`);
            const blacklist = await db.get(`blacklist_${interaction.guild.id}_${interaction.user.id}`, true);
            if (blacklist) return interaction.editReply({ embeds: [{ description: '**📋 | انت ضمن القائمة السوداء**', color: 'BLACK' }], ephemeral: true });
            await db.math(`counts_${interaction.guild.id}`, `+`, 1);
            let sectionData = ticket.SECTIONS.filter(data => data.SectionID == interaction.values[0]);
            let rolesPermissionOverwrites = [];
            for (let i = 0; i < sectionData[0].SupportRolesID.length; i++) {
                rolesPermissionOverwrites.push(
                    {
                        id: sectionData[0].SupportRolesID[i],
                        allow: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.ATTACH_FILES]
                    }
                );
            }
            rolesPermissionOverwrites.push(
                {
                    id: interaction.guild.id,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL]
                },
                {
                    id: interaction.user.id,
                    allow: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.ATTACH_FILES]
                }
            );
            if(!client.emojis.cache.find(emoji => emoji.id === sectionData[0].SectionEmoji)) {
                interaction.guild.channels.create(`${sectionData[0].SectionEmoji}・${count || `0`}`, {
                    type: 'GUILD_TEXT',
                    topic: `OPEN : ${interaction.user.id}`,
                    parent: sectionData[0].CategoryID,
                    permissionOverwrites: rolesPermissionOverwrites
                }).then(async (c) => {
                    const role = interaction.guild.roles.cache.find(role => role.id == sectionData[0].MainSupportRolesID);
                    const catagory = sectionData[0].SectionName;
                    let membersWithRole = interaction.guild.roles.cache.get(sectionData[0].MainSupportRolesID).members.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd');
                    var currentdate = new Date();
                    var datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth() + 1) + "/"
                        + currentdate.getFullYear() + " | "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                    const ticket = new MessageEmbed()
                        .setAuthor({ name: `Ticket System`, iconURL: interaction.guild.iconURL() })
                        .addField(`مالك التذكرة : 👥`, `<@${interaction.user.id}>`, true)
                        .addField(`مشرفين التذكرة : 👑`, `${role}`, true)
                        .addField(`تاريخ التذكرة : ⏱`, `\`${datetime}\``, true)
                        .addField(` عدد المشرفين المتواجدين : 🛡`, `\`${membersWithRole.size}\``, true)
                        .addField(`رقم التذكرة : 🗂`, `\`#${count}\``, true)
                        .addField(`قسم التذكرة : ❓`, `\`${catagory}\``, true)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                        .setColor(`${sectionData[0].Color}`)
                        .setImage(sectionData[0].Banner || `null`)
                    c.send({ embeds: [ticket], content: `${role} | ${interaction.user}`, components: [row] });
                    await db.set(`TicketDate_${interaction.guild.id}_${count}`, datetime);
                    await db.set(`TicketStaffRole_${interaction.guild.id}_${count}`, role);
                    await db.set(`ticketSpammer_${interaction.guild.id}_${interaction.user.id}`, true);
                    await db.set(`ticketSpammerChannel_${interaction.guild.id}_${interaction.user.id}`, c.id);
                    await db.set(`TicketCatagory_${interaction.guild.id}_${count}`, catagory.toString());
                    await db.set(`TicketData_${interaction.guild.id}_${count}`, sectionData[0]);
                    const open = new MessageEmbed()
                        .setTitle(`🎫 | نظام التذاكر`)
                        .setDescription(`✔ | تم تجهيز تذكرتك: [<#${c.id}>]`)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                        .setColor(`${sectionData[0].Color || `#FFFFFF`}`)
                        await interaction.editReply({ embeds: [open], ephemeral: true })
                });
            }
            if(client.emojis.cache.find(emoji => emoji.id === sectionData[0].SectionEmoji)) {
                if (sectionData[0].SectionEmoji === sectionData[0].SectionEmoji) {
                    sectionData[0].SectionEmoji = `🎫`;
                }
                interaction.guild.channels.create(`🎫・${count || `0`}`, {
                    type: 'GUILD_TEXT',
                    topic: `OPEN : ${interaction.user.id}`,
                    parent: sectionData[0].CategoryID,
                    permissionOverwrites: rolesPermissionOverwrites
    
                }).then(async (c) => {
                    const role = interaction.guild.roles.cache.find(role => role.id == sectionData[0].MainSupportRolesID);
                    const catagory = sectionData[0].SectionName;
                    let membersWithRole = interaction.guild.roles.cache.get(sectionData[0].MainSupportRolesID).members.filter(m => m.presence?.status === 'online' || m.presence?.status === 'idle' || m.presence?.status === 'dnd');
                    var currentdate = new Date();
                    var datetime = currentdate.getDate() + "/"
                        + (currentdate.getMonth() + 1) + "/"
                        + currentdate.getFullYear() + " | "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();
                    const ticket = new MessageEmbed()
                        .setAuthor({ name: `Ticket System`, iconURL: interaction.guild.iconURL() })
                        .addField(`مالك التذكرة : 👥`, `<@${interaction.user.id}>`, true)
                        .addField(`مشرفين التذكرة : 👑`, `${role}`, true)
                        .addField(`تاريخ التذكرة : ⏱`, `\`${datetime}\``, true)
                        .addField(` عدد المشرفين المتواجدين : 🛡`, `\`${membersWithRole.size}\``, true)
                        .addField(`رقم التذكرة : 🗂`, `\`#${count}\``, true)
                        .addField(`قسم التذكرة : ❓`, `\`${catagory}\``, true)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                        .setColor(`${sectionData[0].Color}`)
                        .setImage(sectionData[0].Banner || `null`)
                    c.send({ embeds: [ticket], content: `${role} | ${interaction.user}`, components: [row] });
                    await db.set(`TicketDate_${interaction.guild.id}_${count}`, datetime);
                    await db.set(`TicketStaffRole_${interaction.guild.id}_${count}`, role);
                    await db.set(`ticketSpammer_${interaction.guild.id}_${interaction.user.id}`, true);
                    await db.set(`ticketSpammerChannel_${interaction.guild.id}_${interaction.user.id}`, c.id);
                    await db.set(`TicketCatagory_${interaction.guild.id}_${count}`, catagory.toString());
                    await db.set(`TicketData_${interaction.guild.id}_${count}`, sectionData[0]);
                    const open = new MessageEmbed()
                        .setTitle(`🎫 | نضام التذاكر`)
                        .setDescription(`✔ | تم تجهيز تذكرتك: [<#${c.id}>]`)
                        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                        .setColor(`${sectionData[0].Color || `#FFFFFF`}`)
                    await interaction.editReply({ embeds: [open], ephemeral: true })
                });
            }
        } 
    }
});
client.on('modalSubmit', async (modal) => {
    const TicketLog = modal.guild.channels.cache.get(ticket.LOGS);
        const TicketFiles = modal.guild.channels.cache.get(ticket.TRANSCRIPT);
	if (modal.customId === 'ClosedReason') {
		const ClosedReason = modal.getTextInputValue('ClosedReason1');
        const row = new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId('transcript').setLabel('حفظ نسخة').setStyle('SUCCESS').setEmoji('📑'),
                    new MessageButton().setCustomId('open').setLabel('أعادة التذكرة').setStyle('PRIMARY').setEmoji('🔓'),
                    new MessageButton().setCustomId('delete').setLabel('حذف التذكرة').setStyle('DANGER').setEmoji('⛔'),
                );
            modal.channel.permissionOverwrites.edit(modal.user.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
            const embeddone = new MessageEmbed()
                .setDescription(`🔒 | التذكرة مغلقة من قبل: <@${modal.user.id}>`)
                .setColor('RED')
          modal.channel.send({ embeds: [embeddone] })
            ///////STAFF
            const embed = new MessageEmbed()
                .setDescription('```قائمة التحكم بالتذكرة```')
                .setColor(`BLUE`)
                modal.channel.send({ embeds: [embed], components: [row] })

            let member = modal.guild.members.cache.find(m => m.id === modal.channel.topic.split("OPEN : ")[1]);
            if(!member) return modal.reply({ content: `> 🙄 **- العضو خارج السيرفر**` })
            if(member) {
            const data = await db.get(`TicketData_${modal.guild.id}_${modal.channel.name.split(`${modal.channel.name.split('・')[0]}・`)[1] || modal.channel.name.split(`🔒・`)[1]}`);
            await db.delete(`ticketSpammer_${modal.guild.id}_${member.id}`, true)
            await db.delete(`ticketSpammerChannel_${modal.guild.id}_${member.id}`)
            const channelEmoji = data.SectionEmoji.length > 1 ? data.SectionEmoji.substring(0, 1) + "🎫" : data.SectionEmoji;
            const staff = await db.get(`TicketStaff_${modal.guild.id}_${modal.channel.name.split(`${channelEmoji}・`)[1] || modal.channel.name.split("🔒・")[1]}`)
            let sss = modal.guild.members.cache.find(r => r.id === staff);
            const date = await db.get(`TicketDate_${modal.guild.id}_${modal.channel.name.split(`${channelEmoji}・`)[1] || modal.channel.name.split("🔒・")[1]}`)
            const rolestaff = await db.get(`TicketStaffRole_${modal.guild.id}_${modal.channel.name.split(`${channelEmoji}・`)[1] || modal.channel.name.split("🔒・")[1]}`)
            const closeed = new MessageEmbed()
                .setAuthor({ name: `Ticket System`, iconURL: modal.guild.iconURL() })
                .setDescription(`**👍🏻 | تم قفل التذكرة**`)
                .setColor(`#e6c452`)
            modal.reply({ embeds: [closeed], components: [], ephemeral: true })
            const tarnscript = await discordTranscripts.createTranscript(modal.channel, {
                fileName: 'transcript.html'
            });
            TicketFiles.send({ files: [tarnscript], }).then(msg => {
                let attachment_url = msg.attachments.first().url;
                const save = new MessageEmbed()
                    .setTitle(`🎟 | مرفقات الذكرة`)
                    .addField(`📑 \`:\` رقم التذكرة`, `\`${modal.channel.name.split(`${channelEmoji}・`)[1] || modal.channel.name.split("🔒・")[1]}\``)
                    .addField(`👑 \`:\` مشرفين التذكرة`, `<@&${rolestaff}>`)
                    .addField(`🛡 \`:\` مسؤول التذكرة`, `${sss || `لم يتم أستلام التذكرة`}`)
                    .addField(`📅 \`:\` وقت التذكرة`, `\`${date}\``)
                    .addField(`📑 \`:\` سبب أغلاق التذكرة`, `\`${ClosedReason}\``)
                    .addField(`🗂 \`:\` ملف التذكرة`, `[Link](${ticket.DOMAIN}direct?url=${attachment_url})`)
                    .setDescription(`**💛 : نتمنى لك يوماً سعيداً**`)
                    .setThumbnail(`https://cdn.discordapp.com/attachments/969900879392174101/977571900110827540/folder-3440973-2888147.png`)
                    .setColor(`#FFD733`)
                    if(member) member.send({ embeds: [save] });
                modal.channel.permissionOverwrites.edit(modal.user.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
                modal.channel.permissionOverwrites.edit(modal.guild.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
                const ClosedTicketsCategory = modal.guild.channels.cache.find(channel => channel.id === data.ClosedTicketsCategoryID).id
                modal.channel.setParent(ClosedTicketsCategory)
                modal.channel.setName(`🔒・${modal.channel.name.split(`${data.SectionEmoji}・`)[1] || modal.channel.name.split("🔒・")[1]}`)
            });
	} else {
        modal.reply({ content: `Test` })
    }
    }
});
client.on('channelDelete', async channel => { 
    const user = channel.guild.fetchAuditLogs({'type': 'CHANNEL_DELETE'})
    const data = await db.get(`TicketData_${channel.guild.id}_${channel.name.split(`${channel.name.split('・')[0]}・`)[1] || channel.name.split(`🔒・`)[1]}`);
    if(!data) return;
    const TicketFiles = channel.guild.channels.cache.get(ticket.TRANSCRIPT);
    let member = channel.guild.members.cache.find(m => m.id === channel.topic.split("OPEN : ")[1]);
    if(member) {
        const save = new MessageEmbed()
        .setTitle(`💛 : نتمنى لك يوماً سعيداً*`)
                    .setDescription(`**🔒 : تم قفل تذكرتك من قبل الأدارة**`)
                    .setColor(data.Color)
                member.send({ embeds: [save]})
                await db.delete(`ticketSpammer_${channel.guild.id}_${member.id}`, true)
                await db.delete(`ticketSpammerChannel_${channel.guild.id}_${member.id}`)
    } else {
        await db.delete(`ticketSpammer_${channel.guild.id}_${channel.guild.members.cache.find(m => m.id === channel.topic.split("OPEN : ")[1])}`, true)
        await db.delete(`ticketSpammerChannel_${channel.guild.id}_${channel.guild.members.cache.find(m => m.id === channel.topic.split("OPEN : ")[1])}`)
    }
    
});
client.on('guildMemberRemove', async member => {
    const data = await db.get(`ticketSpammer_${member.guild.id}_${member.id}`, true);
    if(!data) return;
    const dataChannel = await db.get(`ticketSpammerChannel_${member.guild.id}_${member.id}`)
    const channel = member.guild.channels.cache.get(dataChannel)
    const row = new MessageActionRow()
                .addComponents(
                    new MessageButton().setCustomId('transcript').setLabel('حفظ نسخة').setStyle('SUCCESS').setEmoji('📑'),
                    //new MessageButton().setCustomId('open').setLabel('أعادة التذكرة').setStyle('PRIMARY').setEmoji('🔓'),
                    new MessageButton().setCustomId('delete').setLabel('حذف التذكرة').setStyle('DANGER').setEmoji('⛔'),
                );
    const embed = new MessageEmbed()
    .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
    .addField(`> 🙄 **Leave Server**`,`> **Ticket Control**`)
    .setColor('DARK_RED')
    channel.send({ embeds: [embed], components: [row] })
    const ClosedTicketsCategory = member.guild.channels.cache.find(channel => channel.id === data.ClosedTicketsCategoryID).id
    member.channel.setParent(ClosedTicketsCategory)
    member.channel.setName(`🔒・${member.channel.name.split(`${data.SectionEmoji}・`)[1] || member.channel.name.split("🔒・")[1]}`)
    await db.delete(`ticketSpammer_${member.guild.id}_${member.id}`, true)
   await db.delete(`ticketSpammerChannel_${member.guild.id}_${member.id}`)
});
process.on('unhandledRejection', async (reason, p) => {
	console.log(reason,p)
});
process.on("uncaughtException", (err, origin) => {
	console.log(err,origin)
})
process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log(err,origin)
});
process.on('multipleResolves', (type, promise, reason) => {
	console.log(type,promise,reason)
});
client.login(config.Setting.Token)