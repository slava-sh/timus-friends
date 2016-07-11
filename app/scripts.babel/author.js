init({ friends: true }, ({ friends }) => {
  const profileId = getQueryVariable('id');
  const button = createButton(friends.hasOwnProperty(profileId), profileId);
  observer.forEach('.author_name', el => el.appendChild(button));
});
