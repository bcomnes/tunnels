'use strict';

const join = require('path').join;
const nunjucks = require('nunjucks');
const domDelegate = require('dom-delegate');
const ipc = require('electron').ipcRenderer;
const model = require('./model');


function refreshList() {
  const tunnels = model.allTunnels();
  const template = nunjucks.render(
    join(__dirname, 'menu.html'),
    { tunnels }
  );

  document.body.innerHTML = template;
}

function setup() {
  const delegate = domDelegate(document.body);

  refreshList();

  ipc.on('tunnel-saved', refreshList);

  delegate.on('click', '.new-tunnel', () => {
    const tunnel = model.createTunnel();
    ipc.send('edit-tunnel', tunnel.tunnelId);
  });

  delegate.on('click', '.edit', (e, target) => {
    const tunnelId = target.dataset.tunnelId;
    ipc.send('edit-tunnel', tunnelId);
  });

  delegate.on('click', '.exit', () => {
    ipc.send('exit');
  });

  delegate.on('click', '.delete', (e, target) => {
    const tunnelId = target.dataset.tunnelId;
    const tunnelName = model.getTunnel(tunnelId).tunnelName;
    const confirmed = ipc.sendSync('confirm-delete', tunnelName);

    if (confirmed) {
      model.removeTunnel(tunnelId);
      target.parentElement.parentElement.remove();
    }
  });
}

setup();