// We can't use messages.json for these messages because the locale for them
// depends on the site content
const MESSAGES = {
  en: {
    friends_ranklist: 'Friends ranklist',
    follow: 'Add to friends',
    unfollow: 'Remove from friends',
    no_friends: 'Use the $star$ icon to add friends.',
  },
  ru: {
    friends_ranklist: 'Рейтинг друзей',
    follow: 'Добавить в друзья',
    unfollow: 'Удалить из друзей',
    no_friends: 'Используйте кнопку $star$, чтобы добавить друзей.',
  },
};

function getSiteMessages(callback) {
  observer.forEach('.panel a[href="/news.aspx"]', newsLink =>
    callback(MESSAGES[newsLink.innerText === 'Site news' ? 'en' : 'ru']));
}
