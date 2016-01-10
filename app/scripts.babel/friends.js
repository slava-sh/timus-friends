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

function removeNondataRows(ranklist) {
  Array.from(ranklist.querySelectorAll('.navigation')).forEach(item => item.remove());
  const header = ranklist.querySelector('tr');
  header.remove();
  return header;
}

function parseRanklistPage(dom) {
  const ranklist = dom.querySelector('.ranklist tbody');
  removeNondataRows(ranklist);
  const profiles = [];
  Array.from(ranklist.querySelectorAll('tr')).forEach(row => {
    profiles.push(parseRow(row, true));
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

function renderRows(profiles) {
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
  ranklist.appendChild(header);
  renderRows(profiles).forEach(row => ranklist.appendChild(row));
  return ranklist;
}

function cacheRanks(profiles) {
  const ranks = {};
  Object.keys(profiles).map(id => {
    ranks[id] = profiles[id].rank;
  });
  chrome.runtime.sendMessage({ setCachedRanks: true, cachedRanks: ranks });
}

init({ friends: true, cachedRanks: true }, ({ friends, cachedRanks }) => {
  let loadingFriends = 0;
  Object.keys(friends).map(friendId => {
    friends[friendId] = {
      id: friendId,
      needsLoading: true,
    };
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
  let header;

  function replaceRanklist() {
    const newRanklist = renderRanklist(header, friends);
    ranklist.parentNode.replaceChild(newRanklist, ranklist);
    ranklist = newRanklist;
  }

  document.title = getMessage('friends_ranklist');
  const pageBody = ranklist.parentElement.parentElement;
  pageBody.querySelector('.title').innerText = getMessage('friends_ranklist');
  pageBody.querySelector('div').remove(); // Volume navigation

  header = removeNondataRows(ranklist);
  parseRanklistPage(document).forEach(loadProfile);
  replaceRanklist();

  const pagesToLoad = {};
  Object.keys(friends).forEach(friendId => {
    if (!friends[friendId].needsLoading) {
      return;
    }
    // TODO: what if a friend goes 3000 -> 3001?
    const page = Math.floor((cachedRanks[friendId] - 1) / PAGE_SIZE) + 1;
    if (page <= PAGES_TO_LOAD) {
      pagesToLoad[page] = true;
    } else {
      ajax({
        method: 'GET',
        url: `/author.aspx?id=${friendId}`,
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
    // TODO: handle errors
    const myId = response.split('\n')[1].split('\t')[2];
    if (friends.hasOwnProperty(myId)) {
      friends[myId].me = true;
      replaceRanklist();
    }
  });
});
