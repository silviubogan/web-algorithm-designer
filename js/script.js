var $algorithm, $runOutput, Condition, Structure, algorithmEditorMethods, animationSpeed, hoverChangeMethods, tab;
var __slice = Array.prototype.slice;

tab = "    ";

animationSpeed = 100;

$algorithm = null;

$runOutput = null;

Condition = (function() {

  function Condition(value) {
    this.value = value;
  }

  Condition.prototype.isTrue = function() {
    return this.value === "adevărat";
  };

  Condition.prototype.inCpp = function() {
    if (this.value === "adevărat") {
      return true;
    } else {
      return false;
    }
  };

  return Condition;

})();

Structure = (function() {

  function Structure(instructions) {
    this.instructions = instructions;
  }

  Structure.prototype.run = function() {
    var instr, _i, _len, _ref, _results;
    _ref = this.instructions;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instr = _ref[_i];
      _results.push(instr.run);
    }
    return _results;
  };

  Structure.prototype.inCpp = function() {
    var instr, output, _i, _len, _ref;
    output = "";
    _ref = this.instructions;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      instr = _ref[_i];
      output += instr.toCpp;
    }
    return output;
  };

  return Structure;

})();

$.fn.editable = function() {
  return this.addClass("editable").click(function() {
    var editable, editor;
    editable = $(this);
    editor = $("<input>", {
      type: "text",
      val: editable.text(),
      size: editable.text().length,
      keypress: function(e) {
        var currentSize, editorSize, newText;
        if (e.keyCode === 13) {
          newText = $.trim($(this).val());
          if (newText !== "") editable.text(newText);
          editable.show();
          $(this).remove();
          return;
        }
        currentSize = $(this).val().length;
        editorSize = parseInt($(this).attr("size"));
        if (currentSize !== editorSize) return $(this).attr("size", currentSize);
      }
    });
    $(this).hide().after(editor);
    return editor.focus().select();
  });
};

hoverChangeMethods = {
  opacity: function(normalOpacity, hoveredOpacity, duration) {
    var _this = this;
    return this.hover(function() {
      return _this.fadeTo(duration, hoveredOpacity);
    }, function() {
      return _this.fadeTo(duration, normalOpacity);
    });
  },
  src: function(normalSrc, hoveredSrc) {
    var _this = this;
    return this.hover(function() {
      return _this.attr("src", hoveredSrc);
    }, function() {
      return _this.attr("src", normalSrc);
    });
  },
  "class": function(hoverClass) {
    var _this = this;
    return this.hover(function() {
      return _this.addClass(hoverClass);
    }, function() {
      return _this.removeClass(hoverClass);
    });
  },
  toggleChildren: function(childrenSelector, speed) {
    var _this = this;
    return this.hover(function() {
      return _this.children(childrenSelector).fadeIn(speed);
    }, function() {
      return _this.children(childrenSelector).fadeOut(speed);
    });
  }
};

$.fn.hoverChange = function() {
  var args, method;
  method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (hoverChangeMethods[method]) {
    return hoverChangeMethods[method].apply(this, args);
  } else {
    return $.error("Method " + method + " does not exist on jQuery.hoverChange");
  }
};

