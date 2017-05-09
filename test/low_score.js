/**
 * Created by zhoucheng on 4/14/17.
 */



var db = require('../app/models/index');
var helper = require('../app/service/helper');


getPrecisionSummary('C180001201601', 'data_structure');
// getPrecisionSummary('C180027161703', 'program_basic');

function getPrecisionSummary(classId, tableName) {
  var expQuery = "select * from (select userId, @curRank := @curRank + 1 AS rank from (select * from student_class  where classId = '" + classId + "' and userId in (select userId from " + tableName + ") order by exp desc) s, (SELECT @curRank := 0) r) t order by rank desc;"
  var overallScoreQuery = "select userId, rank from (select s.*, @curRank := @curRank + 1 AS rank from ((select * from " + tableName + " order by overallScore desc) s, (SELECT @curRank := 0) r)) t order by rank desc;";
  // var regularScoreQuery = "select * from (select s.*, @curRank := @curRank + 1 AS rank from ((select * from " + tableName + " order by regularScore desc) s, (SELECT @curRank := 0) r)) t order by userId desc;";
  // var finalScoreQuery = "select * from (select s.*, @curRank := @curRank + 1 AS rank from ((select * from " + tableName + " order by finalScore desc) s, (SELECT @curRank := 0) r)) t order by userId desc;";
  db.sequelize.query(expQuery).then(function(result) {
    var expData = JSON.parse(JSON.stringify(result[0]));
    var expArr = getUserIdArray(expData);
    // console.log(expData)
    db.sequelize.query(overallScoreQuery).then(function(result) {
      var scoreData = JSON.parse(JSON.stringify(result[0]));
      var scoreArr = getUserIdArray(scoreData);
      // console.log(scoreData)
      compareArray(scoreArr, expArr);

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


function getUserIdArray(data) {
  var result = [];
  for(var i = 0; i < 15; i++) {
    result.push(data[i].userId)
  }
  console.log(result.length);
  return result;
}

function compareArray(arr1, arr2) {
  var len = arr1.length;
  var hit = 0;
  for(var i in arr1) {
    for(var j in arr2) {
      if(arr2[j] == arr1[i]) {
        hit++;
      }
    }
  }
  console.log('hit rate: '+hit/len);
}
