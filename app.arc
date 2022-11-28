@app
trivia-b723

@http
/*
  method any
  src server

@static

@tables
trivia
  pk *String
  sk **String

@tables-indexes
trivia
  name GS1
  gs1pk *String
  gs1sk **String