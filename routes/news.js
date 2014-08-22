var r = require('rethinkdb'),
    assert = require('assert'),
    self = this;

  var now = new Date();
  var dd = now.getDate();
  var mm = now.getMonth()+1;
  var yyyy = now.getFullYear();
  var today = yyyy +'-'+mm+'-'+dd;
  var date = mm+'/'+dd;

exports.index = function(req, res){

  r.table('email_news').filter(function(article){return article('creation_time').eq(today)}).orderBy(r.desc('creation_time')).run(self.connection, function(err, cursor){
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
  
  r.table('email_news').insert({title: title, link: link, source: source, creation_time: today}).
    run(self.connection, function(err, result) {
        if (err) throw err;
        else res.redirect('/news');
    });
}