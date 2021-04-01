/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

import {createTest} from './testFragments.js';
import {finder} from './lib/finder.js';
import {addAnnotation} from './handleAnnotation.js';
import {clearAllAnnotations} from './lib/annotations.js';

console.log(finder);
let actions = [];
let recording = false;
const button = document.createElement('button');

document.addEventListener(
  'click',
  event => {
    console.log(finder(event.target));
    if (event.target === button) {
      return;
    }
    if (recording)
      actions.push({
        event: 'click',
        data: finder(event.target)
      });
  },
  true
);

button.innerText = 'Start Recording';

const finish = (name, path) => {
  actions.push({
    event: 'stop',
    data: {
      screenshotName: name || 'MyTest',
      screenshotPath: path || 'example.png'
    }
  });
  let result = createTest(actions);
  console.log(result);
  return result;
};

const openOptions = () => {
  let dialog = document.createElement('dialog');
  dialog.zIndex = 5000;
  dialog.style.minWidth = '500px';
  dialog.innerHTML = `<div>
  <div>
    <label>Screenshot Name:</label>
    <input id="screenshotName" class="form-control" placeholder="Example"></input><br />
  </div>
  <div class="form-group">
    <label>Screenshot Path:</label>
    <input id="screenshotPath" class="form-control" placeholder="cockpit/img/example.png"></input>
  </div>
  <button id="addAnnotation" class="btn btn-default">Annotate</button>
  <button id="screenshotSubmit" class="btn btn-primary">Finish</button>
  </div>`;

  document.body.appendChild(dialog);
  dialog.showModal();

  document.getElementById('screenshotSubmit').addEventListener('click', () => {
    const test = finish(
      document.getElementById('screenshotName').value,
      document.getElementById('screenshotPath').value
    );
    dialog.innerHTML = `<textarea readonly style="margin: 0px;width: 401px;height: 252px;white-space: pre;width: 500px;height: 250px;">${test}</textarea>
    <br>
    <button id="copy" class="btn btn-default">Copy</button>
    <button id="done" class="btn btn-primary">Done</button>
    `;
    document.getElementById('copy').addEventListener('click', () => {
      navigator.clipboard.writeText(test);
    });
    document.getElementById('done').addEventListener('click', () => {
      dialog.close();
      clearAllAnnotations();
      dialog.remove();
    });
  });

  document
    .getElementById('addAnnotation')
    .addEventListener('click', async() => {
      // Annotate
      dialog.close();
      const result = await addAnnotation();

      actions.push({
        event: 'annotation',
        data: {
          selector: finder(result.element),
          text: result.text,
          position: result.position
        }
      });
      dialog.showModal();
    });
};

button.addEventListener(
  'click',
  event => {
    if (recording) {
      button.innerText = 'Start Recording';
      recording = false;
      openOptions();
      return;
    }
    recording = true;
    button.innerText = 'Stop Recording';
    actions = [];
    actions.push({
      event: 'start',
      data: {url: location.href, screenshotPath: 'example.png'}
    });
    event.stopPropagation();
  },
  true
);
button.style.zIndex = 100000000;
button.style.position = 'absolute';
button.style.bottom = 0;
button.style.right = 0;

document.body.appendChild(button);
