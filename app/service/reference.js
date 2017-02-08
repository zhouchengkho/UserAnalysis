/**
 * Created by zhoucheng on 1/29/17.
 */
var moment = require('moment');


function Reference() {



  var currentYear = '2015'; // set current year at 2015 for test
  var lastYear = (Number(currentYear) - 1).toString();
  var currentMonth = moment().month();
  var isInSpringSemester =  moment().isBetween(moment().format(currentYear + '-02-01 00:00:00'), moment().format(currentYear + '-07-31 24:00:00'));

  function getSpringMonths(year) {
    var result = [];
    for(var i = 1; i < 7; i++)
      result.push(getMonth(year, i));
    return result;
  }

  function getFallMonths(year) {
    var result = [];
    for(var i = 7; i < 12; i++)
      result.push(getMonth(year, i));
    result.push(getMonth((Number(year) + 1).toString(), 0));
    return result;
  }

  /**
   *
   * @param year
   * @param term
   */
  function getSemester(year, term) {
    if(term == 'spring') {
      return {
        gte: moment().format(year + '-02-01 00:00:00'),
        lte: moment().format(year + '-07-31 24:00:00')
      }
    }
    else {
      return {
        gte: moment().format(year + '-08-01 00:00:00'),
        lte: moment().format(((Number(year) + 1).toString()) + '-01-31 24:00:00')
      }
    }
  }

  /**
   *
   * @param year
   * @param month
   * @returns {{}}
   */
  function getMonth(year, month) {

    var result = {};
    switch (month) {
      case 0:
        result.gte =  moment().format(year + '-01-01 00:00:00');
        result.lte = moment().format(year + '-01-31 24:00:00');
        break;
      case 1:
        result.gte = moment().format(year + '-02-01 00:00:00');
        result.lte =  year/4 == 0 ? moment().format(year + '-02-29 24:00:00') : moment().format(year + '-02-28 24:00:00');
        break;
      case 2:
        result.gte = moment().format(year + '-03-01 00:00:00');
        result.lte = moment().format(year + '-03-31 24:00:00');
        break;
      case 3:
        result.gte =  moment().format(year + '-04-01 00:00:00');
        result.lte  = moment().format(year + '-04-30 24:00:00');
        break;
      case 4:
        result.gte =  moment().format(year + '-05-01 00:00:00');
        result.lte =  moment().format(year + '-05-31 24:00:00');
        break;
      case 5:
        result.gte = moment().format(year + '-06-01 00:00:00');
        result.lte =  moment().format(year + '-06-30 24:00:00');
        break;
      case 6:
        result.gte = moment().format(year + '-07-01 00:00:00');
        result.lte = moment().format(year + '-07-31 24:00:00');
        break;
      case 7:
        result.gte = moment().format(year + '-08-01 00:00:00');
        result.lte = moment().format(year + '-08-31 24:00:00');
        break;
      case 8:
        result.gte = moment().format(year + '-09-01 00:00:00');
        result.lte = moment().format(year + '-09-30 24:00:00');
        break;
      case 9:
        result.gte = moment().format(year + '-10-01 00:00:00');
        result.lte = moment().format(year + '-10-31 24:00:00');
        break;
      case 10:
        result.gte = moment().format(year + '-11-01 00:00:00');
        result.lte = moment().format(year + '-11-30 24:00:00');
        break;
      case 11:
        result.gte = moment().format(year + '-12-01 00:00:00');
        result.lte = moment().format(year + '-12-31 24:00:00');
        break;
      default:
        break;
    }
    return result;
  }
  function getLastSemester() {
    if(isInSpringSemester)
      return getSemester(lastYear, 'fall')
    else {
      if(currentMonth == 0)
        return getSemester(lastYear, 'spring')
      else
        return getSemester(currentYear, 'spring')
    }
  }

  function getLastSemesterMonths() {
    var lastSemester = getLastSemester();
    var startYear = moment(lastSemester.gte).year().toString();
    if(isInSpringSemester)
      return getFallMonths(startYear)
    else
      return getSpringMonths(startYear)
  }

  function getThisSemester() {
    if(isInSpringSemester)
      return getSemester(currentYear, 'spring')
    else {
      if(currentMonth == 0)
        return getSemester(lastYear, 'fall')
      else
        return getSemester(currentYear, 'fall')
    }
  }

  function getThisSemesterMonths() {
    var thisSemester = getThisSemester();
    var startYear = moment(thisSemester.gte).year().toString();
    if(isInSpringSemester)
      return getSpringMonths(startYear)
    else
      return getFallMonths(startYear)
  }

  function getAcademicYear() {
    return {
      gte: getLastSemester().gte,
      lte: getThisSemester().lte
    }
  }

  function getAcademicYearMonths() {
    return getLastSemesterMonths().concat(getThisSemesterMonths())
  }

  function getCollegeCareer(userId) {
    var enrollYear = '20' + userId.substring(2, 4);
    var gradYear = (Number(enrollYear) + 4).toString();
    enrollYear = moment().format(enrollYear + '-09-01 00:00:00');
    gradYear = moment().format(gradYear + '-06-30 24:00:00');
    return {
      gte: enrollYear,
      lte: gradYear
    }
  }

  function getCollegeCareerSemesters(userId) {
    var collegeCareer = getCollegeCareer(userId);
    var enrollYear = '20' + userId.substring(2, 4);
    var secondYear = (Number(enrollYear) + 1).toString();
    var thirdYear = (Number(enrollYear) + 2).toString();
    var fourthYear = (Number(enrollYear) + 3).toString();
    var fifthYear = (Number(enrollYear) + 4).toString();

    var semesters = [getSemester(enrollYear, 'fall'), getSemester(secondYear, 'spring'),
                    getSemester(secondYear, 'fall'), getSemester(thirdYear, 'spring'),
                    getSemester(thirdYear, 'fall'), getSemester(fourthYear, 'spring'),
                    getSemester(fourthYear, 'fall'), getSemester(fifthYear, 'spring')];
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  this.getPartition = function(data) {
    var timePeriod = data.timePeriod;
    switch (timePeriod) {
      case 'last-semester':
        return getLastSemesterMonths();
        break;
      case 'this-semester':
        return getThisSemesterMonths();
        break;
      case 'academic-year':
        return getAcademicYearMonths();
        break;
      case 'college-career':
        return getCollegeCareerSemesters(data.userId);
        break;
      default:
        return getAcademicYearMonths();
        break;
    }
  }
  /**
   *
   * @param timePeriod 'last-semester' 'this-semester' 'academic-year'
   * @returns {string[]}
   */
  this.getPartitionLabels = function(timePeriod) {
    var spring = ['February', 'March', 'April', 'May', 'June', 'July'];
    var fall = ['August', 'September', 'October', 'November', 'December', 'January'];

    switch (timePeriod) {
      case 'last-semester':
        if(isInSpringSemester)
          return fall;
        else
          return spring;
        break;
      case 'this-semester':
        if(isInSpringSemester)
          return spring;
        else
          return fall;
        break;
      case 'academic-year':
        if(isInSpringSemester)
          return fall.concat(spring);
        else
          return spring.concat(fall);
        break;
      case 'college-career':
        return ['freshman, fall', 'freshman, spring', 'sophomore, fall', 'sophomore, spring',
                'junior, fall', 'junior, spring', 'senior, fall', 'senior, spring']
        break;
      default:
        return [];
        break;
    }
  }


  /**
   *
   * @param data json, attr: timePeriod, userId(optional)
   */
  this.getTimePeriod = function(data) {
    var timePeriod = data.timePeriod;
    switch (timePeriod) {
      case 'last-semester':
        return getLastSemester();
        break;
      case 'this-semester':
        return getThisSemester();
        break;
      case 'academic-year':
        return getAcademicYear();
        break;
      case 'college-career':
        return getCollegeCareer(data.userId);
        break;
      default:
        return getAcademicYear();
        break;
    }
  }



}












module.exports = new Reference();
