const FRIENDS_KEY = 'friends';
const CACHED_RANKS_KEY = 'rank_cache';

function getFriends(callback) {
  chrome.storage.sync.get(FRIENDS_KEY, items => {
    callback(items[FRIENDS_KEY] || {});
  });
}

function setFriends(newValue, callback) {
  chrome.storage.sync.set({
    [FRIENDS_KEY]: newValue,
  }, callback);
}

function getCachedRanks(callback) {
  chrome.storage.local.get(CACHED_RANKS_KEY, items => {
    callback(items[CACHED_RANKS_KEY] || {});
  });
}

function setCachedRanks(newValue, callback) {
  chrome.storage.local.set({
    [CACHED_RANKS_KEY]: newValue,
  }, callback);
}

function follow(id, callback) {
  getFriends(friends => {
    const newFriends = friends;
    newFriends[id] = true;
    setFriends(newFriends, callback);
  });
}

function unfollow(id, callback) {
  getFriends(friends => {
    const newFriends = friends;
    delete newFriends[id];
    setFriends(newFriends, callback);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.follow) {
    follow(request.profileId);
  } else if (request.unfollow) {
    unfollow(request.profileId);
  } else if (request.getFriends) {
    getFriends(sendResponse);
    return true;
  } else if (request.getCachedRanks) {
    getCachedRanks(sendResponse);
    return true;
  } else if (request.setCachedRanks) {
    setCachedRanks(request.cachedRanks);
  } else {
    throw new Error('unknown request');
  }
});
