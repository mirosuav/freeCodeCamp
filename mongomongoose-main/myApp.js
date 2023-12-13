require('dotenv').config();
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: Number,
  favoriteFoods: [String]
});

let Person = mongoose.model('Person', personSchema);


const createAndSavePerson = (done) => {
  let data = new Person({
    name: 'Mirek',
    age: 40,
    favoriteFoods: ['Pizza', 'Pasta', 'Lasagne']
  });
  data.save(done);
};

const createManyPeople = async (arrayOfPeople, done) => {
  try {
    let docs = await Person.create(arrayOfPeople);
    docs.forEach(async doc => {
      await doc.save();
    });
    done(null, docs)
  }
  catch (err) {
    done(err);
  }
};

const findPeopleByName = async (personName, done) => {
  try {
    var data = await Person.find({ name: personName }).exec();
    done(null, data);
  }
  catch (err) {
    done(err);
  }
};

const findOneByFood = async (food, done) => {
  try {
    var data = await Person.findOne({ favoriteFoods: food }).exec();
    done(null, data);
  }
  catch (err) {
    done(err);
  }
};

const findPersonById = async (personId, done) => {
  try {
    var data = await Person.findById(personId).exec();
    done(null, data);
  }
  catch (err) {
    done(err);
  }
};

const findEditThenSave = async (personId, done) => {
  const foodToAdd = "hamburger";
  try {
    var data = await Person.findById(personId).exec();
    data.favoriteFoods.push(foodToAdd);
    await data.save();
    done(null, data);
  }
  catch (err) {
    done(err);
  }
};

const findAndUpdate = async (personName, done) => {
  const ageToSet = 20;
  try {
    var data = await Person.findOne({name : personName}).exec();
    data.age = ageToSet;
    await data.save();
    done(null, data);
  }
  catch (err) {
    done(err);
  }
};

const removeById = async (personId, done) => {
  try {
    var data = await Person.findByIdAndRemove(personId).exec();
    done(null, data);
  }
  catch (err) {
    done(err);
  }
};

const removeManyPeople = async (done) => {
  const nameToRemove = "Mary";
  try {
    let result = await Person.remove({name: nameToRemove}).exec();
    done(null, result);
  }
  catch (err) {
    done(err);
  }
};

const queryChain = async (done) => {
  const foodToSearch = "burrito";
  try {
    let result = await Person
      .find({ favoriteFoods: foodToSearch })
      .sort('name')
      .limit(2)
      .select('-age')
      .exec();
    done(null, result);
  }
  catch (err) {
    done(err);
  }
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
