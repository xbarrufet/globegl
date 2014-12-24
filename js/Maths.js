

function latLongToVector3(lat, lon, radius, heigth) {
        var phi = (lat)*Math.PI/180;
        var theta = (lon-180)*Math.PI/180;
 
        var x = -(radius+heigth) * Math.cos(phi) * Math.cos(theta);
        var y = (radius+heigth) * Math.sin(phi);
        var z = (radius+heigth) * Math.cos(phi) * Math.sin(theta);
       
        return new THREE.Vector3(x,y,z);
}

function Vector3PToLatLong(v1) {
        
        var distance = v1.distanceTo(new THREE.Vector3(0,0,0));
        var rlat = Math.asin(v1.y/distance)*180/Math.PI;
        var rlong=Math.acos(v1.x/(distance*Math.cos(rlat*Math.PI/180 )))*180/Math.PI*-1;
        return new THREE.Vector2(rlat,rlong);
}




function generateFlighCoordinates(v1,v2,steps) {
    console.log("....... generating flyng points steps2" + steps);
    var points = new Queue();
    var incx = (v2.x-v1.x)/steps;
    var incy = (v2.y-v1.y)/steps;
    var incz=(v2.z-v1.z)/steps;
    for(t=0;t<steps;t++)
    {    
        var auxv = new THREE.Vector3(v1.x+incx*t, v1.y+incy*t,v1.z+incz*t);  
        points.enqueue(auxv);
    }
    return points;
}


