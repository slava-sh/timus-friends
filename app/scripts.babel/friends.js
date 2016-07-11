const PAGE_SIZE = 1000;
const PAGES_TO_LOAD = 3;

function parseRow(row, hasFlag) {
  const profileLink = row.children[1 + hasFlag].firstChild;
  const profile = {
    id: getQueryVariable('id', profileLink.getAttribute('href')),
    rank: +row.children[0].innerHTML,
    name: profileLink.innerHTML,
    rating: +row.children[2 + hasFlag].innerHTML,
    solved: +row.children[3 + hasFlag].innerHTML,
    lastAC: row.children[4 + hasFlag].innerHTML,
  };
  if (hasFlag) {
    profile.flag = row.children[1].innerHTML;
  }
  return profile;
}

function parseProfilePage(dom) {
  const row = dom.querySelector('.ranklist tr.current');
  const profile = parseRow(row, false);
  profile.flag = dom.querySelector('.author_flag').innerHTML;
  return profile;
}

function parseRanklistPage(dom) {
  const ranklist = dom.querySelector('.ranklist tbody');
  const profiles = [];
  Array.from(ranklist.querySelectorAll('tr.content > td:first-child')).forEach(td => {
    profiles.push(parseRow(td.parentElement, true));
  });
  return profiles;
}

function renderRow(profile) {
  const tr = document.createElement('tr');
  tr.classList.add('content');
  if (profile.me) {
    tr.classList.add('current');
  }

  const rank = document.createElement('td');
  rank.innerHTML = profile.rank || '';
  tr.appendChild(rank);

  const flag = document.createElement('td');
  flag.innerHTML = profile.flag || '';
  tr.appendChild(flag);

  const name = document.createElement('td');
  name.classList.add('name');
  if (profile.name) {
    const a = document.createElement('a');
    a.href = `author.aspx?id=${profile.id}`;
    a.innerHTML = profile.name;
    name.appendChild(a);
    name.appendChild(createButton(true, profile.id));
  } else {
    name.innerHTML = '&nbsp;';
  }
  tr.appendChild(name);

  const rating = document.createElement('td');
  rating.innerHTML = profile.rating || '';
  tr.appendChild(rating);

  const solved = document.createElement('td');
  solved.innerHTML = profile.solved || '';
  tr.appendChild(solved);

  const lastAC = document.createElement('td');
  lastAC.innerHTML = profile.lastAC || '';
  tr.appendChild(lastAC);

  return tr;
}

function renderNoFriendsRow() {
  const tr = document.createElement('tr');
  tr.classList.add('tf__no-friends');
  const td = document.createElement('td');
  const [before, after] = getMessage('no_friends', '$star$').split('$star$');
  td.appendChild(document.createTextNode(before));
  td.appendChild(createButton(false));
  td.appendChild(document.createTextNode(after));
  tr.appendChild(td);
  return tr;
}

function renderProfileRows(profiles) {
  const profileArr = Object.keys(profiles).map(id => profiles[id]);
  profileArr.sort((a, b) => {
    const rankA = a.rank || Number.POSITIVE_INFINITY;
    const rankB = b.rank || Number.POSITIVE_INFINITY;
    return rankA - rankB;
  });
  return profileArr.map(renderRow);
}

function renderRanklist(header, profiles) {
  const ranklist = document.createElement('tbody');
  const rows = renderProfileRows(profiles);
  if (rows.length) {
    ranklist.appendChild(header);
    rows.forEach(row => ranklist.appendChild(row));
  } else {
    ranklist.appendChild(renderNoFriendsRow());
  }
  return ranklist;
}

function cacheRanks(profiles) {
  const ranks = {};
  Object.keys(profiles).map(id => {
    ranks[id] = profiles[id].rank;
  });
  chrome.runtime.sendMessage({ setCachedRanks: true, cachedRanks: ranks });
}

const SELECTOR_TO_HIDE = 'body > table > tbody > tr:nth-child(n+3)';

function showFriends({ friends, cachedRanks }) {
  let loadingFriends = 0;
  Object.keys(friends).map(id => {
    friends[id] = { id, needsLoading: true };
    ++loadingFriends;
  });

  function loadProfile(profile) {
    if (!friends.hasOwnProperty(profile.id)) {
      return;
    }
    if (friends[profile.id].needsLoading) {
      --loadingFriends;
      if (loadingFriends === 0) {
        cacheRanks(friends);
      }
    }
    friends[profile.id] = profile;
  }

  let ranklist = document.querySelector('.ranklist tbody');
  const header = ranklist.querySelector('tr > th').parentElement;

  function replaceRanklist() {
    const newRanklist = renderRanklist(header, friends);
    ranklist.parentElement.replaceChild(newRanklist, ranklist);
    ranklist = newRanklist;
  }

  const pageBody = ranklist.parentElement.parentElement;
  pageBody.querySelector('.title').innerText = getMessage('friends_ranklist');
  pageBody.querySelector('div').remove(); // Volume navigation

  parseRanklistPage(document).forEach(loadProfile);
  replaceRanklist();
  Array.from(document.querySelectorAll(SELECTOR_TO_HIDE))
    .forEach(el => el.style.display = '');

  const pagesToLoad = {};
  Object.keys(friends).forEach(id => {
    if (!friends[id].needsLoading) {
      return;
    }
    // TODO: what if a friend goes 3000 -> 3001?
    const page = Math.floor((cachedRanks[id] - 1) / PAGE_SIZE) + 1;
    if (cachedRanks[id] && page <= PAGES_TO_LOAD) {
      pagesToLoad[page] = true;
    } else {
      ajax({
        method: 'GET',
        url: `/author.aspx?id=${id}`,
      }, response => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(response, 'text/html');
        loadProfile(parseProfilePage(dom));
        replaceRanklist();
      });
    }
  });
  Object.keys(pagesToLoad).forEach(page => {
    const start = PAGE_SIZE * (page - 1) + 1;
    ajax({
      method: 'GET',
      url: `/ranklist.aspx?from=${start}&count=${PAGE_SIZE}`,
    }, response => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(response, 'text/html');
      parseRanklistPage(dom).forEach(loadProfile);
      replaceRanklist();
    });
  });

  ajax({
    method: 'GET',
    url: `/textstatus.aspx?author=me&count=1`,
  }, response => {
    let myId;
    try {
      myId = response.split('\n')[1].split('\t')[2];
    } catch (e) {
      // Cannot parse my id; carry on.
    }
    if (friends.hasOwnProperty(myId)) {
      friends[myId].me = true;
      replaceRanklist();
    }
  });
}

init({}, () => {
  document.title = getMessage('friends_ranklist') + ' @ Timus Online Judge';
});

observer.forEach(SELECTOR_TO_HIDE, el => el.style.display = 'none');

init({ friends: true, cachedRanks: true }, data => {
  document.addEventListener('DOMContentLoaded', () => {
    showFriends(data);
  });
});
