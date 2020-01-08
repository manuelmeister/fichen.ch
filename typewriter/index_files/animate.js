var poem = [
    "Aber in der Schweiz\n","nutzt der Staat seine Macht nicht aus.\u2665?",
];

function animate(typewriter) {
    sequence = [];

    for (var i in $('#input').val().split("\n")) {
        sequence.push({
            text: poem[i] ,
            delayAfter: 1500,
        });
    }

    typewriter.playSequence(sequence);
}
