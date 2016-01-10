function ajax(options, callback) {
  const request = new XMLHttpRequest();
  request.open(options.method, options.url, options.async || true);
  request.onload = function handleResponse() {
    if (callback) {
      callback(this.response);
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

function init(callback) {
  loadMessageBundle(() => {
    chrome.runtime.sendMessage({ getFriends: true }, callback);
  });
}

function parseUrl(url) {
  const parser = document.createElement('a');
  parser.href = url;
  return parser;
}

function getQueryVariable(variable, url) {
  const parsedUrl = url === undefined ? window.location : parseUrl(url);
  // http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
  const query = parsedUrl.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}
