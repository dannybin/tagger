var r = require('rethinkdb'),
    assert = require('assert'),
    async = require('async'),
    self = this;

  var now = new Date();
  var dd = now.getDate();
  if(dd<10) {dd = '0'+dd;}
  var mm = now.getMonth()+1;
  if(mm<10) {mm = '0'+mm;}
  var yyyy = now.getFullYear();
  var today = yyyy +'-'+mm+'-'+dd;

  var one_day_ago = new Date();
  one_day_ago.setDate(one_day_ago.getDate()-1);
  var yest_dd = one_day_ago.getDate();
  if(yest_dd<10) {yest_dd = '0'+yest_dd;}
  var yest_mm = one_day_ago.getMonth()+1;
  if(yest_mm<10) {yest_mm = '0'+yest_mm;}
  var yest_yy = one_day_ago.getFullYear();
  var yesterday = yest_yy+'-'+yest_mm+'-'+yest_dd;

  var three_weeks_later = new Date();
  three_weeks_later.setDate(three_weeks_later.getDate() + 21);
  var dl_dd = three_weeks_later.getDate();
  if(dl_dd<10) {dl_dd = '0'+dl_dd;}
  var dl_mm = three_weeks_later.getMonth()+1;
  if(dl_mm<10) {dl_mm = '0'+dl_mm;}
  var dl_yy = three_weeks_later.getFullYear();
  var deadline = dl_yy+'-'+dl_mm+'-'+dl_dd;

  var date = mm+'/'+dd;

exports.index = function(req, res){

  r.db('jurispect').table('email_news').filter(function(article){return article('creation_time').eq(today)}).orderBy(r.desc('creation_time')).run(self.connection, function(err, cursor){
    cursor.toArray(function(err, results) {
      if(err) throw err;
      res.render('news', {entries: results, date: date});
    });
  });
};


exports.insert = function(req, res){
  var title = req.body.title;
  var link = req.body.link;
  var source = req.body.source;
  
  r.db('jurispect').table('email_news').insert({title: title, link: link, source: source, creation_time: today}).
    run(self.connection, function(err, result) {
        if (err) throw err;
        else res.redirect('/news');
    });
}
/*
exports.knowtify = function (req, res){
  var users;
  var output = [];
  r.db('authentication').table('users').run(self.connection, function(err, cursor) {
    if(err) throw err;
    cursor.toArray(function(err, result){
      users = result;


      for(var i=0; i<users.length; i++) {
        var user = users[i];
        var user_deadlines = [];
        var user_updates = [];
        var recommended = [];
        var user_news = [];
        var email_news;
        var follows;
        var docId;
      async.series([
        function(){
          r.db('jurispect').table('actions').filter({origin: user.id}).run(self.connection, function(err, cursor) {
            if(err) throw err;
            cursor.toArray(function(err, result){
              follows = result;
              
              for(var j=0;j<follows.length; j++){
                var follow = follows[j];
                var reg_data;
                var update_reg;
                var link;
                docId = follow.destination;

                r.db('jurispect').table('documents').get(docId).pluck('comments_close_on', 'effective_on', 'dates',
                 'docket_ids', 'publication_date', 'id', 'title', 'agencies').run(self.connection, function(err, result){
                    if(err) throw err;
                    
                    reg_data = result;
                 

                    if(reg_data.comments_close_on && reg_data.comments_close_on >= today && reg_data.comments_close_on <= deadline) {
                      link = 'http://tag.jurispect.com/#/document/' + reg_data.id;
                      var deadline_data = {title : reg_data.title, link: link, agency: reg_data.agencies[0]['name'], type: 'Comments Due Date'};
                      user_deadlines.push(deadline_data);
                    }
                    else if(reg_data.effective_on && reg_data.effective_on >= today && reg_data.effective_on <= deadline) {
                      link = 'http://tag.jurispect.com/#/document/' + reg_data.id;
                      var deadline_data = {title:reg_data.title, link: link, agency: reg_data.agencies[0].name, type:'Effective Date'};
                      user_deadlines.push(deadline_data);
                    }

                    for(var k= 0; k<reg_data.docket_ids.length; k++){
                      var docket_id = reg_data.docket_ids[k];

                      r.db('jurispect').table('documents').getAll(docket_id, {index: 'docket_ids'}).filter(r.row('publication_date').gt(reg_data.publication_date).and(
                        r.row('publication_date').gt(yesterday))).pluck('id','title', 'agencies', 'publication_date').run(self.connection, function(err, cursor){
                        if(err) throw err;
                        cursor.toArray(function(err, data){
                          update_reg = data;

                          for(var l=0;l<update_reg.length;l++){
                            var update = update_reg[l];

                            link = 'http://tag.jurispect.com/#/document/' + update.id;
                            var update_data = {title: update.title, link: link, agency: update.agencies[0]};
                            user_updates.push(update_data);
                          }

                          console.log(user_updates);
                        });
                      });
                    }
                });
              }
            });
          });
        },
        function(){
          for(var m=0; m<user.agencies.length; m++){
            var agency = user.agencies[m];
            var new_agency_data;
            var agency_name;

            r.db('jurispect').table('documents').getAll(agency, {index: 'agency_id'}).filter(
              r.row('publication_date').gt(yesterday)).pluck('id', 'title', 'agency', 'publication_dates').run(self.connection, function(err, cursor){
                if(err) throw err;
                cursor.toArray(function(err, result){
                  new_agency_data = result;

                  r.db('jurispect').table('agencies').get(agency).pluck('name')
                    .run(self.connection, function(err, name) {
                    if(err) throw err;
                    agency_name = name;
                  

                    for(var n = 0; n<new_agency_data.length; n++){
                      var data = new_agnecy_data[n];
                      link = 'http://tag.jurispect.com/#/document/' + data.id;
                      var new_agency_regs = {title: data.title, link: link, agency: agency_name};
                      recommended.push(new_agency_regs);
                    }
                    console.log(recommended);
                  });
                });
            });
          }
        },
        function(){
          r.db('jurispect').table('email_news').filter(r.row('creation_time').eq(today))
            .run(self.connection, function(err, cursor) {
              if(err) throw err;
              cursor.toArray(function(err, news){
                email_news = news;
              

                for(var o=0;o<email_news.length; o++){
                  var article = email_news[o];
                  news_article = {title: article.title, link: article.link, source: article.source};
                  user_news.push(news_article);
                }
                console.log(user_news);
            });
          });
        },
        function(){
          var knowtify_data = {Name: user.first_name, Email: user.email,  data: { Deadlines: user_deadlines, Updates: user_updates, Recomended: recommended, News: user_news}};
     
          console.log(knowtify_data);
          output.push(knowtify_data);
        }

      ]);
        
      }
    });
  });
  console.log(output);

  res.render('news', {result: "success", date: date});

}
*/