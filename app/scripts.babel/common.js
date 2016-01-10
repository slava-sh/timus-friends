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
