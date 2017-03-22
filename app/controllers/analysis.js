/**
 * Created by zhoucheng on 1/24/17.
 */
var express = require('express'),
  router = express.Router(),
  activity = require('../service/analysis/activity'),
  social = require('../service/analysis/social'),
  homework = require('../service/analysis/homework'),
  refer = require('../service/reference'),
  dorm = require('../service/analysis/dorm'),
  teacher = require('../service/teacher'),
  db = require('../models/index'),
  exp = require('../service/exp'),
  graph = require('../service/graph'),
  query = require('../service/query'),
  student = require('../service/student'),
  counsellor = require('../service/counsellor');


module.exports = function (app) {
  app.use('/analysis', router);
};



router.get('/dorm-bar-chart-data/:studentId', function(req, res) {
  graph.getBarChartDataForDorm(req.params.studentId, function(err, result) {
    console.log(JSON.stringify(result))
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/dorm-bar-chart-data', function(req, res) {
  graph.getBarChartDataForDorm(req.session.login.userId, function(err, result) {
    console.log(JSON.stringify(result))
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/class-dorm-bar-chart-data/:studentId/:classId', function(req, res) {
  graph.getClassBarChartDataForDorm(req.params.classId, req.params.studentId, function(err, result) {
    console.log(JSON.stringify(result))
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})


router.get('/activity-line-chart-data', function(req, res) {
  graph.getActivityLineChartData(req.session.login.userId, 'college-career', function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/activity-line-chart-data/:studentId', function(req, res) {
  graph.getActivityLineChartData(req.params.studentId, 'college-career', function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/social-radar-chart-data', function(req, res) {
  graph.getSocialRadarChartData(req.session.login.userId, 'college-career', function(err, result) {
    console.log(res.result)
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/social-radar-chart-data/:studentId/', function(req, res) {
  graph.getSocialRadarChartData(req.params.studentId, req.session.login.settings.timePeriod, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/student-class-line-chart-data/:studentId/:classId', function(req, res) {
  graph.getClassStudentLineChartData(req.params.classId, req.params.studentId, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/homework-data', function(req, res) {
  homework.getHomeWorkData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})

router.get('/homework-html-data', function(req, res) {
  homework.getHtmlData(req.session.login.userId, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else {
      res.render('partials/student_homework', {
        data: result,
        layout: false
      })
    }
  })
})

router.get('/homework-html-data/:studentId', function(req, res) {
  homework.getHtmlData(req.params.studentId, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else {
      res.render('partials/student_homework', {
        data: result,
        layout: false
      })
    }
  })
})

router.get('/student-class-homework/:studentId/:classId', function(req, res) {
  homework.getClassStudentHomeworkData(req.params.classId, req.params.studentId, function(err, result) {
    console.log(result)
    if(err)
      res.json({status: 400, message: err.message})
    else {
        // result.layout = false;
        res.render('partials/class_student_homework', {
          data: result,
          layout: false
        })
    }
  })
})

router.get('/student-class-social-graph/:studentId/:classId', function(req, res) {
  graph.getClassStudentSocialGraph(req.params.classId, req.params.studentId, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json({status: 200, data: result})
  })
})
router.get('/activity-html-data', function(req, res) {
  activity.getHtmlData(req.session.login.userId, req.session.login.settings.timePeriod, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else
      res.json(result)
  })
})



router.get('/test', function(req, res) {
  teacher.getData(req.session.login.userId, function(err, result) {
    if(err)
      console.log(err)
    res.json(result)
  })
});

router.get('/fill-all', function(req, res) {
  exp.fillAllExp(function(err, result) {
    res.json({message: 'success'})
  })
})

router.get('/get-class-detail/:id', function(req, res) {
  exp.getClassPolariziedExpers(req.params.id, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else {
        res.render('partials/class_detail', {
          layout: false,
          data: result
        })
    }
  })
})

router.get('/get-class-exp-distribution/:classId', function(req, res) {
  graph.getClassExpDistribution(req.params.classId, function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else {
      res.json({
        status: 200,
        data: result
      })
    }
  })
})

router.get('/get-diagnose/:studentId/:classId', function(req, res) {
  exp.getClassStudentExp(req.params.classId, req.params.studentId, function(err, result) {
    res.json({exp: result.exp})
  })
})


router.get('/teacher_search', function(req, res) {
  // var data = {"status":true,"error":null,"data":{"country":["AfghanisTan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burma","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo, Democratic Republic","Congo, Republic of the","Costa Rica","Cote d'Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Greenland","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Mongolia","Morocco","Monaco","Mozambique","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Samoa","San Marino","Sao Tome","Saudi Arabia","Senegal","Serbia and Montenegro","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"],"capital":["Abu Dhabi","Abuja","Accra","Adamstown","Addis Ababa","Algiers","Alofi","Amman","Amsterdam","Andorra la Vella","Ankara","Antananarivo","Apia","Ashgabat","Asmara","Astana","Asunci\u00f3n","Athens","Avarua","Baghdad","Baku","Bamako","Bandar Seri Begawan","Bangkok","Bangui","Banjul","Basseterre","Beijing","Beirut","Belgrade","Belmopan","Berlin","Bern","Bishkek","Bissau","Bogot\u00e1","Bras\u00edlia","Bratislava","Brazzaville","Bridgetown","Brussels","Bucharest","Budapest","Buenos Aires","Bujumbura","Cairo","Canberra","Caracas","Castries","Cayenne","Charlotte Amalie","Chisinau","Cockburn Town","Conakry","Copenhagen","Dakar","Damascus","Dhaka","Dili","Djibouti","Dodoma","Doha","Douglas","Dublin","Dushanbe","Edinburgh of the Seven Seas","El Aai\u00fan","Episkopi Cantonment","Flying Fish Cove","Freetown","Funafuti","Gaborone","George Town","Georgetown","Georgetown","Gibraltar","King Edward Point","Guatemala City","Gustavia","Hag\u00e5t\u00f1a","Hamilton","Hanga Roa","Hanoi","Harare","Hargeisa","Havana","Helsinki","Honiara","Islamabad","Jakarta","Jamestown","Jerusalem","Juba","Kabul","Kampala","Kathmandu","Khartoum","Kiev","Kigali","Kingston","Kingston","Kingstown","Kinshasa","Kuala Lumpur","Kuwait City","Libreville","Lilongwe","Lima","Lisbon","Ljubljana","Lom\u00e9","London","Luanda","Lusaka","Luxembourg","Madrid","Majuro","Malabo","Mal\u00e9","Managua","Manama","Manila","Maputo","Marigot","Maseru","Mata-Utu","Mbabane Lobamba","Melekeok Ngerulmud","Mexico City","Minsk","Mogadishu","Monaco","Monrovia","Montevideo","Moroni","Moscow","Muscat","Nairobi","Nassau","Naypyidaw","N'Djamena","New Delhi","Niamey","Nicosia","Nicosia","Nouakchott","Noum\u00e9a","Nuku\u02bbalofa","Nuuk","Oranjestad","Oslo","Ottawa","Ouagadougou","Pago Pago","Palikir","Panama City","Papeete","Paramaribo","Paris","Philipsburg","Phnom Penh","Plymouth Brades Estate","Podgorica Cetinje","Port Louis","Port Moresby","Port Vila","Port-au-Prince","Port of Spain","Porto-Novo Cotonou","Prague","Praia","Cape Town","Pristina","Pyongyang","Quito","Rabat","Reykjav\u00edk","Riga","Riyadh","Road Town","Rome","Roseau","Saipan","San Jos\u00e9","San Juan","San Marino","San Salvador","Sana'a","Santiago","Santo Domingo","S\u00e3o Tom\u00e9","Sarajevo","Seoul","Singapore","Skopje","Sofia","Sri Jayawardenepura Kotte","St. George's","St. Helier","St. John's","St. Peter Port","St. Pierre","Stanley","Stepanakert","Stockholm","Sucre","Sukhumi","Suva","Taipei","Tallinn","Tarawa Atoll","Tashkent","Tbilisi","Tegucigalpa","Tehran","Thimphu","Tirana","Tiraspol","Tokyo","T\u00f3rshavn","Tripoli","Tskhinvali","Tunis","Ulan Bator","Vaduz","Valletta","The Valley","Vatican City","Victoria","Vienna","Vientiane","Vilnius","Warsaw","Washington, D.C.","Wellington","West Island","Willemstad","Windhoek","Yamoussoukro","Yaound\u00e9","Yaren","Yerevan","Zagreb"]}};
  query.getStudents(function(err, result) {
    if(err)
      res.json({status: 400, message: err.message})
    else {
      var data = {"status":true,"error":null,"data": {
        student: result
      }}
      res.json(data)

    }
  })
  // var data = {"status":true,"error":null,"data": {
  //   student: [
  //     {
  //       userId: '10152510238',
  //       userName: '匡申升'
  //     },
  //     {
  //       userId: '10152510142',
  //       userName: '胡楠'
  //     }
  //   ]
  // }}
  //
  // res.json(data)
})
