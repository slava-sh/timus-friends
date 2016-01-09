console.log('please visit http://acm.timus.ru/ranklist.aspx?friends');

const friendsLink = document.createElement('a');
friendsLink.href = '/ranklist.aspx?friends';
friendsLink.innerText = 'Рейтинг друзей';

const ranklistLink = document.querySelector('a[href="/ranklist.aspx"]');
ranklistLink.parentNode.insertBefore(friendsLink, ranklistLink.nextSibling);
ranklistLink.parentNode.insertBefore(document.createElement('br'), friendsLink);
