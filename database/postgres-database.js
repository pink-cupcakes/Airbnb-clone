const Sequelize = require('sequelize');
const sequelize = new Sequelize('airbnb_reservations', 'andy', 'herroworld', {
  host: 'localhost',
  protocol: 'postgres',
  logging: false,
  dialect: 'postgres'
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Reservations = sequelize.define('reservations', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  listid: {
    type: Sequelize.INTEGER
  },
  dates: {
    type: Sequelize.DATE
  }
}, { timestamps: false });

Reservations.sync({force: false});

const insertReservation = (listid, startDate, endDate) => {
  console.log(`The listid is: ${listid}, the start is ${startDate} the end is ${endDate}`);
  if (startDate <= endDate) {
    return Reservations
      .create({
        listid: listid,
        dates: startDate
      })
      .then(() => {
        startDate.setDate(startDate.getDate() + 1);
        insertReservation(listid, startDate, endDate);
      })
      .catch((err) => {
        console.log('insert reservation error:');
        console.log(err);
      });
  }
};

const createReservation = (listid, startDate, endDate, rounds = 1) => {
  if (startDate > endDate) {
    return true;
  }
  return Reservations
    .findOne({
      where: {
        listid: listid,
        dates: startDate
      }
    })
    .then((conflict) => {
      console.log(`It starts ${startDate} and ends ${endDate} for listid ${listid}`);
      // console.log(conflict);
      var test = true;
      startDate.setDate(startDate.getDate() + 1);
      // rounds += 1;
      if (conflict === null) {
        return createReservation(listid, startDate, endDate, rounds);
      }
      return false;
    });
};

module.exports.connection = sequelize;
module.exports.insertReservation = insertReservation;
module.exports.createReservation = createReservation;