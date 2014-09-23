
var r = require('rethinkdb'),
    assert = require('assert'),
    self = this;

var now = new Date();
var dd = now.getDate();
if(dd<10) {dd = '0'+dd;}
var mm = now.getMonth()+1;
if(mm<10) {mm = '0'+mm;}
var yyyy = now.getFullYear();
var today = yyyy +'-'+mm+'-'+dd;

exports.index = function(req, res){

  r.db('jurispect').table('news').getAll(today, {index: 'creation_time'}).filter(r.row('publish').eq('Not Tagged')).limit(200).run(self.connection, function(err, cursor){
    cursor.toArray(function(err, results) {
      if(err) throw err;
      else res.render('index', {entries: results});
    });
  });
};


exports.update = function(req, res){
  var id = req.body.id;
  var publish = req.body.publish;
  var industry = req.body.industry;
  var topics = req.body.topics.split(",");
  
  r.db('jurispect').table('news').get(id).update({publish: publish, industry: industry, m_topics: topics}).
    run(self.connection, function(err, result) {
        if (err) throw err;
        else res.redirect('/');
    });
}