var MONGO_DB = process.env.MONGO_DB || 'mongodb://localhost/test';
var mongoose = require('mongoose');
var db = mongoose.createConnection(MONGO_DB);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
  var kittySchema = new mongoose.Schema({
    name: String
   	})
  kittySchema.methods.speak = function () {
	  var greeting = this.name
	    ? "Meow name is " + this.name
	    : "I don't have a name"
	  console.log(greeting);
	}
  var Kitten = db.model('Kitten', kittySchema)

  var silence = new Kitten({ name: 'Silence' })
  console.log(silence.name) // 'Silence'
  var fluffy = new Kitten({ name: 'fluffy' });
  fluffy.speak() // "Meow name is fluffy"
  fluffy.save(function (err, fluffy) {
	  if (err)
	   // TODO handle the error
	  fluffy.speak();
  });
  Kitten.find(function (err, kittens) {
	  if (err){} // TODO handle err
	  console.log(kittens)
  })
  Kitten.remove()
  //Kitten.find({ name: /^Fluff/ }, callback)
});