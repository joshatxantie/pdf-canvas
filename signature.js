class Signature {
    constructor(width, height) {
      this.canvas = document.getElementById('signature-pad');
      this.canvasContainer = document.getElementById("signature-canvas-container")
      this.modal = document.getElementById("signature-pad-modal");
      this.saveBtn = document.getElementById("signature-save-btn");
      this.cancelBtn = document.getElementById("signature-cancel-btn");
  
      this.canvasContainer.style.width = width * 3 + 'px'
      this.canvasContainer.style.height = height * 3 + 'px'
  
      this.signature = new SignaturePad(this.canvas);
      this.imgData = ""
      this.saveCallback = null
  
      window.onresize = this.resizeCanvas.bind(this);
      this.saveBtn.onclick = this.onSave.bind(this);
      this.cancelBtn.onclick = this.onCancel.bind(this);
  
  
    }
  
    showModal() {
      this.modal.style.display = "block";
      this.resizeCanvas()
    }
  
    onSave() {
      let thisContext = this;
      if (this.signature.isEmpty()) {
        return alert("Please provide a signature first.");
      }
  
      let url = this.signature.toDataURL('image/png');
      this.modal.style.display = "none";
      
      if (this.saveCallback) {
        fabric.Image.fromURL(url, function(oImg) {
          oImg.scale(0.33)
  
          thisContext.saveCallback(oImg)
        });
      }
    }
  
    onCancel() {
      this.modal.style.display = "none";
    }
  // This also causes canvas to be cleared.
    resizeCanvas() {
      // When zoomed out to less than 100%, for some very strange reason,
      // some browsers report devicePixelRatio as less than 1
      // and only part of the canvas is cleared then.
      var ratio =  Math.max(window.devicePixelRatio || 1, 1);
      this.canvas.width = this.canvas.offsetWidth * ratio;
      this.canvas.height = this.canvas.offsetHeight * ratio;
      this.canvas.getContext("2d").scale(ratio, ratio);
    }
  
  }