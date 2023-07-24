//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config()

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// ENV FILE
const userId = process.env.USER_ID;
const password = process.env.PASSWORD;


// mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
mongoose.connect(`mongodb+srv://${userId}:${password}@cluster0.uspat3n.mongodb.net/todolistDB`);

const itemsSchema = new mongoose.Schema ({
name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "Hit the + button to aff a new item."
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems).then( function(){
//         console.log("Successfully saved default items to DB.")
//       }).catch(function(err){
//         console.log(err);
//       });


app.get("/", function(req, res) {


   Item.find()
    .then(function (foundItems) {

        if (foundItems.length === 0) {
          Item.insertMany(defaultItems).then( function(){
            console.log("Successfully saved default items to DB.")
          }).catch(function(err){
            console.log(err);
           });
           res.redirect("/");
        } else {
          res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    })
    .catch(function (err) {
        console.log(err);
    });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
      .then(foundList => {
        foundList.items.push(item);
        foundList.save();
        res.redirect(`/${listName}`);
      })
      .catch(err => {
        console.log(err);
      });
  }

 
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
      //  !!!!!!!!!!!!! REMOVE ELEMENT BY ID
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("You delete succeffuly Item");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(foundList => {
      res.redirect(`/${listName}`)
    })
    .catch(err => {console.log(err);});
  };


});

app.get('/:customListName', (req, res) => {
 const customListName = _.capitalize(req.params.customListName);

 List.findOne({name: customListName})
  .then((foundList) => {
    if (!foundList) {
      //Create a new list
       const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect(`/${customListName}`)
    } else {
      //Show an existing list
      res.render("list",{listTitle: foundList.name, newListItems: foundList.items} )
    }
  })
  .catch((err) => {
    console.log(err);
  });



});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
