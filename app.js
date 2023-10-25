import express from 'express';
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import _ from 'lodash'
 
const app = express();
 
app.set('view engine', 'ejs');
 
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
 
// connecting with the database
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://admin-angela:Test123@cluster0.arpapiw.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
}
 
const itemsSchema = new mongoose.Schema({
  name: String
});
 
const Item = mongoose.model("Item", itemsSchema);
 
const item1 = new Item({
  name: "Welcome to your todolist"
});
 
const item2 = new Item({
  name: "Click + to add a new task!"
});
 
const item3 = new Item({
  name: "Tick the box once the task is completed!"
});
 
const defaultItems = [item1, item2, item3];
 
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});
 
const List = mongoose.model("List", listSchema);
 
app.get("/", async function (req, res) {
 
  const foundItems = await Item.find({});
 
  if (!(await Item.exists())) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }
});
 
app.get("/:customListName", function (req, res) {
 
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (foundList === null) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
 
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch((err) => {
      console.error(err);
    });
 
});
 
app.post("/", function (req, res) {
 
  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item = new Item({
    name: itemName
  });
 
  if (listName === "Today") {
    item.save();
    res.redirect("/");
    console.log(req.body)
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error(err);
      });
  }
});
 
app.post("/delete", function (req, res) {
 
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
 
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Succesfully deleted checked item from the database");
        res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
      .then(() => {
          res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
 
app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});
 
app.get("/about", function (req, res) {
  res.render("about");
});
 
app.listen(3000, function () {
  console.log("Server started on port 3000");
});