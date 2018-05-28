/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var field = document.getElementById('numeric_field');


t.render(function(){
  return Promise.all([
    t.get('card', 'shared', key)
  ])
  .spread(function(data){
    if (data) field.value = data
    else field.value = 0;
    
  })
  .then(function(){
    t.sizeTo('#content')
    .done();
  })
});

document.getElementById('save').addEventListener('click', function(){
  return t.set('card', 'shared', key, field.value)
  .then(function(){
      t.closePopup();
    }, function(err){
      console.log('rejected')
      alert(err.message)
    }
  )
})
