/*

ColourPicker.js

A colour picker widget.

http://www.safalra.com/web-design/javascript/widgets/colour-picker/

The author of this program, Safalra (Stephen Morley), irrevocably releases all
rights to this program, with the intention of it becoming part of the public
domain. Because this program is released into the public domain, it comes with
no warranty either expressed or implied, to the extent permitted by law.

For more free and public domain JavaScript code by the same author, visit:
http://www.safalra.com/web-design/javascript/

*/


/* Creates a new ColourPicker. A ColourPicker is a widget allowing a user to
 * choose a colour using either a colour square and a hue slider, or by
 * specifying the colour exactly in the RGB, HSV, or HSL colour spaces. The
 * parameters are:
 *
 * node           - the DOM node into which to insert the ColourPicker - the
 *                  ColourPicker is appended to this node as a child
 * imageDirectory - the path to the images used by the ColourPicker - this may
 *                  be an absolute path or a path relative to the page, and
 *                  should be the empty string if the images reside in the same
 *                  directory as the page itself
 * defaultColour  - a Colour object representing the default colour to display -
 *                  this paramater is optional and defaults to black
 */
function ColourPicker(node, imageDirectory, defaultColour){

  // the current colour
  var colour = (defaultColour ? defaultColour : new RGBColour(0, 0, 0));

  // a list of the component input boxes
  var componentInputBoxes = [];

  // the mouse button status
  var mouseDown = false;

  // the mouse co-ordinates relative to the top left of the screen
  var mouseX = null;
  var mouseY = null;

  // whether the circle (true) or pointers (false) are being dragged
  var draggingCircle = null;

  // the mouse pointer co-ordinates when dragging started
  var dragMouseX = null;
  var dragMouseY = null;

  // the last mouse pointer co-ordinates when dragging
  var dragLastMouseX = null;
  var dragLastMouseY = null;

  // the offsets to use when dragging
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  // the interval used to update when dragging
  var dragInterval = null;

  // the change listeners
  var changeListeners = [];

  // create and style the main colour picker div
  var colourPicker            = document.createElement('div');
  colourPicker.style.position = 'relative';
  colourPicker.style.width    = '500px';
  colourPicker.style.height   = '256px';

  // create and style the main colour square div
  var colourSquare = document.createElement('div');
  colourPicker.appendChild(colourSquare);
  colourSquare.style.position = 'absolute';
  colourSquare.style.top      = '0px';
  colourSquare.style.width    = '256px';
  colourSquare.style.height   = '256px';

  // create and style the white fade on the colour square
  var colourSquareWhiteFade = document.createElement('div');
  colourSquare.appendChild(colourSquareWhiteFade);
  if (window.XMLHttpRequest){
    colourSquareWhiteFade.style.background =
        'url("' + imageDirectory + 'white-fade.png") repeat-y top left';
  }else{
    colourSquareWhiteFade.style.width  = '200px';
    colourSquareWhiteFade.style.height = '200px';
    colourSquareWhiteFade.style.filter =
        'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'
        + imageDirectory
        + 'white-fade.png",sizingMethod="scale")';
  }

  // create and style the black fade on the colour square
  var colourSquareBlackFade = document.createElement('div');
  colourSquareWhiteFade.appendChild(colourSquareBlackFade);
  if (window.XMLHttpRequest){
    colourSquareBlackFade.style.background =
        'url("' + imageDirectory + 'black-fade.png") repeat-x top left';
  }else{
    colourSquareBlackFade.style.width  = '200px';
    colourSquareBlackFade.style.height = '200px';
    colourSquareBlackFade.style.filter =
        'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'
        + imageDirectory
        + 'black-fade.png",sizingMethod="scale")';
  }

  // create and style the circle on the colour square
  var circle = document.createElement('div');
  colourSquareBlackFade.appendChild(circle);
  if (window.XMLHttpRequest){
    circle.style.backgroundImage  = 'url("' + imageDirectory + 'circle.png")';
  }else{
    circle.style.backgroundImage  = 'url("' + imageDirectory + 'square.png")';
  }
  circle.style.backgroundRepeat = 'no-repeat';
  circle.style.width            = '256px';
  circle.style.height           = '256px';
  circle.style.cursor           = 'crosshair';

  // create and style the hue bar
  var hueBar = document.createElement('div');
  colourPicker.appendChild(hueBar);
  hueBar.style.background =
      'url("' + imageDirectory + 'hue-bar.png") repeat-x top left';
  hueBar.style.position = 'absolute';
  hueBar.style.left     = '272px';
  hueBar.style.top      = '0px';
  hueBar.style.width    = '16px';
  hueBar.style.height   = '256px';

  // create and style the pointers
  var pointers = document.createElement('div');
  colourPicker.appendChild(pointers);
  pointers.style.backgroundImage  = 'url("' + imageDirectory + 'pointers.png")';
  pointers.style.backgroundRepeat = 'no-repeat';
  pointers.style.position         = 'absolute';
  pointers.style.left             = '260px';
  pointers.style.top              = '-7px';
  pointers.style.width            = '40px';
  pointers.style.height           = '270px';
  pointers.style.cursor           = 'crosshair';

  // create the preview
  var preview = document.createElement('div');
  colourPicker.appendChild(preview);
  preview.style.position = 'absolute';
  preview.style.left     = '304px';
  preview.style.top      = '0px';
  preview.style.width    = '100px';
  preview.style.height   = '100px';

  // create the component input boxes
  createComponentcomponentInputBoxes(
      ['R', 'G', 'B'],
      ['', '', ''],
      314,
      116,
      updateFromRGB);
  createComponentcomponentInputBoxes(
      ['H', 'S', 'V'],
      ['\u00B0', '%', '%'],
      420,
      0,
      updateFromHSV);
  createComponentcomponentInputBoxes(
      ['H', 'S', 'L'],
      ['\u00B0', '%', '%'],
      420,
      116,
      updateFromHSL);

  // create the hexadecimal input box label
  var heximdecimalBoxLabel = document.createElement('div');
  heximdecimalBoxLabel.appendChild(document.createTextNode('Hexadecimal:'));
  colourPicker.appendChild(heximdecimalBoxLabel);
  heximdecimalBoxLabel.style.position   = 'absolute';
  heximdecimalBoxLabel.style.left       = '304px';
  heximdecimalBoxLabel.style.top        = '232px';
  heximdecimalBoxLabel.style.width      = '100px';
  heximdecimalBoxLabel.style.textAlign  = 'center';
  heximdecimalBoxLabel.style.fontSize   = '14px';
  heximdecimalBoxLabel.style.lineHeight = '21px';

  // create the hexdecimal input box
  var hexadecimalInputBox = document.createElement('input');
  colourPicker.appendChild(hexadecimalInputBox);
  hexadecimalInputBox.style.position   = 'absolute';
  hexadecimalInputBox.style.left       = '420px';
  hexadecimalInputBox.style.top        = '232px';
  hexadecimalInputBox.style.width      = '78px';
  hexadecimalInputBox.style.textAlign  = 'center';
  hexadecimalInputBox.style.fontFamily = 'monospace';

  // listen for a key up event
  if (hexadecimalInputBox.addEventListener){
    hexadecimalInputBox.addEventListener('keyup', updateFromHexadecimal, false);
  }else if (hexadecimalInputBox.attachEvent){
    hexadecimalInputBox.attachEvent('onkeyup', updateFromHexadecimal);
  }

  // initialise the colour
  updateColour();

  // attach the colour picker to the document
  node.appendChild(colourPicker);

  // listen for a mouse up or mouse down event
  if (window.addEventListener){
    window.addEventListener('mouseup', mouseUpListener, false);
    circle.addEventListener('mousedown', circleStartDrag, false);
    pointers.addEventListener('mousedown', pointersStartDrag, false);
  }else if (document.attachEvent){
    document.body.attachEvent('onmouseup', mouseUpListener);
    circle.attachEvent('onmousedown', circleStartDrag);
    pointers.attachEvent('onmousedown', pointersStartDrag);
  }

  /* Creates the input boxes for a set of component values. The parameters are:
   *
   * components - the labels for the individual components
   * units      - the units for the individual components
   * left       - the offset of the left of the boxes
   * top        - the offset of the top of the boxes
   * updater    - the function to call when the value in a box has chanegd
   */
  function createComponentcomponentInputBoxes(
      components, units, left, top, updater){

    // determine the colour space name
    var colourSpace = components.join('');

    // initialise the list of input boxes for this colour space
    componentInputBoxes[colourSpace] = [];

    // create the title
    var title = document.createElement('div');
    title.appendChild(document.createTextNode(colourSpace));
    colourPicker.appendChild(title);
    title.style.position   = 'absolute';
    title.style.left       = left + 'px';
    title.style.top        = top  + 'px';
    title.style.width      = '80px';
    title.style.textAlign  = 'center';
    title.style.fontSize   = '14px';
    title.style.lineHeight = '21px';

    // create the individual component boxes
    for (var i = 0; i < 3; i++){

      // create the component input box label
      var boxLabel = document.createElement('div');
      boxLabel.appendChild(document.createTextNode(components[i] + ':'));
      colourPicker.appendChild(boxLabel);
      boxLabel.style.position   = 'absolute';
      boxLabel.style.left       = left + 'px';
      boxLabel.style.top        = (top + 25 * i  +25) + 'px';
      boxLabel.style.width      = '20px';
      boxLabel.style.fontSize   = '14px';
      boxLabel.style.lineHeight = '21px';

      // create the component input box
      var inputBox = document.createElement('input');
      colourPicker.appendChild(inputBox);
      inputBox.style.position  = 'absolute';
      inputBox.style.left      = (left + 20) + 'px';
      inputBox.style.top       = (top + 25 * i  +25) + 'px';
      inputBox.style.width     = '38px';
      inputBox.style.textAlign = 'right';

      // listen for a key up event
      if (inputBox.addEventListener){
        inputBox.addEventListener('keyup', updater, false);
      }else if (inputBox.attachEvent){
        inputBox.attachEvent('onkeyup', updater);
      }

      // add the input box to the list of input boxes
      componentInputBoxes[colourSpace][components[i]] = inputBox;

      // create the component input box unit
      var boxUnit = document.createElement('div');
      boxUnit.appendChild(document.createTextNode(units[i]));
      colourPicker.appendChild(boxUnit);
      boxUnit.style.position   = 'absolute';
      boxUnit.style.left       = (left + 65) + 'px';
      boxUnit.style.top        = (top + 25 * i  +25) + 'px';
      boxUnit.style.width      = '15px';
      boxUnit.style.fontSize   = '14px';
      boxUnit.style.lineHeight = '21px';

    }

  }

  /* Updates the colour displayed in the colour picker, based on the values in
   * the RGB input boxes.
   */
  function updateFromRGB(){

    // set the colour based on the values in the RGB input boxes
    colour = new RGBColour(
        parseInt('0' + componentInputBoxes.RGB.R.value, 10),
        parseInt('0' + componentInputBoxes.RGB.G.value, 10),
        parseInt('0' + componentInputBoxes.RGB.B.value, 10));

    // update the colour
    updateColour();

  }

  /* Updates the colour displayed in the colour picker, based on the values in
   * the HSV input boxes.
   */
  function updateFromHSV(){

    // set the colour based on the values in the HSV input boxes
    colour = new HSVColour(
        parseInt('0' + componentInputBoxes.HSV.H.value, 10),
        parseInt('0' + componentInputBoxes.HSV.S.value, 10),
        parseInt('0' + componentInputBoxes.HSV.V.value, 10));

    // update the colour
    updateColour();

  }

  /* Updates the colour displayed in the colour picker, based on the values in
   * the HSL input boxes.
   */
  function updateFromHSL(){

    // set the colour based on the values in the HSV input boxes
    colour = new HSLColour(
        parseInt('0' + componentInputBoxes.HSL.H.value, 10),
        parseInt('0' + componentInputBoxes.HSL.S.value, 10),
        parseInt('0' + componentInputBoxes.HSL.L.value, 10));

    // update the colour
    updateColour();

  }

  /* Updates the colour displayed in the colour picker, based on the value in
   * the hexadecimal input box.
   */
  function updateFromHexadecimal(){

    // obtain the value for the hexadecimal input box
    var value = hexadecimalInputBox.value;

    // check that the value is in the appropriate format
    if (value.match(/^#[0-9a-f]{6}$/i)){

      // set the colour based on the value in the hexadecimal input box
      colour = new RGBColour(
          parseInt(value.substring(1,3), 16),
          parseInt(value.substring(3,5), 16),
          parseInt(value.substring(5,7), 16));

      // update the colour
      updateColour();

    }

  }

  /* Updates the colour displayed in the colour picker. This function is called
   * by any function which changes the current colour.
   */
  function updateColour(){

    // update the preview of the colour
    preview.style.background = colour.getCSSIntegerRGB();

    // get the RGB, HSV, and HSL components of the colour
    var rgb = colour.getIntegerRGB();
    var hsv = colour.getHSV();
    var hsl = colour.getHSL();

    // update the colour used for the background of the colour square
    colourSquare.style.backgroundColor =
        (new HSVColour(hsv.h, 100, 100)).getCSSIntegerRGB();

    // update the position of the circle on the colour square
    circle.style.backgroundPosition =
        Math.round(hsv.s / 100 * 255 - 7)
        + 'px '
        + Math.round((100 - hsv.v) / 100 * 255 - 7)
        + 'px';

    // update the position of the pointers
    pointers.style.backgroundPosition =
        '0px '
        + Math.floor(hsv.h / 360 * 256)
        + 'px';

    // update the values in the input boxes
    componentInputBoxes.RGB.R.value = rgb.r;
    componentInputBoxes.RGB.G.value = rgb.g;
    componentInputBoxes.RGB.B.value = rgb.b;
    componentInputBoxes.HSV.H.value = Math.floor(hsv.h);
    componentInputBoxes.HSV.S.value = Math.round(hsv.s);
    componentInputBoxes.HSV.V.value = Math.round(hsv.v);
    componentInputBoxes.HSL.H.value = Math.floor(hsl.h);
    componentInputBoxes.HSL.S.value = Math.round(hsl.s);
    componentInputBoxes.HSL.L.value = Math.round(hsl.l);
    hexadecimalInputBox.value = colour.getCSSHexadecimalRGB();

    // loop over the change listeners, informaing them of the change
    for (var i = 0; i < changeListeners.length; i++){
      changeListeners[i](colour, this);
    }

  }

  /* A listener for the mouse up event. The parameter is:
   *
   * e - the event - if this parameter  is not defined then the global event
   *     object is used instead
   */
   function mouseUpListener(e){

    // get the event object if it was not supplied to the listener
    if (!e) e = window.event;

    // set the button status to up
    mouseDown = false;

  }

  /* A listener for the mouse move event. The parameter is:
   *
   * e - the event - if this parameter is not defined then the global event
   *     object is used instead
   */
  function mouseMoveListener(e){

    // get the event object if it was not supplied to the listener
    if (!e) e = window.event;

    // set the co-ordinates relative to the top-left of the screen
    mouseX = e.screenX;
    mouseY = e.screenY;

    // prevent the browser from responding to the mouse move event
    if (e.preventDefault){
      e.preventDefault();
    }else{
      e.returnValue = false;
    }

  }

  /* Starts dragging the circle. The parameter is:
   *
   * e - the event - if this parameter is not defined then the global event
   *     object is used instead
   */
  function circleStartDrag(e){

    // set that the circle is being dragged
    draggingCircle = true;

    // start the dragging process
    startDrag(e);

  }

  /* Starts dragging the pointers. The parameter is:
   *
   * e - the event - if this parameter is not defined then the global event
   *     object is used instead
   */
  function pointersStartDrag(e){

    // set that the pointers are being dragged
    draggingCircle = false;

    // start the dragging process
    startDrag(e);

  }

  /* Starts dragging the circle or pointers. The parameter is:
   *
   * e - the event - if this parameter is not defined then the global event
   *     object is used instead
   */
  function startDrag(e){

    // check that dragging is not currently occurring
    if (!dragInterval){

      // set the button status to down
      mouseDown = true;

      // get the event object if it was not supplied to the listener
      if (!e) e = window.event;

      // update the mouse co-ordinates with the event that started the drag
      mouseMoveListener(e);

      // listen for mouse move events
      if (document.body.addEventListener){
        document.body.addEventListener('mousemove', mouseMoveListener, false);
      }else if (document.body.attachEvent){
        document.body.attachEvent('onmousemove', mouseMoveListener);
      }

      // store the mouse co-ordinates when dragging started
      dragMouseX = mouseX;
      dragMouseY = mouseY;

      // set the last mouse co-ordinates in order to force an update
      dragLastMouseX = null;
      dragLastMouseY = null;

      // store the offsets to use when dragging
      if (e.offsetX){
        dragOffsetX = e.offsetX;
        dragOffsetY = e.offsetY;
      }else if (e.layerX){
        dragOffsetX = e.layerX;
        dragOffsetY = e.layerY;
      }

      // create the circle drag interval
      dragInterval =
          window.setInterval(updateDrag, 20);

    }

  }

  /* Updates the position of the cicle. If the mouse button has been released
   * then the dragging process is stopped.
   */
  function updateDrag(){

    // get the HSV components of the current colour
    var hsv = colour.getHSV();

    // check whether the circle is being dragged
    if (draggingCircle){

      // set the colour to the colour corresponding to the new circle position
      colour =
          new HSVColour(
              hsv.h,
              (mouseX - dragMouseX + dragOffsetX) / 2.55,
              100 - (mouseY - dragMouseY + dragOffsetY) / 2.55);

    }else{

      // set the colour to the colour corresponding to the new pointers position
      colour =
          new HSVColour(
              Math.max(
                  0,
                  Math.min(
                      359,
                      (mouseY - dragMouseY + dragOffsetY - 7) / 255 * 360)),
              hsv.s,
              hsv.v);

    }

    // update the colour if necessary
    if (dragLastMouseX != mouseX || dragLastMouseY != mouseY) updateColour();

    // store the mouse co-ordinates
    dragLastMouseX = mouseX;
    dragLastMouseY = mouseY;

    // check whether the mouse button has been released
    if (!mouseDown){

      // stop listening for the mouse move event
      if (document.body.removeEventListener){
        document.body.removeEventListener('mousemove', mouseMoveListener, false);
      }else if (document.body.detachEvent){
        document.body.detachEvent('onmousemove', mouseMoveListener);
      }

      // clear the circle drag interval
      window.clearInterval(dragInterval);
      dragInterval = null;

    }

  }

  /* Returns the current colour in this ColourPicker as a Colour object. This
   * will be an instance of RGBColour, HSVColour, or HSLColour.
   */
  this.getColour = function(){

    // return the colour
    return colour;

  };

  /* Sets the current colour in this ColourPicker. The parameter is:
   *
   * newColour - the new colour, as a Colour object
   */
  this.setColour = function(newColour){

    // set the new colour
    colour = newColour;

    // update the colour
    updateColour();

  };

  /* Adds a new change listener. When the current colour in this ColourPicker
   * changes, the each listener is called. Each listener is passed two
   * parameters - the first is the current colour, and the second is the
   * ColourPicker itself. The parameter is:
   *
   * listener - the listener function to add
   */
  this.addChangeListener = function(listener){

    // remove the listener if it is already added in order to avoid duplicates
    this.removeChangeListener(listener);

    // add the new listener to the list of listeners
    changeListeners.push(listener);

  };

  /* Removes the specified change listener. The parameter is:
   *
   * listener - the listener function to remove
   */
  this.removeChangeListener = function(listener){

    // loop over the listeners, deleting any matching the supplied listener
    for (var i = changeListeners.length - 1; i >= 0; i--){
      if (changeListeners[i] == listener) changeListeners.splice(i, 1);
    }

  };

}
