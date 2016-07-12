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
  observer.forEachTextIn('.panel a[href="/news.aspx"]', newsLabel =>
    callback(MESSAGES[newsLabel.textContent === 'Site news' ? 'en' : 'ru']));
}
