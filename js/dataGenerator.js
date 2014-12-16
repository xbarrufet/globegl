

var DataGenerator ={
 
    generateData:function() {
        var fileArray = new Array( getNumberOfFiles (Math.random()));    
        if(fileArray.length>0) {
          for(t=0;t<fileArray.length;t++) {
            fileArray[t] = generateFile();
          }
        }
        return fileArray;
            
    }
};



function getNumberOfFiles(randomNumber) {
 if(randomNumber<0.5)
     return 0;
 if(randomNumber<0.8)
     return 1;
 if(randomNumber<0.95)
     return 2;
 if(randomNumber<1)
     return 3;
 
}

function generateFile() {
    var rFile = {};
    var capFile = capitals[Math.floor(Math.random()*capitals.length)]; 
    rFile.city =capFile;
    rFile.fileType =   (Math.round(Math.random())); //0 or 1  
    return rFile;
}