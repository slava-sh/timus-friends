init({ friends: true }, ({ friends }) => {
  const friendsLink = document.createElement('a');
  friendsLink.href = '/ranklist.aspx?friends&count=1000';
  friendsLink.innerText = getMessage('friends_ranklist');

  const ranklistLink = document.querySelector('a[href="/ranklist.aspx"]');
  ranklistLink.href += '?count=25';
  ranklistLink.parentElement.insertBefore(friendsLink, ranklistLink.nextSibling);
  ranklistLink.parentElement.insertBefore(document.createElement('br'), friendsLink);

  if (!getQueryVariable('friends')) {
    Array.from(document.querySelectorAll('.ranklist tr.content td.name')).forEach(td => {
      const profileLink = td.querySelector('a');
      const profileId = getQueryVariable('id', profileLink.getAttribute('href'));
      td.appendChild(createButton(friends.hasOwnProperty(profileId), profileId));
    });
  }
});
