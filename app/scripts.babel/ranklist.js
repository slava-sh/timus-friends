init({ friends: true }, ({ observer, friends }) => {
  observer.forEach('.ranklist tr.content td.name a', profileLink => {
    const profileId = getQueryVariable('id', profileLink.getAttribute('href'));
    const td = profileLink.parentElement;
    td.appendChild(createButton(friends.hasOwnProperty(profileId), profileId));
  });
});
