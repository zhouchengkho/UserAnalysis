(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['class_detail'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "    <table class=\"table\">\n        <caption>高经验值</caption>\n        <thead>\n        <tr>\n            <th>姓名</th>\n            <th>学号</th>\n            <th>exp</th>\n            <th>查看</th>\n        </tr>\n        </thead>\n        <tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.goodExpers : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "        </tbody>\n    </table>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : {}, alias3=helpers.helperMissing, alias4="function";

  return "            <tr>\n                <td>"
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.User : depth0)) != null ? stack1.userName : stack1), depth0))
    + "</td>\n                <td>"
    + alias1(((helper = (helper = helpers.userId || (depth0 != null ? depth0.userId : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"userId","hash":{},"data":data}) : helper)))
    + "</td>\n                <td>"
    + alias1(((helper = (helper = helpers.exp || (depth0 != null ? depth0.exp : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"exp","hash":{},"data":data}) : helper)))
    + "</td>\n                <td><a href=\"/student/class/"
    + alias1(((helper = (helper = helpers.userId || (depth0 != null ? depth0.userId : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"userId","hash":{},"data":data}) : helper)))
    + "/"
    + alias1(((helper = (helper = helpers.classId || (depth0 != null ? depth0.classId : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"classId","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\"><span class=\"glyphicon glyphicon-eye-open\" aria-hidden=\"true\"></span></a></td>\n            </tr>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"table\">\n    <caption>低经验值</caption>\n    <thead>\n    <tr>\n        <th>姓名</th>\n        <th>学号</th>\n        <th>exp</th>\n        <th>查看</th>\n    </tr>\n    </thead>\n    <tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.badExpers : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </tbody>\n</table>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : {}, alias3=helpers.helperMissing, alias4="function";

  return "        <tr>\n            <td>"
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.User : depth0)) != null ? stack1.userName : stack1), depth0))
    + "</td>\n            <td>"
    + alias1(((helper = (helper = helpers.userId || (depth0 != null ? depth0.userId : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"userId","hash":{},"data":data}) : helper)))
    + "</td>\n            <td>"
    + alias1(((helper = (helper = helpers.exp || (depth0 != null ? depth0.exp : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"exp","hash":{},"data":data}) : helper)))
    + "</td>\n            <td><a href=\"/student/class/"
    + alias1(((helper = (helper = helpers.userId || (depth0 != null ? depth0.userId : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"userId","hash":{},"data":data}) : helper)))
    + "/"
    + alias1(((helper = (helper = helpers.classId || (depth0 != null ? depth0.classId : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"classId","hash":{},"data":data}) : helper)))
    + "\" target=\"_blank\"><span class=\"glyphicon glyphicon-eye-open\" aria-hidden=\"true\"></span></a></td>\n        </tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : {};

  return ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.goodExpers : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.badExpers : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
})();