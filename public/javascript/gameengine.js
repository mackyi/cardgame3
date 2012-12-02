/**
 * @author Mack Yi
 */

var deck = {
		cards: makeDeck(52,true)
}


function makeDeck(size, shouldshuffle){
		var cards = new Array(size);
		for(var i=0; i<size; i++)
		{
			cards[i]=i;
		}
		console.log(cards);
		if(shouldshuffle)
		{
			shuffle(cards);
		}
		
		return cards;
}

function shuffle(cardArray){
	for(var i=0; i<cardArray.length;i++)
	{
		var randomPosition=selectFrom(i,cardArray.length-1);
		console.log(randomPosition);
		var temp = cardArray[i];
		cardArray[i]=cardArray[randomPosition];
		cardArray[randomPosition]=temp;
	}
	console.log(cardArray);
	return cardArray;
}

function selectFrom(lowerValue, upperValue) {
	var choices = upperValue - lowerValue + 1;
	return Math.floor(Math.random() * choices + lowerValue);
}

function orderCards(cardArray, mechanism)
{
	if(arguments.length==1)
	{
		mechanism="InOrder";
	}
	
	switch (mechanism){
	case "InOrder":
		cardArray.sort(compareInOrder);
		break;
	case "ByValue":
		cardArray.sort(compareByValue);
		break;
	}
	
}
function compareInOrder(value1, value2) {
	if (value1 < value2) {
		return -1;
		} else if (value1 > value2) {
		return 1;
		} else {
		return 0;
		}
}

function compareByValue(value1, value2) {
	if (value1%13 < value2%13) {
		return -1;
		} else if (value1%13 > value2%13) {
		return 1;
		} else {
		return 0;
		}
}

function deal(deck, hand, number){
	for(var i=0; i<number; i++)
	{
		hand.push(deck.cards.pop(1));
	}
}

deck.cards.sort(compareInOrder);
console.log(deck.cards);
deck.cards.sort(compareByValue);
console.log(deck.cards);


