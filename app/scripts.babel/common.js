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

function getSiteLocale() {
  return /Задачи/.test(document.querySelector('body').innerText) ? 'ru' : 'en';
}

let messageBundle;

function loadMessageBundle(callback) {
  const locale = getSiteLocale();
  ajax({
    method: 'GET',
    url: chrome.runtime.getURL(`_locales/${locale}/messages.json`),
  }, response => {
    messageBundle = JSON.parse(response);
    callback();
  });
}

function getMessage(id) {
  return messageBundle[id].message;
}

function injectFriends(requires, data, callback) {
  if (requires.friends) {
    chrome.runtime.sendMessage({ getFriends: true }, friends => {
      data.friends = friends;
      callback(data);
    });
  } else {
    callback(data);
  }
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
    injectFriends(requires, {}, data => {
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
  chrome.runtime.sendMessage({ follow: true, profileId });
}

function unfollow(profileId) {
  chrome.runtime.sendMessage({ unfollow: true, profileId });
}

function createButton(currentlyFollowing, profileId) {
  const button = document.createElement('button');
  button.classList.add('tf__button');
  if (currentlyFollowing) {
    button.classList.add('tf__button--unfollow');
  } else {
    button.classList.add('tf__button--follow');
  }
  button.addEventListener('click', () => {
    if (currentlyFollowing) {
      unfollow(profileId);
      currentlyFollowing = false;
      button.classList.remove('tf__button--unfollow');
      button.classList.add('tf__button--follow');
    } else {
      follow(profileId);
      currentlyFollowing = true;
      button.classList.remove('tf__button--follow');
      button.classList.add('tf__button--unfollow');
    }
  });
  return button;
}
