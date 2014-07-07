tab = "    "
animationSpeed = 100
$algorithm = null
$runOutput = null

class Condition
  constructor: (@value) ->
    
  isTrue: ->
    @value is "adevărat"
  inCpp: ->
    if @value is "adevărat" then true
    else false

class Structure
  constructor: (@instructions) ->
    
  run: ->
    instr.run for instr in @instructions
  inCpp: ->
    output = ""
    output += instr.toCpp for instr in @instructions
    output

$.fn.editable = ->
  @addClass("editable").click ->
    editable = $(@)
    editor = $ "<input>",
        type: "text"
        val: do editable.text
        size: editable.text().length
        keypress: (e) ->
          if e.keyCode is 13
            newText = $.trim do $(@).val
            editable.text newText if newText isnt ""
            do editable.show
            do $(@).remove
            return
          currentSize = $(@).val().length
          editorSize = parseInt $(@).attr "size"
          $(@).attr "size", currentSize if currentSize isnt editorSize
    $(@).hide().after editor
    do editor.focus().select

hoverChangeMethods =
  opacity: (normalOpacity, hoveredOpacity, duration) ->
    @hover =>
      @fadeTo duration, hoveredOpacity
    , =>
      @fadeTo duration, normalOpacity
  src: (normalSrc, hoveredSrc) ->
    @hover =>
      @attr "src", hoveredSrc
    , =>
      @attr "src", normalSrc
  class: (hoverClass) ->
    @hover =>
      @addClass hoverClass
    , =>
      @removeClass hoverClass
  toggleChildren: (childrenSelector, speed) ->
    @hover =>
      @children(childrenSelector).fadeIn speed
    , =>
      @children(childrenSelector).fadeOut speed

$.fn.hoverChange = (method, args...) ->
  if hoverChangeMethods[method]
    hoverChangeMethods[method].apply @, args
  else
    $.error "Method #{method} does not exist on jQuery.hoverChange"

algorithmEditorMethods =
  # reset 'adds' in the jQuery data store to 0 and add an introductiry note
  # to the empty algorithm editor
  init: ->
    @data "adds", 0
    @algorithmEditor "reset"
  # add a new algorithm element given its type index 'algorithmElementIndex',
  # where to insert it 'addType', if it is to be inserted after another node,
  # insert it after 'nodeToInsertAfter' and, if specified, make 'firstArgText'
  # the first argument's value
  add: (algorithmElementIndex, addType, nodeToInsertAfter, firstArgText) ->
    algorithmElement = algorithmElements[algorithmElementIndex]
    val = algorithmElement.value
    addArgumentButtonIds = []
    
    # the new algorithm element
    el = $("<li>",
      data: algorithmElementIndex: algorithmElementIndex
      css: display: "none"
    ).hoverChange "toggleChildren", ".instructionTool", animationSpeed

    # replace %c with a condition editor
    val = val.replace /%c/g, "<span class='arg'>#{firstArgText or 'argument'}</span>"
    
    # replace %+ with a variable argument editor list
    val = val.replace /%\+/g, (str, offset) =>
      adds = @data "adds"
      addArgumentButtonIds.push "i#{adds}o#{offset}"
      "<span class='arg'>#{firstArgText or 'argument'}</span> <input 
       type='image' src='img/add.png' class='instructionTool' 
       alt='Adaugă un argument' id='i#{adds}o#{offset}'>"
    
    # replace % with a single argument editor
    val = val.replace /%/g, "<span class='arg'>#{firstArgText or 'argument'}</span>"
    
    # put this html 'val' in the DOM
    do el.html(val).find(".arg").editable

    # initialize drag&drop on this algorithm element
    dnd.initLi el

    $("<input>",
      type: "image"
      class: "instructionTool"
      src: "img/delete.png"
      alt: "Șterge instrucțiunea"
      click: =>
        el.slideUp animationSpeed, =>
          do el.remove
          @algorithmEditor "reset" if @children().length is 0
    ).hoverChange("src", "img/delete.png", "img/delete-hover.png").appendTo el

    switch addType
      when "append" then @append el
      when "prepend" then @prepend el
      when "insert" then $(nodeToInsertAfter).after el

    el.slideDown animationSpeed, ->
      for addArgumentButtonId, i in addArgumentButtonIds
        $("##{addArgumentButtonId}", el).click ->
          newArg = do $("<span>",
            text: "argument"
            class: "arg"
          ).editable
          $(@).before ", ", newArg
          do newArg.click
        .hoverChange "src", "img/add.png", "img/add-hover.png"

    @data "adds", (@data "adds") + 1
    @
  instructions: ->
    values = []
    @children("li").each (i) ->
      args = []
      $(@).children(".editable").each (i) ->
        args.push do $(@).text
      values.push
        algorithmElement: algorithmElements[$(@).data "algorithmElementIndex"]
        "args": args
    values
  variables: ->
    variables = []
    $algorithm.find(".arg").each (i) ->
      arg = $(@)
      if arg.parents("li").first().data("algorithmElementIndex") isnt algorithmElements.length - 1
        argText = do arg.text
        if argText[0] isnt '"' and argText[argText.length - 1] isnt '"'
          variables.push argText
    for ivar, i in variables
      for jvar, j in variables[i + 1 ... variables.length]
        variables.splice j, 1 if ivar is jvar
    variables
  reset: ->
    @algorithmEditor "add", algorithmElements.length - 1, "append",
      null, "Introduceți elemente aici"
  toCpp: ->
    output = "#include <iostream>\nusing namespace std;\n\nint main() {\n"
    variables =  @algorithmEditor "variables"
    instructions = @algorithmEditor "instructions"
    output += "#{tab}var #{variables.join ", "};\n\n" if variables.length
    for instr in instructions
      {algorithmElement, args} = instr
      instr = algorithmElement.toCpp args
      output += "#{tab}#{instr}\n"
    output + "#{tab}\n#{tab}return 0;\n}"
  run: ->
    do $runOutput.empty
    instructions = @algorithmEditor "instructions"
    vars = {}
    runinstr = (instructions) ->
      for instr, i in instructions
        algorithmElement = instr.algorithmElement
        if $.type(algorithmElement.run) is "function"
          args = instr.args
          if algorithmElement.read? and algorithmElement.read is true
            $input = $("<input>", class: "run-input").keypress (event) ->
              if event.keyCode == 13
                val = do $input.val
                algorithmElement.run.call vars, val, args
                do $input.hide
                do $input.before($("<span>",
                  text: val
                ), "<br>").remove
                runinstr instructions[i + 1 ... instructions.length]
            $runOutput.append $input
            do $input.focus
            break
          else
            $runOutput.append algorithmElement.run.call vars, args
    runinstr instructions

