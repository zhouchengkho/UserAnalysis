/**
 * Created by zhoucheng on 4/3/17.
 */


/**
 *
 * Input:
 *  regular time score distribution
 *  final score distribution
 *  overall score distribution
 *
 *  exp distribution
 *
 * Output
 *  r-squared value
 */

var db = require('../app/models/index');
var helper = require('../app/service/helper');


getPrecisionSummary('C180001201601', 'data_structure');
getPrecisionSummary('C180027161703', 'program_basic');

function getPrecisionSummary(classId, tableName) {
  var expQuery = "select * from (select userId, exp, activityExp, socialExp, homeworkExp, @curRank := @curRank + 1 AS rank from (select * from student_class  where classId = '" + classId + "' and userId in (select userId from " + tableName + ") order by exp desc) s, (SELECT @curRank := 0) r) t order by userId desc;"
  var overallScoreQuery = "select * from (select s.*, @curRank := @curRank + 1 AS rank from ((select * from " + tableName + " order by overallScore desc) s, (SELECT @curRank := 0) r)) t order by userId desc;";
  var regularScoreQuery = "select * from (select s.*, @curRank := @curRank + 1 AS rank from ((select * from " + tableName + " order by regularScore desc) s, (SELECT @curRank := 0) r)) t order by userId desc;";
  var finalScoreQuery = "select * from (select s.*, @curRank := @curRank + 1 AS rank from ((select * from " + tableName + " order by finalScore desc) s, (SELECT @curRank := 0) r)) t order by userId desc;";
  db.sequelize.query(expQuery).then(function(result) {
    var expData = JSON.parse(JSON.stringify(result[0]));

    // console.log(expData)
    db.sequelize.query(overallScoreQuery).then(function(result) {
      var scoreData = JSON.parse(JSON.stringify(result[0]));

      // console.log(scoreData)

      var error = getRankError(getDataAttributes(scoreData, 'rank'), getDataAttributes(expData, 'rank'));
      var spearmanCorrelation = getSpearmanRank(getDataAttributes(scoreData, 'rank'), getDataAttributes(expData, 'rank'));
      // console.log('error for ' + tableName + ': '+ error)
      console.log('Spearman correlation for ' + tableName + ': '+ spearmanCorrelation)
    })
  })


}



function getDataAttributes(richData, attr) {
  var data = [];
  for(var i in richData) {
    data.push(richData[i][attr])
  }
  return data;
}
function getRSquared(realData, predictData) {
  if (realData.length != predictData.length)
    return false;
  var SSres = 0,
      SStot = 0,
      SSreg = 0,
      avg = helper.avg(realData);

  for(var i in realData) {
    SSres += (Math.pow((realData[i] - predictData[i]), 2));
    SStot += (Math.pow((realData[i] - avg), 2));
    SSreg += (Math.pow((predictData[i] - avg), 2));
  }

  return SSreg / SStot;

}


function getRankError(realData, predictData) {
  var len = realData.length;
  var error = 0;
  for(var i in realData) {
    error += ((Math.abs(realData[i] - predictData[i])) / len);
  }
  return error / len;
}


function getSpearmanRank(realData, predictData) {
  var len = realData.length;
  var diff2 = 0;
  for(var i in realData) {
    diff2 += Math.pow((realData[i] - predictData[i]), 2)
  }
  return 1 - (6 * diff2 / (len * (Math.pow(len - 1, 2))))
}


function getMaxError(len) {
  var arr = [];
  var reverseArr = [];
  for(var i = 1;i <= len; i++) {
    arr.push(i)
    reverseArr.push(len - i + 1);
  }
  return getRankError(arr, reverseArr)
}

