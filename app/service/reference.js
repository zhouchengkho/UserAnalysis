/**
 * Created by zhoucheng on 1/29/17.
 */
var moment = require('moment');
var db = require('../models/index');
var query = require('./query');
function Reference() {



  var currentYear = '2015'; // set current year at 2015 for test
  var lastYear = (Number(currentYear) - 1).toString();
  var theYearBeforeLast = (Number(currentYear) - 2).toString();
  var currentMonth = moment().month();
  // var isInSpringSemester =  moment().isBetween(moment().format(currentYear + '-02-01 00:00:00'), moment().format(currentYear + '-07-31 24:00:00'));
  var isInSpringSemester = currentMonth >=1 && currentMonth <= 6
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
        gte: year + '-02-01 00:00:00',
        lte: year + '-07-31 24:00:00'
      }
    }
    else {
      return {
        gte: year + '-08-01 00:00:00',
        lte: ((Number(year) + 1).toString() + '-01-31 24:00:00')
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
    console.log('enroll: ' + enrollYear)
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

    return semesters;
  }

  function getTermStr(year, term) {
    if(term == 'fall')
      return year + '-' + (Number(year) + 1).toString() + '学年第一学期'
    else
      return year + '-' + (Number(year) + 1).toString() + '学年第二学期'

  }

  /**
   *
   * @param timePeriod
   * @param userId
   * @returns {*}
   */
  this.getPartition = function(timePeriod, userId) {
    var timePeriod = timePeriod;
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
        return getCollegeCareerSemesters(userId);
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
   * @param timePeriod
   * @param userId
   * @returns {*}
   */
  this.getTimePeriod = function(timePeriod, userId) {
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
        return getCollegeCareer(userId);
        break;
      default:
        return getAcademicYear();
        break;
    }
  }

  /**
   *
   * @param timePeriod
   * @param userId [optional]
   */
  this.getTermStrs = function(timePeriod, userId) {
    var result = [];
    var year = '';

    switch (timePeriod) {
      case 'last-semester':
        if (isInSpringSemester)
          year = lastYear;
        else {
          if(currentMonth == 0)
            year = theYearBeforeLast;
          else
            year = lastYear
        }
        result.push(getTermStr(year, isInSpringSemester ? 'fall' : 'spring'))
        break;
      case 'this-semester':
        if (isInSpringSemester)
          year = lastYear;
        else {
          if(currentMonth == 0)
            year = lastYear;
          else
            year = currentYear
        }
        result.push(getTermStr(year, isInSpringSemester ? 'spring' : 'fall'))
        break;
      case 'academic-year':
        if (isInSpringSemester)
          year = lastYear;
        else {
          if(currentMonth == 0)
            year = lastYear;
          else
            year = currentYear
        }
        result.push(getTermStr(year, 'fall'))
        result.push(getTermStr(year, 'spring'))
        break;
      case 'college-career':
        year = '20' + userId.substring(2, 4);
        for(var i = 0; i < 4; i++) {
          result.push(getTermStr(year, 'fall'))
          result.push(getTermStr(year, 'spring'))
          year = (Number(year) + 1).toString()
        }
        break;
      default:
        break;
    }
    return result;
  }



  this.getCollegeTerms = function(userId, callback) {
    var enrollYear = '20' + userId.substring(2, 4);

    var terms = [];
    terms.push(getTermStr(enrollYear, 'fall'));
    terms.push(getTermStr(enrollYear, 'spring'));
    terms.push(getTermStr((Number(enrollYear) + 1).toString(), 'fall'));
    terms.push(getTermStr((Number(enrollYear) + 1).toString(), 'spring'));
    terms.push(getTermStr((Number(enrollYear) + 2).toString(), 'fall'));
    terms.push(getTermStr((Number(enrollYear) + 2).toString(), 'spring'));
    terms.push(getTermStr((Number(enrollYear) + 3).toString(), 'fall'));
    terms.push(getTermStr((Number(enrollYear) + 3).toString(), 'spring'));

    db.Term.findAll({where: {termName: {$in: terms}}}).then(function(result) {
      callback(null, result)
    }).catch(function(err) { callback(err) })


  }

  this.getAcademicYearTerms = function(callback) {
    var terms = [];
    if(isInSpringSemester) {
      terms.push(getTermStr(lastYear, 'fall'))
      terms.push(getTermStr(lastYear, 'spring'))
    }
    else if (!isInSpringSemester && currentMonth == 0) {
      terms.push(getTermStr(theYearBeforeLast, 'spring'))
      terms.push(getTermStr(lastYear, 'fall'))
    }
    else {
      terms.push(getTermStr(lastYear, 'spring'))
      terms.push(getTermStr(currentYear, 'fall'))
    }
    db.Term.findAll({where: {termName: {$in: terms}}}).then(function(result) {
      callback(null, result)
    }).catch(function(err) { callback(err) })
  }

  this.getCurrentTerm = function(callback) {
    var term = '';
    if(isInSpringSemester)
      term = getTermStr(lastYear, 'spring')
    else if (!isInSpringSemester && currentMonth == 0)
      term = getTermStr(lastYear, 'fall')
    else
      term = getTermStr(currentYear, 'fall')
    db.Term.findAll({where: {termName: term}}).then(function(result) {
      callback(null, result)
    }).catch(function(err) { callback(err) })
  }

  function getTermButton(termId, termName) {
    return '<button type="button" class="btn btn-default col-sm-6 setting-terms" id="' + termId + '">' + termName + '</button>';
  }
  this.getTerms = function(userId, timePeriod, callback) {
    // var data = [];
    // var terms = [];
    var terms = this.getTermStrs(timePeriod, userId);

    db.Term.findAll({where: {termName: {$in: terms}}}).then(function(result) {
      callback(null, result)
    }).catch(function(err) {callback(err)} )
  }

  this.getTimeForClass = function(classId, callback) {
    query.getClassTermName(classId, function(err, term) {
      var startYear = term.substring(0, 4)
      var termNumber = term.substring(12, 13);

      var time;
      if(termNumber === '一')
        time = getSemester(startYear, 'fall')
      else
        time = getSemester((Number(startYear) + 1).toString(), 'spring')
      callback(null, time)
    })
  }

  this.getTimeInterval = function(startTime, endTime) {
    var startMoment = moment(startTime);
    var endMoment = moment(endTime);
    return endMoment.diff(startMoment, 'hours')
  }
}












module.exports = new Reference();
