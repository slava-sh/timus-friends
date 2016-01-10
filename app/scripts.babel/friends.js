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
  rank.innerHTML = profile.rank;
  tr.appendChild(rank);

  const flag = document.createElement('td');
  flag.innerHTML = profile.flag;
  tr.appendChild(flag);

  const name = document.createElement('td');
  name.classList.add('name');
  const a = document.createElement('a');
  a.href = `author.aspx?id=${profile.id}`;
  a.innerHTML = profile.name;
  name.appendChild(a);
  tr.appendChild(name);

  const rating = document.createElement('td');
  rating.innerHTML = profile.rating;
  tr.appendChild(rating);

  const solved = document.createElement('td');
  solved.innerHTML = profile.solved;
  tr.appendChild(solved);

  const lastAC = document.createElement('td');
  lastAC.innerHTML = profile.lastAC;
  tr.appendChild(lastAC);

  return tr;
}

init(friends => {
  const ranklist = document.querySelector('.ranklist tbody');
  const body = ranklist.parentNode.parentNode;

  body.querySelector('.title').innerText = getMessage('friends_ranklist');
  body.querySelector('div').remove();
  Array.from(body.querySelectorAll('.navigation')).forEach(item => {
    item.remove();
  });
  Array.from(ranklist.querySelectorAll('tr')).forEach((item, i) => {
    if (i !== 0) {
      item.remove();
    }
  });

  const spinner = document.createElement('td');
  spinner.innerText = 'loading...';
  const spinnerTr = document.createElement('tr');
  spinnerTr.appendChild(spinner);
  ranklist.appendChild(spinner);

  let loadingCount = 0;
  Object.keys(friends).forEach(friendId => {
    console.log('loading', friendId);
    ++loadingCount;
    ajax({
      method: 'GET',
      url: `http://acm.timus.ru/author.aspx?id=${friendId}`,
    }, response => {
      --loadingCount;
      if (loadingCount === 0) {
        spinner.remove();
      }
      const profile = parseProfile(response);
      console.log(profile);
      const row = renderRow(profile);
      ranklist.appendChild(row);
    });
  });
});
