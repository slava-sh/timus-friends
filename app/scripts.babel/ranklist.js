init({ friends: true }, ({ friends }) => {
  Array.from(document.querySelectorAll('.ranklist tr.content td.name')).forEach(td => {
    const profileLink = td.querySelector('a');
    const profileId = getQueryVariable('id', profileLink.getAttribute('href'));
    td.appendChild(createButton(friends.hasOwnProperty(profileId), profileId));
  });
});
