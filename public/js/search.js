/**
 * Created by zhoucheng on 3/22/17.
 */
$(document).ready(function() {
  $.typeahead({
    input: '.student-search',
    minLength: 1,
    maxItem: 20,
    delay: 200,
    order: "asc",
    source: {
      country: {
        href: function (item) {
          return "/student/overall/" + item.userId
        },
        display: ['userId', 'userName'],
        template: function (query, item) {
          var template = item.userName+" <small style='color:#999;'>" + item.userId + "</small>";

          console.log(query)
          console.log(item)
          return template;
        },
        ajax: {
          url: "/analysis/teacher_search",
          path: "data.student"
        }
      }
    },
    callback: {
      onClickAfter: function (node, a, item, event) {
        event.preventDefault();
        window.open(item.href);
      }
    }
  });
})
