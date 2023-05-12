const categoryRouter = require("express").Router();
const { response } = require("../app");
const Category = require("../models/Category");

categoryRouter.get("/api/categories", (request, response) => {
  Category.find({}).then((categories) => {
    response.json(categories);
  });
});

categoryRouter.post("/api/categories", (request, response, next) => {
  const body = request.body;

  if (!request.body.name || !request.body.user || !request.body.color){
    return response
      .status(400)
      .send({ error: "Missing Attribute(s)", status: 400 });
  }

  const category = new Category({
    name: body.name,
    user: body.user,
    color: body.color,
  });

  category
    .save()
    .then((savedCategory) => {
      if (savedCategory) {
        response.status(201).json({
          id: savedCategory.id,
          name: savedCategory.name,
          user: savedCategory.user,
          color: savedCategory.color,
        });
      }
    })
    .catch((error) => next(error));
});

categoryRouter.put("/api/categories/:id", (request, response, next) => {
  const body = request.body;

  if (!request.body.name || !request.body.color){
    return response
      .status(400)
      .send({ error: "Missing Attribute(s)", status: 400 });
  }

  if (!request.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return response
      .status(400)
      .send({ error: "Invalid ID format", status: 400 });
  }

  const newCategory = {
    name: body.name,
    color: body.color,
  };

  Object.keys(newCategory).forEach(
    (k) => newCategory[k] == "" && delete newCategory[k]
  );

  Category.findByIdAndUpdate(request.params.id, newCategory, { new: true })
    .then((updatedCategory) => {
      if (!updatedCategory) {
        return response.status(404).json({ error: "Category not found" }).end();
      }
      response.status(200).json(updatedCategory);
    })
    .catch((error) => {
      next(error);
    });
});

categoryRouter.delete("/api/categories/:id", async (request, res, next) => {
  await Category.findByIdAndRemove(request.params.id);
  res.status(204).end();
});

module.exports = categoryRouter;
