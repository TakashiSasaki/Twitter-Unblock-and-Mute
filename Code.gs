function doGet() {
  return HtmlTemplateLibrary.tabs([
    HtmlService.createTemplateFromFile("index").evaluate().setTitle("Twitter Unblock and Mute")
  ], HtmlService.createHtmlOutputFromFile("css").setTitle("Twitter Unblock and Mute"));
}

function getAuthorizationUrl(){
  var service = getTwitterService();
  var authorization_url = service.authorize();
  Logger.log(authorization_url);
  return authorization_url;
}

function hasAccess(){
  var service = getTwitterService();
  return service.hasAccess();
}

function getTwitterService() {
  var service = OAuth1.createService("twitter");
  service.setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
  service.setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
  service.setAuthorizationUrl("https://api.twitter.com/oauth/authorize")
  service.setConsumerKey(PropertiesService.getScriptProperties().getProperty("client_id"));
  service.setConsumerSecret(PropertiesService.getScriptProperties().getProperty("client_secret"));
  //service.setProjectKey(PropertiesService.getScriptProperties().getProperty("project_key"));
  service.setCallbackFunction("authCallback");
  service.setPropertyStore(PropertiesService.getScriptProperties());
  return service;
}

function authCallback(request) {
  var service      = getTwitterService();
  var isAuthorized = service.handleCallback(request);
  if(isAuthorized) {
    return HtmlService.createHtmlOutput("Success! You can close this page.");
  } else {
    return HtmlService.createHtmlOutput("Denied. You can close this page");
  }
}

function getBlockedUsers(){
  var json_string = CacheService.getUserCache().get("users");
  if(json_string) {
    var json_object = JSON.parse(json_string);
    return json_object;
  } else {
    return fetchBlockedUsers();
  }
}

function fetchBlockedUsers(cursor, users){
  var service = getTwitterService();
  if(cursor === undefined) {
    var http_response = service.fetch("https://api.twitter.com/1.1/blocks/list.json?include_entities=false&skip_status=true");
    users = [];
  } else {
    var http_response = service.fetch("https://api.twitter.com/1.1/blocks/list.json?include_entities=false&skip_status=true&cursor=" + cursor);  
  }
  var content_text = http_response.getContentText();
  var o = JSON.parse(content_text);
  for(var i in o.users) {
    var user = [o.users[i].id_str, o.users[i].screen_name, o.users[i].description];
    users.push(user);
  }
  CacheService.getUserCache().put("users", JSON.stringify(users), 21600);
  if(o.next_cursor_str) {
    Logger.log(o.next_cursor_str);
    return fetchBlockedUsers(o.next_cursor_str, users);
  } else {
    return users;
  }
}

function unblock(user_id){
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/blocks/destroy.json?user_id=" + user_id, {"method":"POST"});
  var content_text = http_response.getContentText();
  return content_text;
}

function mute(user_id){
  var service = getTwitterService();
  var http_response = service.fetch("https://api.twitter.com/1.1/mutes/users/create.json?user_id=" + user_id, {"method": "POST"});
  var content_text = http_response.getContentText();
  return content_text;
}

function removeLastUser(){
  var json_string = CacheService.getUserCache().get("users");
  var users = JSON.parse(json_string);
  users.pop();
  if(users.length==0){
    CacheService.getUserCache().remove("users");
    return;
  }
  CacheService.getUserCache().put("users", JSON.stringify(users), 21600);
}

function clearCache(){
  CacheService.getUserCache().remove("users");
}
