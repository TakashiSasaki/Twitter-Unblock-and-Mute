function unblockAndMute() {
  var users = getBlockedUsers();
  Logger.log(users.length);
  var user = users[users.length-1];
  CacheService.getScriptCache().put("unblockAndMute", JSON.stringify([new Date(), Session.getActiveUser().getEmail(), Session.getEffectiveUser().getEmail(), Session.getTemporaryActiveUserKey()]));
  Logger.log(user);
  var user_id = user[0];
  mute(user_id);
  unblock(user_id);
  removeLastUser();
  return user;
}

function getLastExecutionDate(){
  return CacheService.getScriptCache().get("unblockAndMute");
}
