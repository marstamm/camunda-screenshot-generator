/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

const append = fn => (res, data) => {
  let next = `${res} \n ${fn(data)}`;
  return next;
};

const click = selector => `await t.click('${selector}');`;
const start = ({url}) => `await t.navigateTo('${url}');`;

const createScreenshot = path => `await t.takeScreenshot('${path}');`;
const wrapTest = body => `test('MyTest', async t => {
  ${body}
});
`;

const consumers = {
  start: append(start),
  click: append(click),
  stop: (res, {screenshotPath}) =>
    wrapTest(append(createScreenshot)(res, screenshotPath))
};

export const createTest = actions => {
  return actions.reduce(
    (res, {event, data}) => consumers[event](res, data),
    ''
  );
};
