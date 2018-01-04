var fs = require ('fs');
var csvWriter = require('csv-write-stream');
var writer = csvWriter();

let randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

writer.pipe(fs.createWriteStream('dummy.csv'));
for (var id = 1; id < 10000001; id ++) {
  if (id % 10000 === 0) {
    console.log(id);
  }
  writer.write({ listid: Math.floor(Math.random() * 5000) + 5000, dates: randomDate(new Date(2005, 1, 1), new Date(2016, 12, 31)).toDateString() });
}
writer.end();

// let generator = (id) => {
//   let listid = Math.floor(Math.random() * 5000) + 5000;
//   let dates = randomDate(new Date(2005, 1, 1), new Date(2016, 12, 31));
//   return {
//     id: id,
//     listid: listid,
//     dates: dates
//   };
// };

// let stream = fs.createWriteStream("./dummyReservations.csv", {'flags': 'a', 'encoding': null, 'mode': 0666});

// stream.once('open', (fd) => {
//   for (var i = 0; i < 100000; i++) {
//     stream.write(JSON.stringify(generator(i)));
//     if (i % 100000 === 0) {
//       console.log(i);
//     }
//   }
//   // Important to close the stream when you're ready
//   stream.end();
//   console.log('done');
// });