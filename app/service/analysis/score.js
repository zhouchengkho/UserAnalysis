/**
 * Created by zhoucheng on 3/8/17.
 */

function deepCopy(obj) {
  var out = [],i = 0,len = obj.length;
  for (; i < len; i++) {
    if (obj[i] instanceof Array){
      out[i] = deepCopy(obj[i]);
    }
    else out[i] = obj[i];
  }
  return out;
}

function max(arr) {
  var max = arr[0];
  for(var i in arr) {
    if(arr[i] > max)
      max = arr[i]
  }
  return max;
}

function min(arr) {
  var min = arr[0];
  for(var i in arr) {
    if(arr[i] < min)
      min = arr[i]
  }
  return min;
}

function column(datasets, j) {
  var column = [];
  for(var i in datasets) {
    column.push(datasets[i][j])
  }
  return column;
}

function sum(arr) {
  var sum = 0;
  for(var i in arr)
    sum+=arr[i]
  return sum;
}

function avg(arr) {
  var sum = 0;
  for(var i in arr)
    sum+=arr[i]
  return sum/arr.length;
}

function getStandardDeviation(datasets) {
  var standardDeviation = [];
  for(var j in datasets[0]) {
    var sum = 0;
    var average = avg(column(datasets, j));
    for(var i in datasets) {
      sum += ((datasets[i][j] - average) * (datasets[i][j] - average))
    }

    sum = Math.sqrt(sum / (datasets.length - 1))
    standardDeviation.push(sum)
  }
  return standardDeviation
}

function zScorestandardize(datasets) {
  var scaled = deepCopy(datasets);
  var standardDeviation = getStandardDeviation(datasets);
  for(var i in datasets) {
    for(var j in datasets[i]) {
      scaled[i][j] = (datasets[i][j] - avg(column(datasets, j))) / standardDeviation[j]
    }
  }
  return scaled;
}


/**
 * scaled to 0-1
 * @param datasets
 */
function minMaxStandardize(datasets) {
  var scaled = deepCopy(datasets);
  for(var i in datasets) {
    for(var j in datasets[i]) {
      if((max(column(datasets, j)))  === min(column(datasets, j)))
        scaled[i][j] = 0;
      else
        scaled[i][j] = (datasets[i][j] - min(column(datasets, j))) / ((max(column(datasets, j))) - min(column(datasets, j)))
    }
  }
  return scaled;
}


function Entropy() {

 function getIndex(userIds, userId){
    for(var i in userIds) {
      if(userId === userIds[i])
        return i
    }
  }

  function splitDatasetsAndUserIds(data) {
    var datasets = [];
    var userIds = [];
    for(var i in data) {
      datasets.push(data[i].data);
      userIds.push(data[i].userId);
    }
    return {
      datasets: datasets,
      userIds: userIds
    }
  }

  function transitionOfOne(datasets) {
    for(var i in datasets) {
      for(var j in datasets[i]) {
        datasets[i][j] += 1;
      }
    }
    return datasets
  }

  function transition(datasets) {
    var transitioned = deepCopy(datasets);
    for(var j in datasets[0]) {
      var columnJ = column(transitioned, j);
      if(sum(columnJ) === 0) {
        transitioned = transitionOfOne(transitioned);
      }
    }
    return transitioned;
  }

  this.scale = function(datasets) {
    var scaled = deepCopy(datasets);
    for(var i in datasets) {
      for(var j in datasets[i]) {
        var columnJ = column(datasets, j);
        if (max(columnJ) == min(columnJ) ) {
          scaled[i][j] = 0;
        } else {
          if(datasets[i][j] >= 0) {
            scaled[i][j] = (datasets[i][j] - min(columnJ)) / (max(columnJ) -  min(columnJ))
          } else {
            scaled[i][j] = (max(columnJ) - datasets[i][j]) / (max(columnJ) - min(columnJ))
          }
        }

      }
    }
    return scaled;
  }

  function getWeightedMeasure(scaled) {
    var weighted = deepCopy(scaled);
    for(var i in scaled) {
      for(var j in scaled[i]) {
        weighted[i][j] = sum(column(scaled, j)) == 0 ? 0 : scaled[i][j] / sum(column(scaled, j))
      }
    }
    return weighted;
  }

  function getInfoEntropy(weighted) {
    var entropy = [];
    var k = 1 / Math.log(weighted.length)
    for(var j in weighted[0]) {
      var temp = 0;
      for(var i in weighted) {
        temp += weighted[i][j] == 0 ? 0 : -k * weighted[i][j] * Math.log(weighted[i][j])
      }
      entropy.push(temp)
    }
    return entropy;
  }

  function getEntropyRedundancy(entropy) {
    var redundancy = [];
    for(var i in entropy)
      redundancy.push(1-entropy[i])
    return redundancy;
  }

  this.getWeights  = function(datasets) {
    var transitioned = transition(datasets);
    var scaled = transitioned;
    // var scaled = this.scale(transitioned);
    var weighted = getWeightedMeasure(scaled);
    var entropy = getInfoEntropy(weighted);

    var redundancy = getEntropyRedundancy(entropy);
    // var redundancy = entropy;
    console.log('redundancy: '+redundancy)
    var weights = [];
    if(sum(redundancy) === 0) {
      for(var i in redundancy) {
        weights.push(1/redundancy.length)
      }
    }
    else {
      for(var i in redundancy) {
        var weight = redundancy[i] / sum(redundancy);
        weights.push(weight);
      }
    }


    console.log('weights: '+weights)
    return weights;
  }

  /**
   *
   * @param datasets
   * [
   * [5, 1.4, 6, 3, 5, 7],
   * [9, 2, 30, 7, 5, 9],
   * [8, 1.8, 11, 5, 7, 5],
   * [12, 2.5, 18, 7, 5, 5]
   * ]
   * @returns {Array}
   * [ 1.0272226069300192, 5.32290665674021, 5.298627985099701, 3.5214514374594414 ]
   *
   */
  this.getScores = function(datasets) {
    var weights = this.getWeights(datasets);
    var scaled = minMaxStandardize(datasets);
    var scores = [];
    for(var i in scaled) {
      var score = 0;
      for(var j in weights) {
        score += weights[j] * scaled[i][j]
      }
      scores.push(score * 10)
    }
    return scores;
  }



  /**
   *
   * @param data
   * [
   *  {
   *    "userId": "10132510237",
   *    "data": [5, 1.4, 6, 3, 5, 7]
   *  },
   *  {
   *    "userId": "10132510238",
   *    "data": [9, 2, 30, 7, 5, 9]
   *  }
   * ]
   * @param userId
   * @returns
   *
   * [
   *  {
   *    "userId": "10132510237",
   *    "score": 1.0272226069300192
   *  },
   *  {
   *    "userId": "10132510238",
   *    "score": 5.32290665674021
   *  }
   * ]
   */
  this.getScoreOf = function(data, userId) {
    var split = splitDatasetsAndUserIds(data);
    var datasets = split.datasets;
    var userIds = split.userIds;
    var scores = this.getScores(datasets)
    return scores[getIndex(userIds, userId)]
  }
}

function PCA() {

}


var Score = {
  entropy: new Entropy(),
  pca: new PCA()
}


module.exports = Score;
