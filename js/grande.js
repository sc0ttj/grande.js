(function() {
  /*jshint multistr:true */
  var EDGE = -999;

  var root = this,   // Root object, this is going to be the window for now
      document = this.document, // Safely store a document here for us to use
      editableNodes = document.querySelectorAll(".g-body article"),
      editNode = editableNodes[0], // TODO: cross el support for imageUpload
      isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
      toolbarAttached,
      options = {
        animate: true
      },
      textMenu,
      range,
      optionsNode,
      urlInput,
      previouslySelectedText,
      // imageTooltip,
      // imageInput,
      // imageBound,

      tagClassMap = {
        "b": "bold",
        "i": "italic",
        // "h1": "header1",
        // "h2": "header2",
        "a": "url",
        "blockquote": "quote"
      };

  function attachToolbarTemplate() {
    if (!toolbarAttached) {
      toolbarAttached = true;
      var div = document.createElement("div"),
        toolbarTemplate = "<div class='g-options'> \
          <span class='no-overflow'> \
            <span class='ui-inputs'> \
              <button class='bold'>B</button> \
              <button class='italic'>i</button> \
              <button class='quote'>&rdquo;</button> \
              <button class='url'>&#128279;</button> \
              <input class='url-input' type='text' placeholder='Paste or type a link'/> \
            </span> \
          </span> \
        </div>",
        // imageTooltipTemplate = document.createElement("div"),
        toolbarContainer = document.createElement("div");

      toolbarContainer.className = "g-options-container";
      
      if (document.querySelectorAll('.g-options-container').length < 1){
        document.body.appendChild(toolbarContainer);
      }

      div.className = "text-menu hide";
      div.innerHTML = toolbarTemplate;

      if (document.querySelectorAll(".text-menu").length === 0) {
        toolbarContainer.appendChild(div);
      }

      textMenu = document.querySelectorAll(".text-menu")[0];
      optionsNode = document.querySelectorAll(".text-menu .g-options")[0];
      urlInput = document.querySelectorAll(".text-menu .url-input")[0];
    }
  }

  function bindTextSelectionEvents() {
    var i,
        len,
        node;

    if (selectionchange) {
      selectionchange.start();
    }

    document.addEventListener('selectionchange', triggerTextSelection);

    // document.addEventListener('keydown', preprocessKeyDown);

    // document.addEventListener('keyup', function (event) {
    //   var sel = window.getSelection();

    //   // FF will return sel.anchorNode to be the parentNode when the triggered keyCode is 13
    //   if (sel.anchorNode && sel.anchorNode.nodeName !== "ARTICLE") {
    //     triggerNodeAnalysis(event);

    //     if (sel.isCollapsed) {
    //       triggerTextParse(event);
    //     }
    //   }
    // });

    // Handle window resize events
    root.addEventListener('resize', triggerTextSelection);

    urlInput.addEventListener('blur', triggerUrlBlur);
    urlInput.addEventListener('keydown', triggerUrlSet);
  }

  function iterateTextMenuButtons(callback) {
    var textMenuButtons = document.querySelectorAll(".text-menu button"),
        i,
        len,
        node,
        fnCallback = function(n) {
          callback(n);
        };

    for (i = 0, len = textMenuButtons.length; i < len; i++) {
      node = textMenuButtons[i];

      fnCallback(node);
    }
  }

  function bindTextStylingEvents() {
    iterateTextMenuButtons(function(node) {
      node.onmousedown = function(event) {
        triggerTextStyling(node);
      };
    });
  }

  function getFocusNode() {
    return root.getSelection().focusNode;
  }

  function reloadMenuState() {
    var className,
        focusNode = getFocusNode(),
        tagClass,
        reTag;

    iterateTextMenuButtons(function(node) {
      className = node.className;

      for (var tag in tagClassMap) {
        tagClass = tagClassMap[tag];
        reTag = new RegExp(tagClass);

        if (reTag.test(className)) {
          if (hasParentWithTag(focusNode, tag)) {
            node.className = tagClass + " active";
          } else {
            node.className = tagClass;
          }

          break;
        }
      }
    });
  }

  // function preprocessKeyDown(event) {
  //   var sel = window.getSelection(),
  //       parentParagraph = getParentWithTag(sel.anchorNode, "p"),
  //       p,
  //       isHr;

  //   if (event.keyCode === 13 && parentParagraph) {
  //     isHr = ((parentParagraph.previousSibling || {}).nodeName === "HR" ||
  //       (parentParagraph.previousElementSibling || {}).nodeName === "HR") &&
  //       (sel.extentOffset === 0 || !parentParagraph.textContent.length);

  //     // Stop enters from creating another <p> after a <hr> on enter
  //     if (isHr) {
  //       event.preventDefault();
  //     }
  //   }
  // }

  // function triggerNodeAnalysis(event) {
  //   var sel = window.getSelection(),
  //       anchorNode,
  //       parentParagraph;

  //   if (event.keyCode === 13) {

  //     // Enters should replace it's parent <div> with a <p>
  //     if (sel.anchorNode.nodeName === "DIV") {
  //       toggleFormatBlock("p");
  //     }

  //     // parentParagraph = getParentWithTag(sel.anchorNode, "p");

  //     // if (parentParagraph) {
  //     //   insertHorizontalRule(parentParagraph);
  //     // }
  //   }
  // }

  // function insertHorizontalRule(parentParagraph) {
  //   var prevSibling,
  //       prevPrevSibling,
  //       hr;

  //   prevSibling = parentParagraph.previousSibling;
  //   prevPrevSibling = prevSibling;

  //   while (prevPrevSibling) {
  //     if (prevPrevSibling.nodeType != Node.TEXT_NODE) {
  //       break;
  //     }

  //     prevPrevSibling = prevPrevSibling.previousSibling;
  //   }

  //   if (prevSibling.nodeName === "P" && !prevSibling.textContent.length && prevPrevSibling.nodeName !== "HR") {
  //     hr = document.createElement("hr");
  //     hr.contentEditable = false;
  //     parentParagraph.parentNode.replaceChild(hr, prevSibling);
  //   }
  // }

  function getTextProp(el) {
    var textProp;

    if (el.nodeType === Node.TEXT_NODE) {
      textProp = "data";
    } else if (isFirefox) {
      textProp = "textContent";
    } else {
      textProp = "innerText";
    }

    return textProp;
  }

  function insertListOnSelection(sel, textProp, listType) {
    var execListCommand = listType === "ol" ? "insertOrderedList" : "insertUnorderedList",
        nodeOffset = listType === "ol" ? 3 : 2;

    document.execCommand(execListCommand);
    sel.anchorNode[textProp] = sel.anchorNode[textProp].substring(nodeOffset);

    return getParentWithTag(sel.anchorNode, listType);
  }

  function triggerTextParse(event) {
    var sel = window.getSelection(),
        textProp,
        subject,
        insertedNode,
        unwrap,
        node,
        parent;

    // FF will return sel.anchorNode to be the parentNode when the triggered keyCode is 13
    if (!sel.isCollapsed || !sel.anchorNode || sel.anchorNode.nodeName === "ARTICLE") {
      return;
    }

    textProp = getTextProp(sel.anchorNode);
    subject = sel.anchorNode[textProp];

    if (subject.match(/^[-*]\s/) && sel.anchorNode.parentNode.nodeName !== "LI") {
      insertedNode = insertListOnSelection(sel, textProp, "ul");
    }

    if (subject.match(/^1\.\s/) && sel.anchorNode.parentNode.nodeName !== "LI") {
      insertedNode = insertListOnSelection(sel, textProp, "ol");
    }

    unwrap = insertedNode &&
            ["ul", "ol"].indexOf(insertedNode.nodeName.toLocaleLowerCase()) >= 0 &&
            ["p", "div"].indexOf(insertedNode.parentNode.nodeName.toLocaleLowerCase()) >= 0 &&
            insertedNode.parentNode.className.indexOf('g-body') === -1


    if (unwrap) {
      node = sel.anchorNode;
      parent = insertedNode.parentNode;
      parent.parentNode.insertBefore(insertedNode, parent);
      parent.parentNode.removeChild(parent);
      moveCursorToBeginningOfSelection(sel, node);
    }
  }

  function moveCursorToBeginningOfSelection(selection, node) {
    range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 0);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function triggerTextStyling(node) {
    var className = node.className,
        sel = window.getSelection(),
        selNode = sel.anchorNode,
        tagClass,
        reTag;

    for (var tag in tagClassMap) {
      tagClass = tagClassMap[tag];
      reTag = new RegExp(tagClass);

      if (reTag.test(className)) {
        switch(tag) {
          case "b":
            if (selNode && !hasParentWithTag(selNode, "h1") && !hasParentWithTag(selNode, "h2")) {
              document.execCommand(tagClass, false);
            }
            return;
          case "i":
            document.execCommand(tagClass, false);
            return;

          case "h1":
          case "h2":
          case "h3":
          case "blockquote":
            toggleFormatBlock(tag);
            return;

          case "a":
            toggleUrlInput();
            optionsNode.className = "g-options url-mode";
            return;
        }
      }
    }

    triggerTextSelection();
  }

  function triggerUrlBlur(event) {
    var url = urlInput.value;

    optionsNode.className = "g-options";
    if(previouslySelectedText){
      window.getSelection().addRange(previouslySelectedText);
    }

    document.execCommand("unlink", false);

    if (url === "") {
      previouslySelectedText = undefined;
      return false;
    }

    if (!url.match("^(http://|https://|mailto:)")) {
      url = "http://" + url;
    }

    document.execCommand("createLink", false, url);

    previouslySelectedText = undefined;
    urlInput.value = "";
  }

  function triggerUrlSet(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      event.stopPropagation();

      urlInput.blur();
    }
  }

  function toggleFormatBlock(tag) {
    if (hasParentWithTag(getFocusNode(), tag)) {
      document.execCommand("formatBlock", false, "p");
      document.execCommand("outdent");
    } else {
      document.execCommand("formatBlock", false, tag);
    }
  }

  function toggleUrlInput() {
    setTimeout(function() {
      var url = getParentHref(getFocusNode());

      if (typeof url !== "undefined") {
        urlInput.value = url;
      } else {
        document.execCommand("createLink", false, "/");
      }

      previouslySelectedText = window.getSelection().getRangeAt(0);

      urlInput.focus();
    }, 150);
  }

  function getParent(node, condition, returnCallback) {
    if (node === null) {
      return;
    }

    while (node.parentNode) {
      if (condition(node)) {
        return returnCallback(node);
      }

      node = node.parentNode;
    }
  }

  function getParentWithTag(node, nodeType) {
    var checkNodeType = function(node) { return node.nodeName.toLowerCase() === nodeType; },
        returnNode = function(node) { return node; };

    return getParent(node, checkNodeType, returnNode);
  }

  function hasParentWithTag(node, nodeType) {
    return !!getParentWithTag(node, nodeType);
  }

  function getParentHref(node) {
    var checkHref = function(node) { return typeof node.href !== "undefined"; },
        returnHref = function(node) { return node.href; };

    return getParent(node, checkHref, returnHref);
  }

  function triggerTextSelection(e) {
    var selectedText = root.getSelection(),
        range,
        clientRectBounds,
        target = (e.target||{}).activeElement || e.target || e.srcElement || document.activeElement;

    if (!previouslySelectedText) {
      // The selected text is not editable
      if (!target.isContentEditable || selectedText.isCollapsed) {
        setTextMenuPosition(EDGE, EDGE);
        textMenu.className = "text-menu hide";
        reloadMenuState();
      } else {
        range = selectedText.getRangeAt(0);
        clientRectBounds = range.getBoundingClientRect();

        // Every time we show the menu, reload the state
        reloadMenuState();
        setTextMenuPosition(
            clientRectBounds.bottom + 55 + +root.pageYOffset,
            (clientRectBounds.left + clientRectBounds.right) / 2
        );
      }
    }
  }

  function setTextMenuPosition(top, left) {
    textMenu.style.top = top + "px";
    textMenu.style.left = (left+25) + "px";

    if (options.animate) {
      if (top === EDGE) {
        textMenu.className = "text-menu hide";
      } else {
        textMenu.className = "text-menu active";
      }
    }
  }

  root.grande = {
    bind: function (bindableNodes, opts) {
      if (bindableNodes) {
        editableNodes = bindableNodes;
      }

      options = opts || options;

      attachToolbarTemplate();
      bindTextSelectionEvents();
      bindTextStylingEvents();
    },
    select: function () {
      triggerTextSelection();
    }
  };

}).call(this);
