var r = require('rethinkdb'),
    assert = require('assert'),
    self = this;

var one_day_ago = new Date();
one_day_ago.setDate(one_day_ago.getDate()-1);
var yest_dd = one_day_ago.getDate();
if(yest_dd<10) {yest_dd = '0'+yest_dd;}
var yest_mm = one_day_ago.getMonth()+1;
if(yest_mm<10) {yest_mm = '0'+yest_mm;}
var yest_yy = one_day_ago.getFullYear();
var yesterday = yest_yy+'-'+yest_mm+'-'+yest_dd;

exports.index = function(req, res){

  r.db('jurispect').table('news').getAll(yesterday, {index: 'creation_time'}).filter(r.row('publish').eq('Not Tagged').not()).run(self.connection, function(err, cursor){
    cursor.toArray(function(err, results) {
      if(err) throw err;
      else res.render('tagged', {entries: results});
    });
  });
};

exports.update = function(req, res){
  var id = req.body.id;
  var publish = req.body.publish;
  var topics = req.body.topics.split(',');
  
  r.db('jurispect').table('news').get(id).update({publish: publish, m_topics: r.row('m_topics').append(topics)}).
    run(self.connection, function(err, result) {
        if (err) throw err;
        else res.redirect('/tagged');
    });
}