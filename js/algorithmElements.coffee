algorithmElements = [
  {
    text: "citește"
    value: "citește %"
    toCpp: ([arg]) ->
      output = "cin"
      output += " >> #{arg}"
      output + ";"
    run: (input, [arg]) -> @[arg] = input
    read: true
  }
  {
    text: "scrie"
    value: "scrie %+"
    toCpp: (args) ->
      output = "cout"
      output += " << " + arg for arg in args
      output + ";"
    run: (args) ->
      output = ""
      for arg, i in args
        if arg.charAt(0) is '"' and arg.charAt(arg.length - 1) is '"'
          arg = arg.substring 1, arg.length - 1
          output += arg
        else output += @[arg]
      output
  }
  {
    text: "dacă .. atunci .."
    value: "dacă %c atunci %s sfârșit dacă"
    toCpp: ([cond, struct]) ->
      "if (#{cond.inCpp()}) {#{do struct.inCpp()}}"
    run: ([cond, struct]) ->
      struct.run() if cond.isTrue()
  }
  {
    text: "cât timp .. execută .."
    value: "cât timp %c execută %s"
    structure: true
  }
  {
    text: "comentariu"
    value: "{ % }"
    toCpp: (args) -> "// #{args[0]}"
  }
]