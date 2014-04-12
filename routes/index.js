
var r = require('rethinkdb'),
    assert = require('assert'),
    self = this;


exports.index = function(req, res){

  r.table('news').filter(function(tag){return tag.hasFields('publish').not()}).orderBy(r.desc('creation_time')).limit(100).run(self.connection, function(err, cursor){
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
  
  r.table('news').get(id).update({publish: publish, industry: industry, m_topics: topics}).
    run(self.connection, function(err, result) {
        if (err) throw err;
        else res.redirect('/');
    });
}