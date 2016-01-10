init({ friends: true }, ({ friends }) => {
  const profileId = getQueryVariable('id');
  const currentlyFollowing = friends.hasOwnProperty(profileId);
  const button = createButton(currentlyFollowing, profileId);
  const authorName = document.querySelector('.author_name');
  authorName.appendChild(button);
});
