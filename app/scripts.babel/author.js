function getQueryVariable(variable) {
  // http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
}

function createButton(currentlyFollowing, profileId) {
  const button = document.createElement('button');
  button.innerText = currentlyFollowing ? 'unfollow' : 'follow';
  button.style.transform = 'scale(1.2) rotate(19deg) translate(5px,-16px)';
  button.addEventListener('click', () => {
    if (currentlyFollowing) {
      chrome.runtime.sendMessage({ unfollow: true, profileId });
    } else {
      chrome.runtime.sendMessage({ follow: true, profileId });
    }
    button.remove();
  });
  return button;
}

init(friends => {
  const profileId = getQueryVariable('id');
  const currentlyFollowing = friends.hasOwnProperty(profileId);
  const button = createButton(currentlyFollowing, profileId);
  const authorName = document.querySelector('.author_name');
  authorName.appendChild(button);
});
