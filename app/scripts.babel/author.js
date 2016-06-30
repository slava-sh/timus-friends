init({ friends: true }, ({ observer, friends }) => {
  const profileId = getQueryVariable('id');
  const button = createButton(friends.hasOwnProperty(profileId), profileId);
  observer.forEach('.author_name', elem => elem.appendChild(button));
});
