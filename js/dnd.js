var dnd;

dnd = {
  $placeholder: $("<hr>", {
    id: "dndPlaceholder"
  }),
  init: function() {
    $("#algorithm-header").droppable({
      accept: ".algorithm-element",
      drop: function(e, ui) {
        var $algorithmElement;
        dnd.$placeholder.detach();
        $algorithmElement = ui.draggable;
        return $algorithm.algorithmEditor("add", $algorithmElement.data("algorithmElementIndex"), "prepend");
      },
      over: function(e, ui) {
        return $(this).after(dnd.$placeholder);
      },
      out: function(e, ui) {
        return dnd.$placeholder.detach();
      }
    });
    return $("#algorithm-footer").droppable({
      accept: ".algorithm-element",
      drop: function(e, ui) {
        var $algorithmElement;
        dnd.$placeholder.detach();
        $algorithmElement = ui.draggable;
        return $algorithm.algorithmEditor("add", $algorithmElement.data("algorithmElementIndex"), "append");
      },
      over: function(e, ui) {
        return $(this).before(dnd.$placeholder);
      },
      out: function(e, ui) {
        return dnd.$placeholder.detach();
      }
    });
  },
  initLi: function($li) {
    return $($li).droppable({
      accept: ".algorithm-element",
      drop: function(e, ui) {
        var $algorithmElement;
        dnd.$placeholder.detach();
        $algorithmElement = ui.draggable;
        return $algorithm.algorithmEditor("add", $algorithmElement.data("algorithmElementIndex"), "insert", $(this));
      },
      over: function(e, ui) {
        return $(this).after(dnd.$placeholder);
      },
      out: function(e, ui) {
        return dnd.$placeholder.detach();
      }
    });
  }
};
