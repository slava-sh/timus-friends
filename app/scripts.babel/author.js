init({ friends: true }, ({ friends }) => {
  const profileId = getQueryVariable('id');
  const button = createButton(friends.hasOwnProperty(profileId), profileId);
  document.querySelector('.author_name').appendChild(button);
});
