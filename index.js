'use strict';

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const token = 'xoxb-333237495077-nxUFpLFsoltDyqeKJOtWCFAF';

let slack = new RtmClient(token, {
 logLevel: 'error',
 dataStore: new MemoryDataStore(),
 autoReconnect: true,
 autoMark: true
});

function getChannels(allChannels) {
  let channels = [];

  for (let id in allChannels) {
    let channel = allChannels[id];
    if (channel.is_member) {
      channels.push(channel);
    }
  }
  return channels
}


slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  // Get the user's name
  let user = slack.dataStore.getUserById(slack.activeUserId);
  // Get the team's name
  let team = slack.dataStore.getTeamById(slack.activeTeamId);
  
  console.log(`Connected to ${team.name} as ${user.name}`);
  
  let channels = getChannels(slack.dataStore.channels);
  
  let channelNames = channels.map((channel) => {
  return channel.name;
  }).join(', ');
  console.log(`Currently in: ${channelNames}`)
  
  channels.forEach((channel) => {
    let members = channel.members.map((id) => {
      return slack.dataStore.getUserById(id);
    });
    members = members.filter((member) => {
      return !member.is_bot;
    });
    let memberNames = members.map((member) => {
      return member.name;
    });

    console.log('Members of this channel: ', memberNames);

    //slack.sendMessage(`Hello ${memberNames}!`, channel.id);
  });
 });

 slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
 });

 slack.on(RTM_EVENTS.MESSAGE, (message) => {
   let user = slack.dataStore.getUserById(message.user)

   if (user && user.is_bot) {
     return;
   }

   let channel = slack.dataStore.
   getChannelGroupOrDMById(message.channel);

   if (message.text) {
     let msg = message.text.toLowerCase();

     if (/(hello|hi) (bot|comic_bot)/g.test(msg)) {
       let name = user.name.split('.')[0];
       slack.sendMessage(`Hello to you too, ${name}!`, channel.id);
     }
   }
 });

slack.start();