$.fn.algorithmEditor = (method, args...) ->
  if algorithmEditorMethods[method]
    algorithmEditorMethods[method].apply @, args
  else if $.type method is 'object' or not method
    algorithmEditorMethods.init.apply @, arguments
  else $.error "Method #{method} does not exist on jQuery.algorithmEditor"

$.widget "ui.panel",
  _create: -> @element.addClass "ui-widget-header ui-corner-all"

$.widget "ui.toolboxInstruction",
  options:
    instructionType: null
  _create: ->
    if $.type @options.instructionType is "number"
      @element
        .addClass("algorithm-element ui-widget ui-state-default ui-corner-all ui-widget-content")
        .hoverChange("class", "ui-state-hover")
        .data("algorithmElementIndex", @options.instructionType)
        .append($ "<span>",
          class: "title"
          text: algorithmElements[@options.instructionType].text
        )
        .draggable
          revert: "invalid"
          helper: "clone"
          cursor: "move"
          opacity: 0.4
          start: (event, ui) -> $(@).addClass "ui-state-active"
          stop: (event, ui) -> $(@).removeClass "ui-state-active"
    else $.error "ui.toolboxInstruction: instructionType not specified"

$ ->
  $algorithm = do $("#algorithm").algorithmEditor
  $runOutput = $ "#runOutput", $bottomPanel
  $topPanel = do $("#topPanel").panel
  $fancyBox = do $("#fancyBox").fancybox
  $compileButton = $("#compileButton").button
    icons: primary: "ui-icon-script"
  $rightPanel = do $("#rightPanel").panel
  $compileOutput = $ "#compileOutput"
  $runButton = do $("#runButton").button
  $bottomPanel = do $("#bottomPanel").panel

  $compileButton.click (e) ->
    $compileOutput = $ "<pre>", id: 'compileOutput'
    $("#compileOutputWrapper").empty().append $compileOutput
    $compileOutput.text $algorithm.algorithmEditor "toCpp"
    $compileOutput.snippet "cpp",
      transparent: true
      style: "ide-msvcpp"
    do $fancyBox.click
  do $("#title").editable
  $("#closeOutputButton")
    .hoverChange("opacity", 0.4, 1, animationSpeed)
    .click -> $bottomPanel.fadeOut animationSpeed
  $runButton.click -> $algorithm.algorithmEditor "run"
  for i in [0 ... algorithmElements.length]
    $("<div>").toolboxInstruction(instructionType: i).appendTo $rightPanel
  do dnd.init
  $("body").fadeIn "slow"