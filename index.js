
function ListEmbed(barColor, title, des, img, inVoiceCN, loop) {
    if (inVoiceCN === true) {
        var check = 'N/A'
        if (loop === true) {
            check = 'Enabled'
        } else {
            check = 'Disabled'
        }
        const { MessageEmbed } = require('discord.js');
        const dcEmbed = new MessageEmbed()
            .setColor(barColor)
            .setTitle(title)
            .setDescription(des)
            .setThumbnail(img)
            .addFields(
                { name: 'Loop', value: check, inline: false }
            )
            .setTimestamp()
            .setFooter(client.user.username,client.user.avatarURL());
        return dcEmbed;
    } else {
        const { MessageEmbed } = require('discord.js');
        const dcEmbed = new MessageEmbed()
            .setColor(barColor)
            .setTitle(title)
            .setDescription(des)
            .setThumbnail(img)
            .setTimestamp()
            .setFooter(client.user.username,client.user.avatarURL());
        return dcEmbed;
    }
}

// music function
const queue = new Map();

var queueContruct
var loop = false

async function execute(msg, serverQueue) {

    const args = msg.content.split(" ");
    var songInfo
    var song = {}

    if (msg.content.includes('https://') !== true) {
        yt.search(msg.content.substring(5), 1, function (error, result) {
            if (error) {
                msg.channel.send(embed('#FF6767', 'Music | Error 📻', "I didn't find the song you requested \nplease check the correctness!", 'https://media3.giphy.com/media/TqiwHbFBaZ4ti/giphy.gif', true))
                console.log(error);
            }
            else {
                var linkURL = 'https://www.youtube.com/watch?v=' + result.items[0].id.videoId
                var titleName = result.items[0].snippet.title
                song = {
                    title: titleName,
                    url: linkURL,
                    image: result.items[0].snippet.thumbnails.high.url,
                };
                setQueue(result.items[0].snippet.thumbnails.high.url)
            }
        });
    } else if (msg.content.includes('https://') && msg.content.includes('&list')) {
        try {
            var mixPlayListURL = msg.content.slice('https://www.youtube.com/watch?v='.length + 6)
            var mixPlaylist = await ytmpl(mixPlayListURL);

            songInfo = await ytdl.getInfo(args[1]);
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                image: songInfo.videoDetails.thumbnails[4].url,
            };
            setQueue('playlist')
                .then(() => {
                    mixPlaylist.items.forEach(i => {
                        getListOfSong(i.url)
                    })
                    async function getListOfSong(urlList) {
                        songInfo = await ytdl.getInfo(urlList);
                        if (songInfo.videoDetails === undefined) return
                        song = {
                            title: songInfo.videoDetails.title,
                            url: songInfo.videoDetails.video_url,
                            image: '',
                        };
                        setQueue('playlistAdded')
                    }
                    msg.channel.send(embed('#CF90E5', 'Music | Playlist 📻', `${mixPlaylist.title} has been added to the queue!`, song.image, true));
                })
        } catch (error) {
            msg.channel.send(embed('#FF6767', 'Music | Error 📻', "I didn't find the song you requested \nplease check the correctness!", 'https://media3.giphy.com/media/TqiwHbFBaZ4ti/giphy.gif', true))
        }

    } else {
        try {
            songInfo = await ytdl.getInfo(args[1]);
            song = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                image: songInfo.videoDetails.thumbnails[4].url,
            };
            setQueue()
        } catch (error) {
            msg.channel.send(embed('#FF6767', 'Music | Error 📻', "I didn't find the song you requested \nplease check the correctness!", 'https://media3.giphy.com/media/TqiwHbFBaZ4ti/giphy.gif', true))
        }

    }
    var serverQueue
    async function setQueue(typeCheck) {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel)
            return msg.channel.send(embed('#CF90E5', 'Music 📻', `You must be in a voice channel!`, 'https://c.tenor.com/iNu8LXx2ECgAAAAC/senko-poute-hmph.gif', true));
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
            return msg.channel.send(embed('#CF90E5', 'Music 📻', `Sorry, I don't have permission`, 'https://c.tenor.com/Q0HUwg81A_0AAAAC/anime-cry.gif', true));
        }
        // here get editing
        if (serverQueue === undefined) {
            queueContruct = {
                textChannel: msg.channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true
            };
            queue.set(msg.guild.id, queueContruct);
            queueContruct.songs.push(song);
            serverQueue = queue.get(msg.guild.id);

            try {
                var connection = await voiceChannel.join();
         
