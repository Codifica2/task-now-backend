describe("#get", function () {
  it("should return an array with task objects");
});

describe("#post", function () {
  it("should create a new task object in the db");
  it("should respond with status 201 created if ok");
  it("should respond with status 401 if the user is not logged in");
});

describe("#getOne", function () {
  it("should return just one task object");
  it("should respond with status 404 if the task doesn't exist");
});
