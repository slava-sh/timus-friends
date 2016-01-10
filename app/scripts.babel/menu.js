init({}, () => {
  const friendsLink = document.createElement('a');
  friendsLink.href = '/ranklist.aspx?friends&count=1000';
  friendsLink.innerText = getMessage('friends_ranklist');

  const ranklistLink = document.querySelector('a[href="/ranklist.aspx"]');
  ranklistLink.href += '?count=25';
  ranklistLink.parentNode.insertBefore(friendsLink, ranklistLink.nextSibling);
  ranklistLink.parentNode.insertBefore(document.createElement('br'), friendsLink);
});
