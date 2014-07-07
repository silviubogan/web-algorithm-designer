var algorithmElements;

algorithmElements = [
  {
    text: "citește",
    value: "citește %",
    toCpp: function(_arg) {
      var arg, output;
      arg = _arg[0];
      output = "cin";
      output += " >> " + arg;
      return output + ";";
    },
    run: function(input, _arg) {
      var arg;
      arg = _arg[0];
      return this[arg] = input;
    },
    read: true
  }, {
    text: "scrie",
    value: "scrie %+",
    toCpp: function(args) {
      var arg, output, _i, _len;
      output = "cout";
      for (_i = 0, _len = args.length; _i < _len; _i++) {
        arg = args[_i];
        output += " << " + arg;
      }
      return output + ";";
    },
    run: function(args) {
      var arg, i, output, _len;
      output = "";
      for (i = 0, _len = args.length; i < _len; i++) {
        arg = args[i];
        if (arg.charAt(0) === '"' && arg.charAt(arg.length - 1) === '"') {
          arg = arg.substring(1, arg.length - 1);
          output += arg;
        } else {
          output += this[arg];
        }
      }
      return output;
    }
  }, {
    text: "dacă .. atunci ..",
    value: "dacă %c atunci %s sfârșit dacă",
    toCpp: function(_arg) {
      var cond, struct;
      cond = _arg[0], struct = _arg[1];
      return "if (" + (cond.inCpp()) + ") {" + (struct.inCpp()()) + "}";
    },
    run: function(_arg) {
      var cond, struct;
      cond = _arg[0], struct = _arg[1];
      if (cond.isTrue()) return struct.run();
    }
  }, {
    text: "cât timp .. execută ..",
    value: "cât timp %c execută %s",
    structure: true
  }, {
    text: "comentariu",
    value: "{ % }",
    toCpp: function(args) {
      return "// " + args[0];
    }
  }
];
