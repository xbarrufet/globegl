function processChartFile(rFile) {
    addFileToRegion("APAC");
    var continent ="EUROPE";
   
   
    if(rFile.city.ContinentName==("Africa")) continent="EUROPE";
    if(rFile.city.ContinentName==("Europe")) continent="EUROPE";
    if(rFile.city.ContinentName==("North America")) continent="USACAN";
    if(rFile.city.ContinentName==("South America")) continent="LATAM";
    if(rFile.city.ContinentName==("Australia")) continent="APAC";
     if(rFile.city.ContinentName==("Asia")) continent="APAC";
    addFileToRegion(continent);
    
}

function addFileToRegion(chartName) {
    var numCad = $("#" + chartName + "ChartData").text();
    numCad=numCad.replace(".","");
    var num = Number(numCad);
    num++;
    $("#" + chartName + "ChartData").html(num.toLocaleString('es-ES'));
    
}


