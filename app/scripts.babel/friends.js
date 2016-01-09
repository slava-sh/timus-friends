function ajax(options, callback) {
  const request = new XMLHttpRequest();
  request.open(options.method, options.url, options.async || true);
  request.onload = function () {
    if (callback) {
      callback(this.response);
    }
  };
  return request.send(options.data);
}

chrome.runtime.sendMessage({ getFriends: true }, friends => {
  const ranklist = document.querySelector('.ranklist').firstChild;
  const body = ranklist.parentNode.parentNode;

  body.querySelector('div').remove();
  Array.from(body.querySelectorAll('.navigation')).forEach(item => {
    item.remove();
  });

  const title = body.querySelector('.title');
  title.innerText = 'Друзья';

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

// <tr class="content">
//   <td>17</td>
//   <td><div class="flags-img flag-UZ" title="Uzbekistan"></div></td>
//   <td class="name"><a href="author.aspx?id=126126">Nodir NAZAROV [TUIT-Karshi]</a></td>
//   <td>647809</td>
//   <td>881</td>
//   <td>24 дек 2015 02:55</td>
// </tr>

  let loadingCount = 0;
  Object.keys(friends).forEach(friend => {
    console.log('loading', friend);
    ++loadingCount;
    ajax({
      method: 'GET',
      url: 'http://acm.timus.ru/author.aspx?id=' + friend,
    }, response => {
      --loadingCount;
      if (loadingCount === 0) {
        spinner.remove();
      }
      const parser = new DOMParser();
      const dom = parser.parseFromString(response, 'text/html');
      const row = dom.querySelector('.ranklist tr.current');
      row.classList.remove('current');
      const flag = dom.querySelector('.author_flag').firstChild;
      const flagTd = document.createElement('td');
      flagTd.appendChild(flag);
      row.insertBefore(flagTd, row.querySelector('td.name'));
      ranklist.appendChild(row);
    });
  });
});
