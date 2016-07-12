init({}, () => {
  const friendsLink = document.createElement('a');
  friendsLink.href = '/ranklist.aspx?friends&count=1000';
  friendsLink.innerText = getMessage('friends_ranklist');

  observer.forEach('.panel a[href="/ranklist.aspx"]', ranklistLink => {
    ranklistLink.href += '?count=25';
    ranklistLink.parentElement.insertBefore(friendsLink, ranklistLink.nextSibling);
    ranklistLink.parentElement.insertBefore(document.createElement('br'), friendsLink);
  });
});
