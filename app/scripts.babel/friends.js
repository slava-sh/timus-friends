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

init(friends => {
  const profiles = {};
  Object.keys(friends).map(friendId => {
    profiles[friendId] = {
      id: friendId,
    };
  });

  let ranklist = document.querySelector('.ranklist tbody');
  let header;

  function replaceRanklist() {
    const newRanklist = renderRanklist(header, profiles);
    ranklist.parentNode.replaceChild(newRanklist, ranklist);
    ranklist = newRanklist;
  }

  document.title = getMessage('friends_ranklist');
  const body = ranklist.parentNode.parentNode;
  body.querySelector('.title').innerText = getMessage('friends_ranklist');
  body.querySelector('div').remove();
  Array.from(body.querySelectorAll('.navigation')).forEach(item => item.remove());

  header = ranklist.querySelector('tr');
  replaceRanklist();

  Object.keys(friends).forEach(friendId => {
    ajax({
      method: 'GET',
      url: `/author.aspx?id=${friendId}`,
    }, response => {
      const profile = parseProfile(response);
      profiles[profile.id] = profile;
      replaceRanklist();
    });
  });

  ajax({
    method: 'GET',
    url: `/textstatus.aspx?author=me&count=1`,
  }, response => {
    const myId = response.split('\n')[1].split('\t')[2];
    profiles[myId].me = true;
    replaceRanklist();
  });
});
