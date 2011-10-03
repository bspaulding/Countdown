var flip = function() {
  var card = document.querySelectorAll('.card')[0];
  if ( card.getAttribute('class').indexOf('flipped') >= 0 ) {
    card.setAttribute('class', 'card');
  } else {
    card.setAttribute('class', 'card flipped');
  }
}

var main = function() {
  var card_flippers = document.querySelectorAll('.card_flipper');
  for ( var i = 0; i < card_flippers.length; i += 1 ) {
    card_flippers[i].addEventListener('click', flip); 
  }
}

document.addEventListener('DOMContentLoaded', main);