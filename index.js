class PDFCanvas {
  constructor() {
    this.modal = document.getElementById("pdf-canvas-modal");
    this.pdfModalBody = document.getElementById("pdf-modal-body");
    this.openEditorButton = document.getElementById("open-editor");
    this.cancelButton = document.getElementById("cancel-btn");
    this.saveButton = document.getElementById("save-btn");
    this.pdfFileInput = document.querySelector("[data-fid=pdfFile]");
    this.canvas = document.getElementById("pdf-canvas");
    this.changeStaffPain = document.getElementById("change-staff-pain");
    this.formVariablePain = document.getElementById("form-variable-pain");
    this.changeStaffButton = document.getElementById("change-staff-btn");
    this.cancelStaffButton = document.getElementById("staff-cancel-btn");
    this.formVariableButton = document.getElementById("form-variable-btn");
    this.closeFormVariableButton = document.getElementById(
      "close-form-variable-btn"
    );
    this.textButton = document.getElementById("text-btn");
    this.pdfCanvasContainer = document.getElementById("pdf-canvas-container");
    this.undoButton = document.getElementById("undo-btn");
    this.deleteButton = document.getElementById("delete-btn");
    this.modalTitle = document.getElementById("pdf-modal-title");
    this.toolDrawer = document.getElementById("tool-drawer");
    this.editMode = "creator";
    this.dateButton = document.getElementById("date-btn");
    this.documentJSON = null;
    this.signerColors = [
      [1, 101, 252],
      [122, 249, 171],
      [255, 113, 36],
      [255, 4, 142],
    ];
    this.signers = [
      {
        name: "Document Signer",
        id: "document-signer",
        color: [150, 100, 255],
      },
    ];
    this.currentFillUser = null;
    this.pdfDocument = null;
    this.objectsAdded = [];
    this.staticObjects = 0;
    this.variableObjects = 0;
    this.fabricCanvas = new fabric.Canvas();
    // this.currentPage = 1;
    this.state = [];
  }

  openEditorModal() {
    // Set PDF Modal canvas to show
    this.modal.style.display = "block";
    document.getElementsByTagName("body")[0].style.overflow = "hidden";
  }

  closeEditorModal() {
    // Set PDF Modal canvas to hidden
    this.modal.style.display = "none";
    document.getElementsByTagName("body")[0].style.overflow = "auto";
  }

  saveEditorModal() {
    // Save State of canvas
    this.state = this.fabricCanvas.toJSON([
      "selectable",
      "inputRectFillRGB",
      "tooltipName",
      "id",
      "userId",
      "edittable",
    ]);

    this.state["objects"] = this.state.objects.filter((o) =>
      o.id && o.id.includes("pdf-page") ? false : true
    );

    this.state["signers"] = this.signers;

    if (this.saveCallback) {
      this.saveCallback(JSON.stringify(this.state));
    }
  }

  showChangeStaff() {
    this.changeStaffPain.classList.add("show");
  }

  closeStaffPain() {
    this.changeStaffPain.classList.remove("show");
  }

  showFormVariablePain() {
    this.formVariablePain.classList.add("show");
  }

  closeFormVariablePain() {
    this.formVariablePain.classList.remove("show");
  }

  objectAdded() {
    let nonPageObjects = this.fabricCanvas
      .getObjects()
      .filter((ob) => (ob.id && ob.id.includes("pdf-page") ? false : true));

    if (nonPageObjects.length) {
      this.undoButton.disabled = false;
    }
  }

  objectRemoved() {
    let nonPageObjects = this.fabricCanvas
      .getObjects()
      .filter((ob) => (ob.id && ob.id.includes("pdf-page") ? false : true));

    if (!nonPageObjects.length) {
      this.undoButton.disabled = true;
    }
  }

  objectSelected(e) {
    const thisContext = this;
    let activeObject = this.fabricCanvas.getActiveObject();

    if (this.editMode === "creator") {
      if (!activeObject) {
        this.deleteButton.disabled = true;
      } else {
        this.deleteButton.disabled = false;
      }
    } else {
      if (activeObject) {
        if (activeObject.type === "SignerTextbox") {
          activeObject.enterEditing();
          activeObject.selectAll();
        } else if (activeObject.type === "SignatureBox") {
          activeObject.getSignature((img) => {
            img.set({
              top: activeObject.top,
              left: activeObject.left,
              selectable: false,
            });

            thisContext.fabricCanvas.remove(activeObject);
            thisContext.fabricCanvas.add(img);
          });
        }
      }
    }
  }

  deleteActiveObject() {
    if (this.fabricCanvas.getActiveObject()) {
      this.fabricCanvas
        .getActiveObjects()
        .forEach((obj) => this.fabricCanvas.remove(obj));
    }
  }

  saveFormVariable(variable) {
    var text = new fabric.SignerTextbox(variable, {
      left: 50,
      top: this.pdfCanvasContainer.scrollTop + 50,
      fontSize: 14,
      fill: "#000",
      textBackgroundColor: "yellow",
      edittable: false,
      mode: "editor",
    });

    this.fabricCanvas.add(text);
    this.fabricCanvas.setActiveObject(text);
    this.fabricCanvas.renderAll();
    this.formVariablePain.classList.remove("show");
  }

  addText() {
    const text = new fabric.IText("New Text", {
      left: 50,
      top: this.pdfCanvasContainer.scrollTop + 50,
      fontSize: 16,
      id: "static-" + this.staticObjects++,
    });
    text.set("editable", true);
    this.fabricCanvas.add(text);
    this.fabricCanvas.setActiveObject(text);
  }

  addTextBox({ name, id, color }) {
    var textbox = new fabric.SignerTextbox("Enter Value", {
      left: 50,
      top: this.pdfCanvasContainer.scrollTop + 50,
      fontSize: 14,
      fill: "#000",
      inputRectFillRGB: color,
      tooltipName: name,
      userId: id,
      mode: "editor",
    });

    this.fabricCanvas.add(textbox);
    this.fabricCanvas.setActiveObject(textbox);
  }

  addSignature({ name, id, color }) {
    var signBox = new fabric.SignatureBox({
      left: 50,
      top: this.pdfCanvasContainer.scrollTop + 50,
      fontSize: 16,
      fill: "#000",
      inputRectFillRGB: color,
      tooltipName: name,
      userId: id,
      mode: "editor",
    });

    this.fabricCanvas.add(signBox);
    this.fabricCanvas.setActiveObject(signBox);
  }

  addRadioButton(count, { name, id, color }) {
    let thisContext = this;

    let buttons = [];

    for (let i = 0; i < count; i++) {
      let button = new fabric.RadioButton({
        left: 50,
        top: this.pdfCanvasContainer.scrollTop + 50 + 30 * i,
        userId: id,
        tooltipName: name,
        inputRectFillRGB: color,
        mode: "editor",
      });

      buttons.push(button);
      this.fabricCanvas.add(button);
    }

    buttons.forEach((b, idx) => {
      b.on("mouseup", function () {
        if (b.fill !== "white") {
          b.set({
            fill: "white",
          });
        } else {
          b.set({
            fill: `rgb(${color.join(",")})`,
          });
        }

        buttons.forEach((b, indx) => indx !== idx && b.set({ fill: "white" }));

        thisContext.fabricCanvas.renderAll();
      });
    });
  }

  addDate() {
    const dateText = new fabric.IText("yyyy/mm/dd", {
      left: 50,
      top: this.pdfCanvasContainer.scrollTop + 50,
      fontSize: 16,
      id: "static-" + this.staticObjects++,
    });
    dateText.set("editable", true);

    this.fabricCanvas.add(dateText);
    this.fabricCanvas.setActiveObject(dateText);
  }

  undoLast() {
    // Get the last object added to the canvas
    let objs = this.fabricCanvas.getObjects();
    if (objs.length > 1) {
      this.fabricCanvas.remove(objs.pop());
    }

    if (objs.length === 1) {
      this.undoButton.disabled = true;
    }
  }

  async loadPdfState(pdf) {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      let viewport = page.getViewport({ scale: 1.5 });
      this.fabricCanvas = new fabric.Canvas(this.canvas, {
        width: viewport.width,
        height: viewport.height,
      });

      const ctx = this.canvas.getContext("2d");

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      await page.render(renderContext).promise;
      const imgData = this.canvas.toDataURL("image/png");

      const pdfPageImage = await this.loadImage(imgData);
      this.fabricCanvas.add(pdfPageImage);
      this.fabricCanvas.renderAll();

      this.state.push(this.fabricCanvas.toJSON());
      this.fabricCanvas.clear();
    }
  }

  async loadAllPdfState(pdf) {
    const pages = [];
    let width = 0,
      height = 0;
    for (let i = 1; i <= pdf.numPages; i++) {
      let page = await pdf.getPage(i);
      let viewport = page.getViewport({ scale: 1.5 });

      if (!width) width = viewport.width;
      height += viewport.height;

      if (i !== pdf.numPages) {
        // padding
        height += 20;
      }

      pages.push({ page, viewport });
    }

    this.fabricCanvas = new fabric.Canvas(this.canvas, {
      width: width,
      height: height,
    });

    this.fabricCanvas.on("selection:created", this.objectSelected.bind(this));
    this.fabricCanvas.on("selection:cleared", this.objectSelected.bind(this));
    this.fabricCanvas.on("selection:updated", this.objectSelected.bind(this));
    this.fabricCanvas.on("object:added", this.objectAdded.bind(this));
    this.fabricCanvas.on("object:removed", this.objectRemoved.bind(this));

    const ctx = this.canvas.getContext("2d");

    const renderContext = {
      canvasContext: ctx,
    };

    for (let j = 0; j < pages.length; j++) {
      renderContext["viewport"] = pages[j].viewport;

      await pages[j].page.render(renderContext).promise;
      const imgData = this.canvas.toDataURL("image/png");

      const pdfPageImage = await this.loadImage(imgData);

      pdfPageImage.set({
        height: pages[j].viewport.height,
        top: j * pages[j].viewport.height + j * 20,
        selectable: false,
        id: "pdf-page-" + j,
      });

      this.fabricCanvas.add(pdfPageImage);

      this.fabricCanvas.renderAll();
    }
  }

  loadImage(url) {
    return new Promise((resolve, reject) => {
      fabric.Image.fromURL(url, (image) => {
        resolve(image);
      });
    });
  }

  fileUpload(event) {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    let thisContext = this;

    fileReader.onload = async () => {
      // Load PDF document from file data
      pdfjsLib
        .getDocument({ data: fileReader.result })
        .promise.then(async (pdf) => {
          thisContext.pdfDocument = pdf;
          await thisContext.loadAllPdfState(pdf);

          this.createSignersList();

          // On load open editor modal
          thisContext.openEditorModal();
          thisContext.openEditorButton.disabled = false;
        });
    };

    fileReader.readAsArrayBuffer(file);
  }

  restoreState() {
    try {
      this.state = JSON.parse(this.documentJSON.value);
    } catch (e) {
      // Some Error Message
    }

    // this.totalPagesNumber.innerText = this.state.length

    this.fabricCanvas = new fabric.Canvas(this.canvas, {
      width: this.state.objects[0].width,
      height: this.state.objects[2].height + this.state.objects[2].top,
    });

    this.fabricCanvas.loadFromJSON(this.state, () => {
      this.fabricCanvas.renderAll();
    });
  }

  async restoreDocument(link, json) {
    let thisContext = this;
    // request the PDF document using fetch
    let pdf = await pdfjsLib.getDocument(link).promise;
    thisContext.pdfDocument = pdf;

    await thisContext.loadAllPdfState(pdf);

    let canvasJSON = this.fabricCanvas.toJSON([
      "selectable",
      "inputRectFillRGB",
      "tooltipName",
      "id",
      "userId",
      "edittable",
    ]);

    let stateJson = JSON.parse(json);

    if (stateJson.objects.length) {
      this.undoButton.disabled = false;

      if (!this.editMode === "creator") {
        stateJson.objects.forEach((obj) => (obj["mode"] = "signer"));
      }
    }

    canvasJSON["objects"].push(...stateJson["objects"]);

    this.signers = stateJson.signers || this.signers;
    this.createSignersList();

    this.fabricCanvas.clear();

    let loadDocumentState = new Promise((res, rej) => {
      thisContext.fabricCanvas.loadFromJSON(canvasJSON, () => {
        thisContext.fabricCanvas.renderAll();

        res();
      });
    });

    await loadDocumentState;
  }

  async downloadDocument() {
    const docDefinition = {
      pageMargins: 0,
      content: [],
    };

    for (const canvasData of this.state) {
      const canvas = fabric.util.createCanvasElement();
      canvas.width = canvasData.objects[0].width;
      canvas.height = canvasData.objects[0].height;

      const fabricCanvas = new fabric.Canvas(canvas);

      await new Promise((resolve) => {
        fabricCanvas.loadFromJSON(canvasData, () => {
          fabricCanvas.renderAll();
          resolve();
        });
      });

      const imageDataUrl = fabricCanvas.toDataURL({
        format: "png",
        multiplier: 1 / fabricCanvas.getRetinaScaling(),
      });

      const scaledWidth = canvas.width / 1.5;
      const scaledHeight = canvas.height / 1.5;

      docDefinition.content.push({
        image: imageDataUrl,
        width: scaledWidth,
        height: scaledHeight,
      });
    }

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.getBlob(() => {
      pdfDocGenerator.download("my-document.pdf");
    });
  }

  createFormVariables(fields) {
    const thisContext = this;

    // Group the fields by the "group" column
    const groupedData = fields.reduce((acc, obj) => {
      if (!acc[obj.group]) {
        acc[obj.group] = [];
      }
      acc[obj.group].push(obj);
      return acc;
    }, {});

    // Create the accordion HTML
    const variableSelect = document.getElementById("form-variable-selection");
    for (const group in groupedData) {
      const groupData = groupedData[group];
      const groupHeader = document.createElement("div");
      groupHeader.classList.add("form-header-dropdown");
      // <div class="form-header-dropdown"><span>Date &amp; Time</span><span>▲</span></div>
      groupHeader.innerHTML = `<span>${group}</span><span class="header-carot">&#9660;</span>`;

      const searchInput = document.createElement("input");
      searchInput.setAttribute("type", "text");
      searchInput.setAttribute("placeholder", "Search");
      searchInput.classList.add("form-control");

      groupHeader.addEventListener("click", () => {
        const content = groupHeader.nextElementSibling;
        if (content.style.display === "none") {
          content.style.display = "block";
          groupHeader.getElementsByClassName("header-carot")[0].innerHTML =
            "&#9650;";
        } else {
          content.style.display = "none";
          groupHeader.getElementsByClassName("header-carot")[0].innerHTML =
            "&#9660;";
        }
      });
      variableSelect.appendChild(groupHeader);
      const groupContent = document.createElement("div");
      searchInput.addEventListener("input", () => {
        const filter = searchInput.value.toLowerCase();
        groupContent.querySelectorAll(".form-variable-item").forEach((item) => {
          const text = item.textContent.toLowerCase();
          if (text.includes(filter)) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });

      groupContent.appendChild(searchInput);
      groupContent.classList.add("form-variable-items");
      groupContent.style.display = "none";
      groupData.forEach((obj) => {
        const fieldContainer = document.createElement("div");
        fieldContainer.addEventListener("click", function () {
          thisContext.saveFormVariable(`[${obj.id}]`);
        });
        fieldContainer.classList.add("form-variable-item");
        fieldContainer.innerHTML = `
  <span>${obj.fieldName}: </span><span class="form-item-variable-id">${obj.id}</span>
          `;
        groupContent.appendChild(fieldContainer);
      });
      variableSelect.appendChild(groupContent);
    }
  }

  createSignersList() {
    const thisContext = this;

    // Group the fields by the "group" column
    const groupedData = this.signers.reduce((acc, obj) => {
      acc[obj.name] = obj;
      return acc;
    }, {});

    // Create the accordion HTML
    const variableSelect = document.getElementById("pdf-signers");
    for (const group in groupedData) {
      const groupData = groupedData[group];
      const groupHeader = document.createElement("div");
      groupHeader.classList.add("form-header-dropdown");
      groupHeader.style.backgroundColor = `rgb(${groupData.color.join(",")})`;
      // <div class="form-header-dropdown"><span>Date &amp; Time</span><span>▲</span></div>
      groupHeader.innerHTML = `<span>${group}</span><span class="header-carot">&#9660;</span>`;

      groupHeader.addEventListener("click", () => {
        const content = groupHeader.nextElementSibling;
        if (content.style.display === "none") {
          content.style.display = "block";
          groupHeader.getElementsByClassName("header-carot")[0].innerHTML =
            "&#9650;";
        } else {
          content.style.display = "none";
          groupHeader.getElementsByClassName("header-carot")[0].innerHTML =
            "&#9660;";
        }
      });

      variableSelect.appendChild(groupHeader);
      const groupContent = document.createElement("div");

      groupContent.classList.add("form-variable-items");
      groupContent.style.display = "none";
      let items = ["Signature", "Radio Button", "Text Box"];
      items.forEach((obj) => {
        const fieldContainer = document.createElement("div");
        const span = document.createElement("span");
        span.innerHTML = obj;
        span.style.flex = "1";
        span.style.padding = "10px 0";

        span.addEventListener("click", function () {
          if (obj === "Text Box") {
            thisContext.addTextBox(groupData);
          }
          if (obj === "Signature") {
            thisContext.addSignature(groupData);
          }
          if (obj === "Radio Button") {
            // add radio button
            thisContext.addRadioButton(
              span.nextElementSibling.value,
              groupData
            );
          }
          // thisContext.saveFormVariable(`[${obj.id}]`);
        });

        fieldContainer.appendChild(span);

        fieldContainer.classList.add("form-variable-item");
        fieldContainer.style.backgroundColor = `rgb(${groupData.color.join(
          ","
        )})`;

        if (obj === "Radio Button") {
          const input = document.createElement("input");
          input.type = "number";
          input.min = "0";
          input.max = "10";
          input.value = "2";
          input.style.width = "50px";
          input.style.color = "#000";

          fieldContainer.appendChild(input);
        }
        groupContent.appendChild(fieldContainer);
      });
      variableSelect.appendChild(groupContent);
    }
    const addButton = document.createElement("div");
    addButton.classList.add("form-header-dropdown");
    addButton.innerHTML = `Add Signer +`;
    addButton.addEventListener("click", this.showChangeStaff.bind(this));
    variableSelect.appendChild(addButton);
  }

  changeFillUser(user) {
    let color = this.signerColors.pop();
    this.signers.push({ name: user.name, id: user.id, color });

    // document.getElementById("fill-user").innerHTML = user.name;
    document.getElementById("pdf-signers").innerHTML = "";
    this.createSignersList();

    this.closeStaffPain();
  }

  createUserList(users) {
    const userList = document.getElementById("user-list");
    const searchInput = document.getElementById("search-users");
    const thisContext = this;

    function renderUsers(userList, users) {
      userList.innerHTML = "";
      users.forEach((user) => {
        const userItem = document.createElement("div");
        userItem.addEventListener("click", () =>
          thisContext.changeFillUser(user)
        );
        userItem.classList.add("user-item");
        userItem.innerHTML = `
            <div>${user.name}</div>
            <div>${user.email}</div>
          `;
        userList.appendChild(userItem);
      });
    }

    renderUsers(userList, users);

    searchInput.addEventListener("input", () => {
      const filter = searchInput.value.toLowerCase();
      const filteredUsers = users.filter((user) => {
        const name = user.name.toLowerCase();
        const email = user.email.toLowerCase();
        return name.includes(filter) || email.includes(filter);
      });
      renderUsers(userList, filteredUsers);
    });
  }

  async initEvents() {
    // Remove for debugging purposes
    // this.openEditorButton.addEventListener("click", this.openEditorModal.bind(this));
    this.cancelButton.addEventListener(
      "click",
      this.closeEditorModal.bind(this)
    );
    this.saveButton.addEventListener("click", this.saveEditorModal.bind(this));
    // this.changeStaffButton.addEventListener("click", this.showChangeStaff.bind(this));
    this.cancelStaffButton.addEventListener(
      "click",
      this.closeStaffPain.bind(this)
    );
    this.textButton.addEventListener("click", this.addText.bind(this));
    this.undoButton.addEventListener("click", this.undoLast.bind(this));
    this.formVariableButton.addEventListener(
      "click",
      this.showFormVariablePain.bind(this)
    );
    this.closeFormVariableButton.addEventListener(
      "click",
      this.closeFormVariablePain.bind(this)
    );
    this.dateButton.addEventListener("click", this.addDate.bind(this));
    this.deleteButton.addEventListener(
      "click",
      this.deleteActiveObject.bind(this)
    );
  }

  async init(options) {
    this.editMode = options.mode || "creator";
    this.saveCallback = options.save;
    this.initEvents();
    if (!options.mode || options.mode === "creator") {
      if (options.link && options.json) {
        await this.restoreDocument(options.link, options.json);
      } else {
        throw new Error("Please include a link/json when calling init()");
      }
      this.createFormVariables(options.fields || []);
      this.createUserList(options.users || []);
      this.modalTitle.innerText = options.title || "Document Editor";
    } else if (options.mode === "signer") {
      this.toolDrawer.style.display = "none";
      this.pdfModalBody.style.justifyContent = "center";
      if (options.link && options.json) {
        await this.restoreDocument(options.link, options.json);
      } else {
        throw new Error("Please include a link/json when calling init()");
      }
      this.modalTitle.innerText = options.title || "Sign Document";
    } else if (options.mode === "admin") {
    }
  }

  initUpload(options) {
    this.editMode = options.mode;
    this.saveCallback = options.save;
    this.initEvents();
    if (!options.mode || options.mode === "creator") {
      if (options.file) {
        this.fileUpload(options.file);
      } else {
        throw new Error("Please include file when calling initUpload()");
      }
      this.createFormVariables(options.fields || []);
      this.createUserList(options.users || []);
      this.modalTitle.innerText = options.title || "Document Editor";
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const html = `
<div id="pdf-canvas-modal" class="pdf-modal">
  <div class="pdf-modal-content">
    <div class="pdf-modal-header">
      <div class="modal-header-group">
        <h3 id="pdf-modal-title">Document Editor</h3>
      </div>
      <div class="modal-header-group">
        <button type="button" class="btn btn-default" id="undo-btn" disabled>Undo</button>
        <button type="button" class="btn btn-danger" id="delete-btn" disabled>Delete</button>
      </div>
    </div>
    <div class="pdf-modal-body" id="pdf-modal-body">
      <div class="pdf-canvas-container" id="pdf-canvas-container">
        <div id="pdf-wrapper">
          <canvas id="pdf-canvas"></canvas>
        </div>
      </div>
      <!-- Tool Drawer -->
      <div id="tool-drawer" class="pdf-modal-tools">
        <h3>Content</h3>

        <div class="pdf-new-fields">
          <div class="new-field-option" id="text-btn">
            Text
          </div>
          <div class="new-field-option" id="form-variable-btn">
            Form Variable
          </div>
          <div class="new-field-option" id="date-btn">
            Date
          </div>
        </div>

        <h3>Document Signers</h3>
        <div id="pdf-signers">

        </div>
        
        <div id="change-staff-pain" class="tool-pain">
          <h3>Select a user</h3>
            <input type="text" class="form-control" id="search-users" placeholder="Search Users">
            <div id="user-list"></div>
          <h4>OR
          <h3>Temporary Signer</h3>
          <form>
            <label>First Name</label>
            <input type="text" class="form-control">
            <label>Last Name</label>
            <input type="text" class="form-control">
            <label>Username</label>
            <input type="text" class="form-control">
            <label>Password</label>
            <input type="password" class="form-control">
          </form>

          <button id="staff-save-btn" type="button" class="btn btn-default">Save</button>
          <button id="staff-cancel-btn" type="button" class="btn btn-default">Cancel</button>
        </div>
        <div id="form-variable-pain" class="tool-pain">
          <h3>Select a variable</h3>
          <div id="form-variable-selection" class="form-variable-selection"></div>

          <button id="close-form-variable-btn" type="button" class="btn btn-default">Cancel</button>
        </div>
      </div>
    </div>
    <div class="pdf-modal-footer">
      <button id="save-btn" type="button" class="btn btn-default">Save</button>
      <button id="cancel-btn" type="button" class="btn btn-default">Cancel</button>
    </div>
  </div>
</div>

<div class="signature-pad-modal" id="signature-pad-modal">
  <div class="signature-pad-content">
    <div id="signature-canvas-container" class="signature-canvas-container">
      <canvas id="signature-pad" class="signature-pad" width=400 height=200></canvas>
    </div>
    <button id="signature-save-btn" type="button" class="btn btn-default">Save</button>
    <button id="signature-cancel-btn" type="button" class="btn btn-default">Cancel</button>
  </div>
</div>
    `

    document.body.innerHTML += html;

});