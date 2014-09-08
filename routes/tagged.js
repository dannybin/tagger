var r = require('rethinkdb'),
    assert = require('assert'),
    self = this;


exports.index = function(req, res){

  r.db('jurispect').table('news').filter(function(tag){return tag.hasFields('publish')}).orderBy(r.desc('creation_time')).run(self.connection, function(err, cursor){
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