function unblockAndMute() {
  var users = getBlockedUsers();
  Logger.log(users.length);
  var user = users[users.length-1];
  CacheService.getUserCache().put("unblockAndMute", JSON.stringify([new Date(), Session.getActiveUser().getEmail(), Session.getEffectiveUser().getEmail(), Session.getTemporaryActiveUserKey()]));
  Logger.log(user);
  var user_id = user[0];
  var screen_name = user[1];
  mute(user_id);
  unblock(user_id);
  removeLastUser();
  sendDirectMessage("Unblocked and muted " + "@" + screen_name + "(user_id=" + user_id +")");
  return user;
}

function getLastExecutionDate(){
  return CacheService.getUserCache().get("unblockAndMute");
}
