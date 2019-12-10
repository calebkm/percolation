function init_simulation() {
  pause = false;

  set_n();
  init_grid();
  init_sites();
  display_info(true);
}

function init_grid() {
  var grid = clear_grid();

  for (var i = 0; i < n; i++) {
    var tr = document.createElement('tr');
    grid.appendChild(tr);

    for (var j = 0; j < n; j++) {
      var td = document.createElement('td');
      td.className = 'site';
      td.innerHTML = (i * n) + j;
      tr.appendChild(td);
    }
  }
}

function clear_grid() {
  var grid = el('grid');
  grid.innerHTML = null;

  return grid;
}

function init_sites() {
  sites = new Array(n * n);
  for (var i = 0; i < n * n; i++) sites[i] = 0;
}

function start_simulation(e) {
  e.preventDefault()

  init_simulation();
  run_simulation();

  btn('start', 'fa-undo', 'fa-start');
  btn('pause', 'fa-pause', 'fa-play');
}

function toggle_simulation(e) {
  e.preventDefault();

  if (pause) {
    pause = false;
    run_simulation();
    btn('pause', 'fa-pause', 'fa-play');
  } else {
    pause = true;
    btn('pause', 'fa-play', 'fa-pause');
  }
}

function run_simulation() {
  if (pause) return true;
  if (percolates()) return save_data();

  open_random_site();
  set_full_sites();
  display_info();

  setTimeout(run_simulation, speed());
}

function speed() {
  var s = parseInt(el('speed').value) || 300;
  
  return 600 - s;
}

function open_random_site() {
  var closed = sites_that_are('closed');
  var index = closed[Math.floor(Math.random() * closed.length)];

  set_site(index, 'open');
}

function set_full_sites() {
  var open = sites_that_are('open');

  for (var i = 0; i < open.length; i++) {
    var index = open[i];

    if (site_is_full(index)) {
      set_site(index, 'full');

      return set_full_sites();
    }
  }
}

function set_site(index, name) {
  sites[index] = state(name);

  var site = els('site')[index];
  site.classList.add(name);
}

function percolates() {
  for (var i = (n * n) - n; i < n * n; i++) {
    if (sites[i] == state('full')) return true;
  }
}

function site_is_full(index) {
  if (site_is_top(index) || neighbor_is_full(index)) return true;
}

function site_is_top(index) {
  return neighbors(index).top == undefined;
}

function neighbor_is_full(index) {
  return Object.values(neighbors(index)).includes(state('full'));
}

function neighbors(index) {
  var top = index - n;
  var bottom = index + n;
  var left = (index % n != 0) && index - 1
  var right = (index % n != n - 1) && index + 1;

  return {
    top:    sites[top],
    bottom: sites[bottom],
    left:   sites[left],
    right:  sites[right]
  };
}

function state(name) {
  var states = {closed: 0, open: 1, full: 2};

  return states[name];
}

function sites_that_are(name) {
  var indexes = [];

  for (var i = 0; i < n * n; i++) {
    if (sites[i] == state(name)) indexes.push(i);
  }

  return indexes;
}

function set_n() {
  n = parseInt(el('n').value) || 10;
}

function o() {
  return sites_that_are('open').length + sites_that_are('full').length;
}

function p() {
  return o() / (n * n);
}

function display_info(reset) {
  el('info-n').innerHTML = reset ? '' : '<i>n</i> = ' + n;
  el('info-o').innerHTML = reset ? '' : '<i>o</i> = ' + o();
  el('info-p').innerHTML = reset ? '' : '<i>p</i> = ' + better_to_fixed(p());
}

function save_data() {
  post_data();
  update_count();
  update_p();

  btn('start', 'fa-start', 'fa-undo');
}

function post_data() {
  var xhr = new XMLHttpRequest();
  var url = '/?n=' + n + '&o=' + o();

  xhr.open('POST', url);
  xhr.send(null);
}

function update_count() {
  var count = el('count');

  count.innerHTML = parseInt(count.innerHTML) + 1;
}

function update_p() {
  el('p').innerHTML = calculate_average_p();
}

function calculate_average_p() {
  var average_p = parseFloat(el('p').innerHTML);
  var count = parseInt(el('count').innerHTML);
  var new_p = ((average_p * count) + (p())) / (count + 1);

  return better_to_fixed(new_p);
}

function better_to_fixed(i) {
  return (Math.round(i * 10000 ) / 10000).toFixed(4);
}

function el(id) {
  return document.getElementById(id);
}

function els(klass) {
  return document.getElementsByClassName(klass);
}

function btn(id, add, remove) {
  var i = el(id).children[0];

  i.classList.add(add);
  i.classList.remove(remove);
}

document.addEventListener('DOMContentLoaded', function(event) {
  init_simulation();
});