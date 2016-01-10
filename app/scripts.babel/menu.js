init({}, () => {
  const friendsLink = document.createElement('a');
  friendsLink.href = '/ranklist.aspx?friends&count=1000';
  friendsLink.innerText = getMessage('friends_ranklist');

  const ranklistLink = document.querySelector('a[href="/ranklist.aspx"]');
  ranklistLink.href += '?count=25';
  ranklistLink.parentElement.insertBefore(friendsLink, ranklistLink.nextSibling);
  ranklistLink.parentElement.insertBefore(document.createElement('br'), friendsLink);
});
