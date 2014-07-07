dnd =
    $placeholder: $("<hr>", id: "dndPlaceholder")
    init: ->
        $("#algorithm-header").droppable
            accept: ".algorithm-element"
            drop: (e, ui) ->
                do dnd.$placeholder.detach
                $algorithmElement = ui.draggable
                $algorithm.algorithmEditor "add",
                    $algorithmElement.data("algorithmElementIndex"), "prepend"
            over: (e, ui) -> $(this).after dnd.$placeholder
            out: (e, ui) -> do dnd.$placeholder.detach
        $("#algorithm-footer").droppable
            accept: ".algorithm-element"
            drop: (e, ui) ->
                do dnd.$placeholder.detach
                $algorithmElement = ui.draggable
                $algorithm.algorithmEditor "add",
                    $algorithmElement.data("algorithmElementIndex"), "append"
            over: (e, ui) -> $(this).before dnd.$placeholder
            out: (e, ui) -> do dnd.$placeholder.detach
    initLi: ($li) ->
        # see http://jsfiddle.net/fhamidi/fKde3/
        $($li).droppable
            accept: ".algorithm-element"
            drop: (e, ui) ->
                do dnd.$placeholder.detach
                $algorithmElement = ui.draggable
                $algorithm.algorithmEditor "add",
                    $algorithmElement.data("algorithmElementIndex"),
                    "insert", $(this)
            over: (e, ui) -> $(this).after dnd.$placeholder
            out: (e, ui) -> do dnd.$placeholder.detach
