var rect = new fabric.Rect({
    // fill: `rgba(${color.join(", ")}, 0.3)`,
    originX: 'center',
    originY: 'center',
    width: 150,
    height: 60,
    // stroke: `rgb(${color.join(", ")})`,
    strokeWidth: 2,
  });
  
  var text = new fabric.Text('Sign Here', {
    fontSize: 16,
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
    fontFamily: 'Helvetica',
    // fill: `rgb(${color.join(", ")})`,
  });
  
  fabric.SignatureBox = fabric.util.createClass(fabric.Group, {
    type: 'SignatureBox',
    initialize: function(options) {
      rect.set({
        fill: `rgba(${options['inputRectFillRGB'].join(", ")}, 0.3)`,
        stroke: `rgb(${options['inputRectFillRGB'].join(", ")})`,
      })
  
      text.set({
        fill: `rgb(${options['inputRectFillRGB'].join(", ")})`,
      })
  
      // disable textbox to rotate
      options['hoverCursor'] = "pointer"
  
      this.transparentCorners = false;
      this.cornerSize = 10;
      this.cornerColor = `rgb(${options['inputRectFillRGB'].join(", ")})`;
  
      this.minWidth = 150;
      this.maxWidth = 350
      // console.log(options)
  
      this.callSuper('initialize', [ rect, text ], options);
  
      this.controls = {
          ...fabric.Textbox.prototype.controls,
          tl: new fabric.Control({ visible: false }),
          tr: new fabric.Control({ visible: false }),
          bl: new fabric.Control({ visible: false }),
          br: new fabric.Control({ visible: false }),
          mt: new fabric.Control({ visible: false }),
          mr: new fabric.Control({ visible: false }),
          ml: new fabric.Control({ visible: false }),
          mb: new fabric.Control({ visible: false }),
          mtr: new fabric.Control({ visible: false })
      }
  
      if (this.tooltipName !== undefined) {
          let tooltip = this.tooltip();
  
          // add event listeners to show and hide the tooltip
          this.on('mouseover', function(event) {
            tooltip.style.visibility = 'visible';
            let canvasPos = event.e.target.getBoundingClientRect()
            let canvasLeft = canvasPos.x
            let canvasTop = canvasPos.y
  
  
            tooltip.style.left = (canvasLeft + this.left) + "px"
            tooltip.style.top = (canvasTop + this.top + this.height + 10) + "px"
  
            tooltip.style.backgroundColor = "rgba(0,0,0,.7)"
            tooltip.style.color = "#fff"
            tooltip.style.padding = "5px"
            
          });
  
          this.on('mouseout', function(event) {
            tooltip.style.visibility = 'hidden';
          });
  
          this.on('moving', function(event) {
            tooltip.style.visibility = 'hidden'
          })
      }
  
    },
  
    tooltip: function() {
      // create a new HTML element for the tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltips';
      document.body.appendChild(tooltip);
  
      // add the tooltip content to the HTML element
      tooltip.innerHTML = this.tooltipName;
  
      // set the tooltip position and visibility
      tooltip.style.position = 'absolute';
      tooltip.style.visibility = 'hidden';
      tooltip.style.zIndex = 999;
  
      return tooltip
    },
  
    getSignature: function(callback) {
      let width = (this.width * this.scaleX)
      let height = (this.height * this.scaleY)
      let signature = new Signature(width, height)
      signature.showModal()
      signature.saveCallback = callback
    },
    
    // render: function(ctx) {
    //   this.callSuper('render', ctx);
    //   var strokeWidth = 1;
    //   var halfStroke = strokeWidth / 2;
    //   var left = this.left - 5;
    //   var top = this.top - 5;
    //   var width = this.width + 5 * 2;
    //   var height = this.height + 5 * 2;
  
    //   if (this.inputRectFillRGB) {
    //     ctx.strokeStyle = `rgb(${this.inputRectFillRGB.join(", ")})`;
    //     ctx.lineWidth = strokeWidth;
    //     ctx.fillStyle = `rgb(${this.inputRectFillRGB.join(", ")}, 0.3)`;
    //     ctx.strokeRect(left, top, width, height);
    //     ctx.fillRect(left, top, width, height);
    //   }
    // }
    // override default methods here
  });
  
  fabric.SignerTextbox = fabric.util.createClass(fabric.Textbox, {
    type: 'SignerTextbox',
    initialize: function(text, options) {
      // disable textbox to rotate
      this.lockRotation = true;
      options['hoverCursor'] = "pointer"
  
      this.width = options['width'] || 150;
      this.minWidth = options['minWidth'] || 50;
      this.fontFamily = options['fontFamily'] || 'Helvetica';
      this.lockUniScaling = true;
      this.lockUniScaling = true;
      this.transparentCorners = false;
      this.cornerSize = 10;
      if (options['inpuRectFillRGB']) {
        this.cornerColor = `rgb(${options['inputRectFillRGB'].join(", ")})`;
      }
  
      this.callSuper('initialize', text, options);
  
      this.controls = {
          ...fabric.Textbox.prototype.controls,
          tl: new fabric.Control({ visible: false }),
          tr: new fabric.Control({ visible: false }),
          bl: new fabric.Control({ visible: false }),
          br: new fabric.Control({ visible: false }),
          mt: new fabric.Control({ visible: false }),
          mb: new fabric.Control({ visible: false }),
          mtr: new fabric.Control({ visible: false })
      }
  
      if (this.tooltipName !== undefined) {
          let tooltip = this.tooltip();
  
          // add event listeners to show and hide the tooltip
          this.on('mouseover', function(event) {
            tooltip.style.visibility = 'visible';
            let canvasPos = event.e.target.getBoundingClientRect()
            let canvasLeft = canvasPos.x
            let canvasTop = canvasPos.y
  
  
            tooltip.style.left = (canvasLeft + this.left) + "px"
            tooltip.style.top = (canvasTop + this.top + this.height + 10) + "px"
  
            tooltip.style.backgroundColor = "rgba(0,0,0,.7)"
            tooltip.style.color = "#fff"
            tooltip.style.padding = "5px"
            
          });
  
          this.on('mouseout', function(event) {
            tooltip.style.visibility = 'hidden';
          });
  
          this.on('moving', function(event) {
            tooltip.style.visibility = 'hidden'
          })
      }
  
      this.handleMode()
      
    },
    _wrapLine: function(_line, lineIndex, desiredWidth) {
      if (this.edittable) {
        this.callSuper('_wrapLine', _line, lineIndex, desiredWidth);
      } else {
        var width = 0, prevGrapheme, skipLeft = true;
        this.dynamicMinWidth = this.minWidth;
  
        desiredWidth = desiredWidth > this.minWidth ? desiredWidth : this.minWidth;
  
        // charOffset = charOffset || 0;
        for (var i = 0, len = _line.length; i < len; i++) {
            var box = this._getGraphemeBox(_line[i], lineIndex, i, prevGrapheme, skipLeft);
            let letterWidth = box.kernedWidth;
  
            width += letterWidth;
  
            if (width + letterWidth >= desiredWidth) {
                // splice this index on and return the rest of the line
                return [[_line.slice(0, i)]]
            }
  
            prevGrapheme = _line[i];
        }
  
        return [[_line]]
      }
    },
  
    tooltip: function() {
      // create a new HTML element for the tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltips';
      document.body.appendChild(tooltip);
  
      // add the tooltip content to the HTML element
      tooltip.innerHTML = this.tooltipName;
  
      // set the tooltip position and visibility
      tooltip.style.position = 'absolute';
      tooltip.style.visibility = 'hidden';
      tooltip.style.zIndex = 999;
  
      return tooltip
    },
  
    handleMode: function() {
      console.log(this.mode)
      if (this.mode == "signer") {
        this.controls = {
          ...this.controls,
          ml: new fabric.Control({ visible: false }),
          mr: new fabric.Control({ visible: false }),
  
        
      }
      }
    },
    
    render: function(ctx) {
      this.callSuper('render', ctx);
      var strokeWidth = 1;
      var halfStroke = strokeWidth / 2;
      var left = this.left - 5;
      var top = this.top - 5;
      var width = this.width + 5 * 2;
      var height = this.height + 5 * 2;
  
      if (this.inputRectFillRGB) {
        ctx.strokeStyle = `rgb(${this.inputRectFillRGB.join(", ")})`;
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = `rgb(${this.inputRectFillRGB.join(", ")}, 0.3)`;
        ctx.strokeRect(left, top, width, height);
        ctx.fillRect(left, top, width, height);
      }
    }
    // override default methods here
  });
  
  fabric.RadioButton = fabric.util.createClass(fabric.Circle, {
    type: 'RadioButton',
    initialize: function( options ) {
      options['radius'] = 10
      options['fill'] = 'white'
      options['stroke'] = 'black'
      options['strokeWidth'] = 1
      options['fill'] = 'white'
      options['hoverCursor'] = "pointer"
  
      this.transparentCorners = false;
      this.cornerSize = 10;
      this.cornerColor = `rgb(${options['inputRectFillRGB'].join(", ")})`;
  
      this.callSuper('initialize', options);
  
      this.controls = {
          ...fabric.Textbox.prototype.controls,
          tl: new fabric.Control({ visible: false }),
          tr: new fabric.Control({ visible: false }),
          bl: new fabric.Control({ visible: false }),
          mt: new fabric.Control({ visible: false }),
          mb: new fabric.Control({ visible: false }),
          mtr: new fabric.Control({ visible: false }),
          ml: new fabric.Control({ visible: false }),
          mr: new fabric.Control({ visible: false }),
      }
  
      if (this.tooltipName !== undefined) {
          let tooltip = this.tooltip();
  
          // add event listeners to show and hide the tooltip
          this.on('mouseover', function(event) {
            tooltip.style.visibility = 'visible';
            let canvasPos = event.e.target.getBoundingClientRect()
            let canvasLeft = canvasPos.x
            let canvasTop = canvasPos.y
  
  
            tooltip.style.left = (canvasLeft + this.left) + "px"
            tooltip.style.top = (canvasTop + this.top + this.height + 10) + "px"
  
            tooltip.style.backgroundColor = "rgba(0,0,0,.7)"
            tooltip.style.color = "#fff"
            tooltip.style.padding = "5px"
            
          });
  
          this.on('mouseout', function(event) {
            tooltip.style.visibility = 'hidden';
          });
  
          this.on('moving', function(event) {
            tooltip.style.visibility = 'hidden'
          })
      }
  
      this.handleMode()
    },
  
    tooltip: function() {
      // create a new HTML element for the tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltips';
      document.body.appendChild(tooltip);
  
      // add the tooltip content to the HTML element
      tooltip.innerHTML = this.tooltipName;
  
      // set the tooltip position and visibility
      tooltip.style.position = 'absolute';
      tooltip.style.visibility = 'hidden';
      tooltip.style.zIndex = 999;
  
      return tooltip
    },
  
    handleMode: function() {
      if (this.mode == "signer") {
        this.controls = {
          ...this.controls,
          br: new fabric.Control({ visible: false }),
      }
      }
    },
  
    render: function(ctx) {
      this.callSuper('render', ctx);
      var strokeWidth = 1;
      var left = this.left - 5;
      var top = this.top - 5;
      var width = (this.width * this.scaleX) + 5 * 2;
      var height = (this.height * this.scaleY) + 5 * 2;
  
      if (this.inputRectFillRGB) {
        ctx.strokeStyle = `rgb(${this.inputRectFillRGB.join(", ")})`;
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = `rgb(${this.inputRectFillRGB.join(", ")}, 0.3)`;
        ctx.strokeRect(left, top, width, height);
        ctx.fillRect(left, top, width, height);
      }
    }
  });
  
  
  // standard options type:
  fabric.SignatureBox.fromObject = function(object, callback) {
    return fabric.Object._fromObject('SignatureBox', object, callback);
  }
  
  // standard options type:
  fabric.SignerTextbox.fromObject = function(object, callback) {
    return fabric.Object._fromObject('SignerTextbox', object, callback, 'text');
  }
  
  fabric.RadioButton.fromObject = function(object, callback) {
    return fabric.Object._fromObject('RadioButton', object, callback);
  }