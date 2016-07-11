const observer = new ElementObserver();

function ajax(options, callback) {
  const request = new XMLHttpRequest();
  request.open(options.method, options.url, options.async || true);
  request.onload = function handleResponse() {
    if (this.status >= 200 && this.status < 400) {
      if (callback) {
        callback(this.response);
      }
    } else {
      // Ignore errors.
    }
  };
  return request.send(options.data);
}

let messageBundle;

function loadMessageBundle(callback) {
  getSiteMessages(messages => {
    messageBundle = messages;
    callback();
  });
}

function getMessage(id) {
  return messageBundle[id];
}

const FRIENDS_KEY = 'friends';
const FRIENDS_UPDATED_KEY = 'friends_updated';
const LOCALSTORAGE_EXPIRE_SECS = 5 * 60;

function saveFriendsToLocalStorage(friends) {
  localStorage.setItem(FRIENDS_UPDATED_KEY, Date.now());
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

function getFriendsFromLocalStorage() {
  const updated = localStorage.getItem(FRIENDS_UPDATED_KEY);
  if (updated === null ||
      Date.now() - parseInt(updated, 10) > LOCALSTORAGE_EXPIRE_SECS * 1000) {
    return null;
  }
  return JSON.parse(localStorage.getItem(FRIENDS_KEY));
}

function injectFriends(requires, data, callback) {
  if (requires.friends) {
    data.friends = getFriendsFromLocalStorage();
    if (data.friends === null) {
      chrome.runtime.sendMessage({ getFriends: true }, friends => {
        data.friends = friends;
        saveFriendsToLocalStorage(friends);

        callback(data);
      });
      return;
    }
  }
  callback(data);
}

function injectCachedRanks(requires, data, callback) {
  if (requires.cachedRanks) {
    chrome.runtime.sendMessage({ getCachedRanks: true }, cachedRanks => {
      data.cachedRanks = cachedRanks;
      callback(data);
    });
  } else {
    callback(data);
  }
}

function init(requires, callback) {
  loadMessageBundle(() => {
    injectFriends(requires, { observer }, data => {
      injectCachedRanks(requires, data, callback);
    });
  });
}

function parseUrl(url) {
  const parser = document.createElement('a');
  parser.href = url;
  return parser;
}

function getQueryVariable(variable, url) {
  const parsedUrl = url === undefined ? window.location : parseUrl(url);
  const query = parsedUrl.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      if (!pair[1]) {
        return true;
      }
      return decodeURIComponent(pair[1]);
    }
  }
}

function follow(profileId) {
  if (profileId) {
    const friends = JSON.parse(localStorage.getItem(FRIENDS_KEY));
    friends[profileId] = true;
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));

    chrome.runtime.sendMessage({ follow: true, profileId });
  }
}

function unfollow(profileId) {
  if (profileId) {
    const friends = JSON.parse(localStorage.getItem(FRIENDS_KEY));
    delete friends[profileId];
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));

    chrome.runtime.sendMessage({ unfollow: true, profileId });
  }
}

function createButton(currentlyFollowing, profileId) {
  const button = document.createElement('button');
  button.classList.add('tf__button');
  if (currentlyFollowing) {
    button.classList.add('tf__button--unfollow');
    button.title = getMessage('unfollow');
  } else {
    button.classList.add('tf__button--follow');
    button.title = getMessage('follow');
  }
  button.addEventListener('click', () => {
    if (currentlyFollowing) {
      unfollow(profileId);
      currentlyFollowing = false;
      button.classList.remove('tf__button--unfollow');
      button.classList.add('tf__button--follow');
      button.title = getMessage('follow');
    } else {
      follow(profileId);
      currentlyFollowing = true;
      button.classList.remove('tf__button--follow');
      button.classList.add('tf__button--unfollow');
      button.title = getMessage('unfollow');
    }
  });
  return button;
}
