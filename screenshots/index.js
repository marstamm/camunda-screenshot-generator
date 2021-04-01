/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

import {createTest} from './testFragments.js';
import {finder} from './lib/finder.js';

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

button.addEventListener(
  'click',
  event => {
    if (recording) {
      recording = false;
      actions.push({
        event: 'stop',
        data: {screenshotPath: 'example.png'}
      });
      button.innerText = 'Start Recording';

      console.log(actions);

      let result = createTest(actions);
      console.log(result);
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
