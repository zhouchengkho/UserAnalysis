/**
 * Created by zhoucheng on 1/29/17.
 */
var moment = require('moment');

var currentYear = '2015'; // set current year at 2015 for test
var nextYear = '2016';
var reference = {
  month: {
    January: {
      gte: moment().format(nextYear + '-01-01 00:00:00'),
      lte: moment().format(nextYear + '-01-31 24:00:00')
    },
    February: {
      gte: moment().format(currentYear + '-02-01 00:00:00'),
      lte: moment().isLeapYear ? moment().format(currentYear + '-02-29 24:00:00') : moment().format(currentYear + '-02-28 24:00:00')
    },
    March: {
      gte: moment().format(currentYear + '-03-01 00:00:00'),
      lte: moment().format(currentYear + '-03-31 24:00:00')
    },
    April: {
      gte: moment().format(currentYear + '-04-01 00:00:00'),
      lte: moment().format(currentYear + '-04-30 24:00:00')
    },
    May: {
      gte: moment().format(currentYear + '-05-01 00:00:00'),
      lte: moment().format(currentYear + '-05-31 24:00:00')
    },
    June: {
      gte: moment().format(currentYear + '-06-01 00:00:00'),
      lte: moment().format(currentYear + '-06-30 24:00:00')
    },
    July: {
      gte: moment().format(currentYear + '-07-01 00:00:00'),
      lte: moment().format(currentYear + '-07-31 24:00:00')
    },
    August: {
      gte: moment().format(currentYear + '-08-01 00:00:00'),
      lte: moment().format(currentYear + '-08-31 24:00:00')
    },
    September: {
      gte: moment().format(currentYear + '-09-01 00:00:00'),
      lte: moment().format(currentYear + '-09-30 24:00:00')
    },
    October: {
      gte: moment().format(currentYear + '-10-01 00:00:00'),
      lte: moment().format(currentYear + '-10-31 24:00:00')
    },
    November: {
      gte: moment().format(currentYear + '-11-01 00:00:00'),
      lte: moment().format(currentYear + '-11-30 24:00:00')
    },
    December: {
      gte: moment().format(currentYear + '-12-01 00:00:00'),
      lte: moment().format(currentYear + '-12-31 24:00:00')
    }

  },
  springSemester: {
    gte: moment().format(currentYear + '-02-01 00:00:00'),
    lte: moment().format(currentYear + '-07-31 24:00:00')
  },
  fallSemester: {
    gte: moment().format(currentYear + '-08-01 00:00:00'),
    lte: moment().format(nextYear + '-01-31 24:00:00')
  },
  isInSpringSemester: moment().isBetween(moment().format(currentYear + '-02-01 00:00:00'), moment().format(currentYear + '-07-31 24:00:00'))
};


module.exports = reference;
