var card_clicked = function() {
  console.log('card_clicked');
  if ( this.getAttribute('class').indexOf('flipped') >= 0 ) {
    this.setAttribute('class', 'card');
  } else {
    this.setAttribute('class', 'card flipped');
  }
}

var main = function() {
  var cards = document.querySelectorAll('.card');
  for ( var i = 0; i < cards.length; i += 1 ) {
    var card = cards[i];
    card.addEventListener('click', card_clicked);
  }
}

document.addEventListener('DOMContentLoaded', main);