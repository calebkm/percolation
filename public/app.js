// Create the DOM representation of our 2-d grid.
// This is tabular data, so, what the heck,
// let's use a table.
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

// Setup the array representing each site of our
// 2-d n x n grid. Sites can be in one of 3 states:
//    (0) closed
//    (1) open
//    (2) full
// All sites are initialized in the `closed` state.
function init_sites() {
  sites = new Array(n * n);
  for (var i = 0; i < n * n; i++) sites[i] = state('closed');
}

function start_simulation(e) {
  e.preventDefault()

  init_simulation();
  run_simulation();

  toggle_btn('start', 'fa-undo', 'fa-start');
  toggle_btn('pause', 'fa-pause', 'fa-play');
}

function init_simulation() {
  paused = false;

  set_n();
  init_grid();
  init_sites();
  display_info(true);
}

function toggle_simulation(e) {
  e.preventDefault();

  if (is_playing()) {
    if (paused) {
      paused = false;
      run_simulation();
      toggle_btn('pause', 'fa-pause', 'fa-play');
    } else {
      paused = true;
      toggle_btn('pause', 'fa-play', 'fa-pause');
    }
  }
}

// If the system percolastes we're done.
// Otherwise continue looping, randomly opening up
// a site and checking wheather we percolate.
function run_simulation() {
  if (paused) return true;
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

// Loop through all `open` sites and see if they're actually
// `full`. If we do find a full site, we then restart
// the loop, making sure we re-check every `open` site.
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

// Does the system percolate?
// If any site from the bottom row is `full` 
// then we know there's a connected component
// all the way to the top of the grid.
//
// The bottom row will -at max- have `n` sites to check.
function percolates() {
  for (var i = (n * n) - n; i < n * n; i++) {
    if (sites[i] == state('full')) return true;
  }
}

// Sites are `full` when:
//  a) They are on the top row of the grid,
//               OR
//  b) they're touching a neighbor that is `full`. 
function site_is_full(index) {
  if (site_is_top(index) || neighbor_is_full(index)) return true;
}

function site_is_top(index) {
  return neighbors(index).top == undefined;
}

function neighbor_is_full(index) {
  return Object.values(neighbors(index)).includes(state('full'));
}

// Because we only ever have to check a total of
// four neighbors, this check is quick.
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
  el('info-p').innerHTML = reset ? '' : '<i>p</i> = ' + better_toFixed(p());
}

function save_data() {
  post_data();
  upate_simulation_count();
  update_average_p();

  toggle_btn('start', 'fa-start', 'fa-undo');
}

function post_data() {
  var xhr = new XMLHttpRequest();
  var url = '/?n=' + n + '&o=' + o();

  xhr.open('POST', url);
  xhr.send(null);
}

function upate_simulation_count() {
  var count = el('count');

  count.innerHTML = parseInt(count.innerHTML) + 1;
}

function update_average_p() {
  el('p').innerHTML = calculate_average_p();
}

function calculate_average_p() {
  var average_p = parseFloat(el('p').innerHTML);
  var count = parseInt(el('count').innerHTML);
  var new_p = ((average_p * count) + (p())) / (count + 1);

  return better_toFixed(new_p);
}

function better_toFixed(i) {
  return (Math.round(i * 10000 ) / 10000).toFixed(4);
}

function el(id) {
  return document.getElementById(id);
}

function els(klass) {
  return document.getElementsByClassName(klass);
}

function toggle_btn(id, add, remove) {
  var i = el(id).children[0]; // grab inner <i>

  i.classList.add(add);
  i.classList.remove(remove);
}

function is_playing() {
  return el('start').
    children[0].
    classList.
    value.
    split(' ').
    includes('fa-undo');
}

document.addEventListener('DOMContentLoaded', function(event) {
  init_simulation();
});