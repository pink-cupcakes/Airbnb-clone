var mysql = require('mysql');

let connection = mysql.createConnection({
  user: 'root',
  database: 'airbnb_reservations'
});

connection.connect(
  function(err) {
    if (err) { console.log('DATABASE CONNECTION ERROR!', err); }
    console.log('connected as id ' + connection.threadId);
  }
);

var makeReservation = (listId, dateStart, dateEnd) => {
  connection.query(
    // `DROP PROCEDURE IF EXISTS datespopulate;
    // DELIMITER |
    // CREATE PROCEDURE datespopulate (reserveId INT, dateStart DATE, dateEnd DATE)
    // BEGIN
    //   WHILE dateStart <= dateEnd DO
    //     INSERT INTO reservations (listid, dates) VALUES (${listId}, dateStart);
    //     SET dateStart = date_add(dateStart, INTERVAL 1 DAY);
    //   END WHILE;
    // END;
    // |
    // DELIMITER ;
    `CALL datespopulate(${listId}, '${dateStart}', '${dateEnd}');`
  );
};

module.exports.connection = connection;
module.exports.makeReservation = makeReservation;