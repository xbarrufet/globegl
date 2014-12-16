var numLines = 20;
var currentLine=0;
var consoleFullText ="";
var captionLength=0;
var consola = $(".console");
var newLine ="";

function cursorAnimation() {
    $('#cursor').animate({
        opacity: 0
    }, 'fast', 'swing').animate({
        opacity: 1
    }, 'fast', 'swing');
}



function writeLogLine(textLine) {
    if((currentLine+1) > numLines)
    {
        cleanConsola();
      
    }
    consola.html(consoleFullText);
    consola.append("<br/>").append(textLine);
    consoleFullText=consola.html();
    consola.append("<br/>").append(generatePrompt());
    
    currentLine++;
}





function cleanConsola() 
{
   consoleFullText="";
    consola.html(generatePrompt());
      currentLine=0;
}
        
function generatePrompt() {
    return '<span>$</span><span id="cursor">_</span>';
}

