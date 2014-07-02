
var r = require('rethinkdb'),
    assert = require('assert'),
    self = this;


exports.index = function(req, res){

  r.table('interps').filter(function(tag){return tag.hasFields('tagged').not()}).orderBy(r.desc('creation_time')).limit(1).run(self.connection, function(err, cursor){
    cursor.toArray(function(err, results) {
      if(err) throw err;
      else res.render('interps', {entries: results});
    });
  });
};


exports.update = function(req, res){
  var id = req.body.id;
  var topics = req.body.topics.split(",");
  
  r.table('interps').get(id).update({tagged: true, topic: topics}).run(self.connection, function(err, result) {
        if (err) throw err;
        else res.redirect('/interps');
    });
}