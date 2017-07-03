function unblockAndMute() {
  var users = getBlockedUsers();
  Logger.log(users.length);
  var user = users[users.length-1];
  CacheService.getUserCache().put("unblockAndMute", JSON.stringify([new Date(), Session.getActiveUser().getEmail(), Session.getEffectiveUser().getEmail(), Session.getTemporaryActiveUserKey()]));
  Logger.log(user);
  var user_id = user[0];
  mute(user_id);
  unblock(user_id);
  removeLastUser();
  sendDirectMessage("Unblocked and muted " + user_id);
  return user;
}

function getLastExecutionDate(){
  return CacheService.getUserCache().get("unblockAndMute");
}

function sendDirectMessage(message){
  var screen_name = getScreenName();
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/direct_messages/new.json?screen_name=" + screen_name + "&text=" + encodeURIComponent(message), {"method":"POST"});
  var content_text = http_response.getContentText();
  return content_text;  
}

function testSendDirectMessage(){
  sendDirectMessage("hehehe");
}

function getScreenName(){
  var screen_name = CacheService.getUserCache().get("screen_name");
  if(screen_name) return screen_name;
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/account/settings.json");
  var content_text = http_response.getContentText();
  var json_object = JSON.parse(content_text);
  screen_name = json_object.screen_name;
  CacheService.getUserCache().put("screen_name", screen_name, 21600);
  return screen_name;
}

function testGetScreenName(){
  Logger.log(getScreenName());
}
