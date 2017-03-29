/**
 * Created by zhoucheng on 3/11/17.
 */
function Helper() {
  /**
   *
   * @param data
   *
   * [
   *  {
   *    userId: '31',
   *    count: 5
   *  },{
   *    userId: '33',
   *    count: 5
   *  },{
   *    userId: '34',
   *    count: 5
   *  },{
   *    userId: '35',
   *    count: 5
   *  },{
   *    userId: '36',
   *    count: 5
   *  },{
   *    userId: '37',
   *    count: 5
   *  }
   * ]
   * @param userIds
   * ['30', '31', '32', '33', '34', '35', '36', '37', '38']
   *
   * @returns
   * [
   *  { userId: '30', count: 0 },
   *  { userId: '31', count: 5 },
   *  { userId: '32', count: 0 },
   *  { userId: '33', count: 5 },
   *  { userId: '34', count: 5 },
   *  { userId: '35', count: 5 },
   *  { userId: '36', count: 5 },
   *  { userId: '37', count: 5 },
   *  { userId: '38', count: 0 }
   * ]
   *
   */
  this.fillZeroCountStudents = function(data, userIds) {
    for(var i in userIds) {
      if(!data[i] || data[i].userId != userIds[i]) {
        data.splice(i, 0, {userId: userIds[i], count: 0});
      }
    }
    return data;
  }

  /**
   *
   * @param data
   * [
   *  [
   *    {
   *      "userId": "10132510237",
   *      "count": 1
   *    },
   *    {
   *      "userId": "10132510238",
   *      "count": 2
   *    }
   *  ],
   *  [
   *    {
   *      "userId": "10132510237",
   *      "count": 3
   *    },
   *    {
   *      "userId": "10132510238",
   *      "count": 4
   *    }
   *  ]
   *
   * ]
   * @returns
   * [
   *  {
   *    "userId": "10132510237",
   *    "data": [1, 3]
   *  },
   *  {
   *    "userId": "10132510238",
   *    "data": [2, 4]
   *  }
   * ]
   */
  this.organizeData = function(data) {
    var result = [];
    for(var j in data[0]) {
      result.push({userId: data[0][j].userId, data: []})
      for(var i in data) {

        result[j].data.push(data[i][j].count)
      }
    }
    return result;
  }

  this.fillVoid = function(id, columns, ids, data, fills) {
    if(typeof  columns === 'string') {
      var arr = [];
      arr.push(columns)
      columns = arr;
    }
    if(typeof fills === 'string') {
      var arr = [];
      arr.push(fills)
      fills = arr;
    }
    for(var i in ids) {
      if(!data[i] || data[i][id] != ids[i]) {
        var temp = {};
        temp[id] = ids[i];
        for(var j in columns) {
          temp[columns[j]] = fills[j]
        }
        data.splice(i, 0, temp);
      }
    }
    return data;
  }

  this.avg = function(arr) {
    var sum = 0;
    for(var i in arr)
      sum+=arr[i]
    return sum/arr.length;
  }


  this.sum = function(arr) {
    var sum = 0;
    for(var i in arr)
      sum += arr[i]
    return sum;
  }

  /**
   *
   * @param arr
   * @param key [optional]
   * @returns {number}
   */
  this.getStandardDeviation = function(arr, key) {
    if(arr.length == 0 || arr == null)
      return 0;
    var data = [];
    if(key) {
      for(var i in arr)
        data.push(arr[i][key])
    } else {
      data = arr;
    }
    var avg = this.avg(data);
    var sum = 0;
    for(var i in data) {
      sum += (data[i] - avg) * (data[i] - avg)
    }
    return Math.sqrt(sum / data.length)
  }


}

module.exports = new Helper();
