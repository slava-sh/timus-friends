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
