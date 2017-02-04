/**
 * Created by zhoucheng on 2/4/17.
 */
function Query() {
  /**
   * Traverse val to fill where clause
   * main purpose is to remove null key
   * @param val JSON
   */
  this.genWhereQuery = function(val) {
    var result = {where: {}};
    for(var key in val) {
      if(val[key])
        result.where[key] = val[key]
    }
    return result;
  }
}

module.exports = new Query();
