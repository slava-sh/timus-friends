function parseProfile(html) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, 'text/html');
  const row = dom.querySelector('.ranklist tr.current');
  const profileLink = row.children[1].firstChild;
  return {
    id: getQueryVariable('id', profileLink.getAttribute('href')),
    rank: +row.children[0].innerHTML,
    flag: dom.querySelector('.author_flag').innerHTML,
    name: profileLink.innerHTML,
    rating: +row.children[2].innerHTML,
    solved: +row.children[3].innerHTML,
    lastAC: row.children[4].innerHTML,
  };
}

function renderRow(profile) {
  const tr = document.createElement('tr');
  tr.classList.add('content');

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

init(friends => {
  let ranklist = document.querySelector('.ranklist tbody');

  const body = ranklist.parentNode.parentNode;
  body.querySelector('.title').innerText = getMessage('friends_ranklist');

  body.querySelector('div').remove();
  Array.from(body.querySelectorAll('.navigation')).forEach(item => item.remove());

  const header = ranklist.querySelector('tr');
  const profiles = {};
  Object.keys(friends).map(friendId => {
    profiles[friendId] = {
      id: friendId,
    };
  });

  function replaceRanklist() {
    const newRanklist = renderRanklist(header, profiles);
    ranklist.parentNode.replaceChild(newRanklist, ranklist);
    ranklist = newRanklist;
  }

  replaceRanklist();
  Object.keys(friends).forEach(friendId => {
    ajax({
      method: 'GET',
      url: `http://acm.timus.ru/author.aspx?id=${friendId}`,
    }, response => {
      const profile = parseProfile(response);
      profiles[profile.id] = profile;
      replaceRanklist();
    });
  });
});
