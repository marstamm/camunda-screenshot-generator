/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

function annotation(el, text, options = {x: 0, y: 50}) {
  const bb = el.getBoundingClientRect();

  const UUID =
    'a' +
    Math.random()
      .toString(36)
      .substring(2);
  const textBox = document.createElement('div');
  textBox.style.padding = '15px 30px';
  textBox.style.backgroundColor = '#dcecff';
  textBox.style.border = '1px solid black';
  textBox.style.position = 'absolute';
  textBox.style.zIndex = '999999999';
  textBox.style.fontSize = '18px';
  textBox.style.whiteSpace = 'pre-wrap';
  textBox.style.textAlign = 'center';
  textBox.style.borderRadius = '5px';
  textBox.style.filter = 'drop-shadow(2px 4px 6px grey)';
  textBox.contentEditable = true;
  textBox.classList.add('SCREENSHOT__ANNOTATION');
  textBox.classList.add(UUID);
  textBox.innerHTML = text;

  document.body.appendChild(textBox);

  // This calculates the positioning of the text box and the arrow
  // left, top: css properties of the textbox
  // c[x/y][s/e]: [s]tart/[e]nd [c]oordinates for [x]- and [y] axis of the svg arrow
  let left, top, cxs, cxe, cys, cye;
  let markerSize = 6;
  if (Math.abs(options.x) > Math.abs(options.y)) {
    cys = bb.y + bb.height / 2;
    cye = cys + options.y;
    top = cye - textBox.clientHeight / 2;
    if (options.x > 0) {
      // right
      cxs = bb.x + bb.width + 5 + markerSize / 2;
      left = cxs + options.x;
    } else {
      // left
      cxs = bb.x - markerSize / 2;
      left = bb.x - textBox.clientWidth + options.x - 5;
    }
    cxe = cxs + options.x;
  } else {
    cxs = bb.x + bb.width / 2;
    cxe = cxs + options.x;
    left = cxe - textBox.clientWidth / 2;
    if (options.y > 0) {
      // bottom
      cys = bb.y + bb.height + 5 + markerSize / 2;
      top = cys + options.y;
    } else {
      // top
      cys = bb.y + 2 - markerSize / 2;
      top = bb.y - textBox.clientHeight + options.y;
    }
    cye = cys + options.y;
  }

  textBox.style.top = top + 'px';
  textBox.style.left = left + 'px';

  const svgC = document.createElement('div');
  svgC.style.position = 'absolute';
  svgC.style.zIndex = '99999999';
  svgC.style.top = '0';
  svgC.classList.add('SCREENSHOT__ANNOTATION');
  svgC.classList.add(UUID);

  const height = Math.max(top + textBox.clientHeight, bb.y + bb.height);
  const width = Math.max(left + textBox.clientWidth, bb.x + bb.width);

  svgC.innerHTML = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="width: ${width}px; height: ${height}px;">
  <defs>
    <!-- arrowhead marker definition -->
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z"></path>
    </marker>
  </defs>

  <polyline points="${cxe},${cye}, ${cxs},${cys}" fill="none" stroke="black" stroke-width="3" marker-end="url(#arrow)"></polyline>
</svg>`;

  document.body.appendChild(svgC);
  return [textBox, UUID];
}

const highlightElement = event => {
  console.log(event);
  event.target.style.color = 'orange';
};

const removeHighlight = event => {
  // console.log(event);
  event.target.style.color = '';
};

const annotationOptions = {
  top: {x: 0, y: -50},
  right: {x: 50, y: 0},
  bottom: {x: 0, y: 50},
  left: {x: -50, y: 0}
};

export const addAnnotation = function() {
  return new Promise(resolve => {
    document.addEventListener('mouseover', highlightElement);
    document.addEventListener('mouseout', removeHighlight);

    const selectElement = event => {
      event.stopPropagation();
      event.preventDefault();
      removeHighlight(event);
      document.removeEventListener('mouseover', highlightElement);
      document.removeEventListener('mouseout', removeHighlight);
      annotateElement(event.target);
    };

    const annotateElement = (
      element,
      text = 'Sample Text',
      position = 'bottom'
    ) => {
      document.removeEventListener('click', selectElement, true);

      let [textBox, uid] = annotation(
        element,
        text,
        annotationOptions[position]
      );
      textBox.focus();
      textBox.addEventListener('keydown', event => {
        console.log(event);
        if (event.altKey) {
          switch (event.key) {
            case 'ArrowLeft':
              annotateElement(element, textBox.innerText, 'left');
              event.preventDefault();
              break;

            case 'ArrowRight':
              annotateElement(element, textBox.innerText, 'right');
              event.preventDefault();
              break;

            case 'ArrowDown':
              annotateElement(element, textBox.innerText, 'bottom');
              event.preventDefault();
              break;

            case 'ArrowUp':
              annotateElement(element, textBox.innerText, 'top');
              event.preventDefault();
              break;

            default:
              return;
          }
          document.querySelectorAll(`.${uid}`).forEach(el => {
            el.remove();
          });
        }

        if (event.key === 'Enter' && !event.shiftKey) {
          document.querySelectorAll(`.${uid}`).forEach(el => {
            el.remove();
          });
          annotateElement(element, event.target.innerText, position);
          done(element, event.target.innerText, position);
        }
      });

      // const handleFoucsOut = event => {
      //   document.querySelectorAll(`.${uid}`).forEach(el => {
      //     el.remove();
      //   });
      //   console.log(event.target);
      //   annotateElement(element, event.target.innerText);

      //   done(element, event.target.innerText);
      // };

      // textBox.addEventListener('focusout', handleFoucsOut);
    };

    const done = (element, text, position) => {
      resolve({
        element,
        text,
        position: JSON.stringify(annotationOptions[position])
      });
    };

    document.addEventListener('click', selectElement, true);
  });

  // return {selector, options, text}
};
