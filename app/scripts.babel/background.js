const STORAGE_KEY = 'friends';

function getFriends(callback) {
  console.log('friends requested');
  chrome.storage.sync.get(STORAGE_KEY, items => {
    callback(items[STORAGE_KEY] || {});
  });
}

function setFriends(newValue, callback) {
  console.log('friends updated', newValue);
  chrome.storage.sync.set({
    [STORAGE_KEY]: newValue,
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
  }
});

console.log('please visit http://acm.timus.ru/ranklist.aspx?friends');