algorithmEditorMethods = {
  init: function() {
    this.data("adds", 0);
    return this.algorithmEditor("reset");
  },
  add: function(algorithmElementIndex, addType, nodeToInsertAfter, firstArgText) {
    var addArgumentButtonIds, algorithmElement, el, val;
    var _this = this;
    algorithmElement = algorithmElements[algorithmElementIndex];
    val = algorithmElement.value;
    addArgumentButtonIds = [];
    el = $("<li>", {
      data: {
        algorithmElementIndex: algorithmElementIndex,
        css: {
          display: "none"
        }
      }
    }).hoverChange("toggleChildren", ".instructionTool", animationSpeed);
    val = val.replace(/%\+/g, function(str, offset) {
      var adds;
      adds = _this.data("adds");
      addArgumentButtonIds.push("i" + adds + "o" + offset);
      return "<span class='arg'>" + (firstArgText || 'argument') + "</span> <input        type='image' src='img/add.png' class='instructionTool'        alt='Adaugă un argument' id='i" + adds + "o" + offset + "'>";
    });
    val = val.replace(/%c/g, "<span class='arg'>" + (firstArgText || 'argument') + "</span>");
    val = val.replace(/%/g, "<span class='arg'>" + (firstArgText || 'argument') + "</span>");
    el.html(val).find(".arg").editable();
    dnd.initLi(el);
    $("<input>", {
      type: "image",
      "class": "instructionTool",
      src: "img/delete.png",
      alt: "Șterge instrucțiunea",
      click: function() {
        return el.slideUp(animationSpeed, function() {
          el.remove();
          if (_this.children().length === 0) return _this.algorithmEditor("reset");
        });
      }
    }).hoverChange("src", "img/delete.png", "img/delete-hover.png").appendTo(el);
    switch (addType) {
      case "append":
        this.append(el);
        break;
      case "prepend":
        this.prepend(el);
        break;
      case "insert":
        $(nodeToInsertAfter).after(el);
    }
    el.slideDown(animationSpeed, function() {
      var addArgumentButtonId, i, _len, _results;
      _results = [];
      for (i = 0, _len = addArgumentButtonIds.length; i < _len; i++) {
        addArgumentButtonId = addArgumentButtonIds[i];
        _results.push($("#" + addArgumentButtonId, el).click(function() {
          var newArg;
          newArg = $("<span>", {
            text: "argument",
            "class": "arg"
          }).editable();
          $(this).before(", ", newArg);
          return newArg.click();
        }).hoverChange("src", "img/add.png", "img/add-hover.png"));
      }
      return _results;
    });
    this.data("adds", (this.data("adds")) + 1);
    return this;
  },
  instructions: function() {
    var values;
    values = [];
    this.children("li").each(function(i) {
      var args;
      args = [];
      $(this).children(".editable").each(function(i) {
        return args.push($(this).text());
      });
      return values.push({
        algorithmElement: algorithmElements[$(this).data("algorithmElementIndex")],
        "args": args
      });
    });
    return values;
  },
  variables: function() {
    var i, ivar, j, jvar, variables, _len, _len2, _ref;
    variables = [];
    $algorithm.find(".arg").each(function(i) {
      var arg, argText;
      arg = $(this);
      if (arg.parents("li").first().data("algorithmElementIndex") !== algorithmElements.length - 1) {
        argText = arg.text();
        if (argText[0] !== '"' && argText[argText.length - 1] !== '"') {
          return variables.push(argText);
        }
      }
    });
    for (i = 0, _len = variables.length; i < _len; i++) {
      ivar = variables[i];
      _ref = variables.slice(i + 1, variables.length);
      for (j = 0, _len2 = _ref.length; j < _len2; j++) {
        jvar = _ref[j];
        if (ivar === jvar) variables.splice(j, 1);
      }
    }
    return variables;
  },
  reset: function() {
    return this.algorithmEditor("add", algorithmElements.length - 1, "append", null, "Introduceți elemente aici");
  },
  toCpp: function() {
    var algorithmElement, args, instr, instructions, output, variables, _i, _len;
    output = "#include <iostream>\nusing namespace std;\n\nint main() {\n";
    variables = this.algorithmEditor("variables");
    instructions = this.algorithmEditor("instructions");
    if (variables.length) {
      output += "" + tab + "var " + (variables.join(", ")) + ";\n\n";
    }
    for (_i = 0, _len = instructions.length; _i < _len; _i++) {
      instr = instructions[_i];
      algorithmElement = instr.algorithmElement, args = instr.args;
      instr = algorithmElement.toCpp(args);
      output += "" + tab + instr + "\n";
    }
    return output + ("" + tab + "\n" + tab + "return 0;\n}");
  },
  run: function() {
    var instructions, runinstr, vars;
    $runOutput.empty();
    instructions = this.algorithmEditor("instructions");
    vars = {};
    runinstr = function(instructions) {
      var $input, algorithmElement, args, i, instr, _len, _results;
      _results = [];
      for (i = 0, _len = instructions.length; i < _len; i++) {
        instr = instructions[i];
        algorithmElement = instr.algorithmElement;
        if ($.type(algorithmElement.run) === "function") {
          args = instr.args;
          if ((algorithmElement.read != null) && algorithmElement.read === true) {
            $input = $("<input>", {
              "class": "run-input"
            }).keypress(function(event) {
              var val;
              if (event.keyCode === 13) {
                val = $input.val();
                algorithmElement.run.call(vars, val, args);
                $input.hide();
                $input.before($("<span>", {
                  text: val
                }), "<br>").remove();
                return runinstr(instructions.slice(i + 1, instructions.length));
              }
            });
            $runOutput.append($input);
            $input.focus();
            break;
          } else {
            _results.push($runOutput.append(algorithmElement.run.call(vars, args)));
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    return runinstr(instructions);
  }
};

$.fn.algorithmEditor = function() {
  var args, method;
  method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  if (algorithmEditorMethods[method]) {
    return algorithmEditorMethods[method].apply(this, args);
  } else if ($.type(method === 'object' || !method)) {
    return algorithmEditorMethods.init.apply(this, arguments);
  } else {
    return $.error("Method " + method + " does not exist on jQuery.algorithmEditor");
  }
};

$.widget("ui.panel", {
  _create: function() {
    return this.element.addClass("ui-widget-header ui-corner-all");
  }
});

$.widget("ui.toolboxInstruction", {
  options: {
    instructionType: null
  },
  _create: function() {
    if ($.type(this.options.instructionType === "number")) {
      return this.element.addClass("algorithm-element ui-widget ui-state-default ui-corner-all ui-widget-content").hoverChange("class", "ui-state-hover").data("algorithmElementIndex", this.options.instructionType).append($("<span>", {
        "class": "title",
        text: algorithmElements[this.options.instructionType].text
      })).draggable({
        revert: "invalid",
        helper: "clone",
        cursor: "move",
        opacity: 0.4,
        start: function(event, ui) {
          return $(this).addClass("ui-state-active");
        },
        stop: function(event, ui) {
          return $(this).removeClass("ui-state-active");
        }
      });
    } else {
      return $.error("ui.toolboxInstruction: instructionType not specified");
    }
  }
});

$(function() {
  var $bottomPanel, $compileButton, $compileOutput, $fancyBox, $rightPanel, $runButton, $topPanel, i, _ref;
  $algorithm = $("#algorithm").algorithmEditor();
  $runOutput = $("#runOutput", $bottomPanel);
  $topPanel = $("#topPanel").panel();
  $fancyBox = $("#fancyBox").fancybox();
  $compileButton = $("#compileButton").button({
    icons: {
      primary: "ui-icon-script"
    }
  });
  $rightPanel = $("#rightPanel").panel();
  $compileOutput = $("#compileOutput");
  $runButton = $("#runButton").button();
  $bottomPanel = $("#bottomPanel").panel();
  $compileButton.click(function(e) {
    $compileOutput = $("<pre>", {
      id: 'compileOutput'
    });
    $("#compileOutputWrapper").empty().append($compileOutput);
    $compileOutput.text($algorithm.algorithmEditor("toCpp"));
    $compileOutput.snippet("cpp", {
      transparent: true,
      style: "ide-msvcpp"
    });
    return $fancyBox.click();
  });
  $("#title").editable();
  $("#closeOutputButton").hoverChange("opacity", 0.4, 1, animationSpeed).click(function() {
    return $bottomPanel.fadeOut(animationSpeed);
  });
  $runButton.click(function() {
    return $algorithm.algorithmEditor("run");
  });
  for (i = 0, _ref = algorithmElements.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
    $("<div>").toolboxInstruction({
      instructionType: i
    }).appendTo($rightPanel);
  }
  dnd.init();
  return $("body").fadeIn("slow");
});
