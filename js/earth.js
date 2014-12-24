// Created by Bjorn Sandvik - thematicmapping.org

var cuaFiles,cuaLightsON,cuaLightsUP,cuaLightsDOWN;
var webglEl,scene,camara,renderer;
var sphere,clouds,sun;
var mobileDevice=0;
var entities;
var distanceInitial=15, radiusEntity=0.1,radius
var domEvents;
var flightRoute;

$(document).ready(function() {
         cuaFiles = new Queue();
         cuaLightsOFF = new Queue();
         cuaLightsUP = new Queue();
         cuaLightsDOWN = new Queue();
        flightRoute=new Queue();
    
    
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
           mobileDevice=1;
        }

         webglEl = document.getElementById('webgl');
    
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage(webglEl);
            //return;
        }

        var width  = window.innerWidth,
            height = window.innerHeight;

        // Earth params
        radius=5;
        var segments = 32,
            rotation = 6;  

         scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        camera.position.z = distanceInitial;

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        sphere = createSphere(radius, segments);
        //sphere.rotation.y = rotation; 
        scene.add(sphere)
        sphere.position= new THREE.Vector3( 0, 0, 0 );
        scene.add(new THREE.AmbientLight(0x222222));

        sun = new THREE.DirectionalLight(0xffffff, 1);
        sphere.add(sun);


        var lightFiles = Array(10);
        for(t =0;t<lightFiles.length;t++) {
            var lf=new THREE.PointLight(0xffffff, 5);
            sphere.add(lf);
            cuaLightsOFF.enqueue(lf);
        }
      
        if(!mobileDevice) {
            clouds = createClouds(radius, segments);
            clouds.rotation.y = rotation;
            scene.add(clouds)
        }

        var stars = createStars(90, 64);
        scene.add(stars);
    

        domEvents   = new THREEx.DomEvents(camera, renderer.domElement)
        entities=generateEntityDots(sphere);
    

        controls = new THREE.TrackballControls(camera);
    
    
        webglEl.appendChild(renderer.domElement);

        render();
    
        setInterval(function () {generateFiles()}, 500);
        setInterval ('cursorAnimation()', 600);

}); //end jquery


	function render() {
		controls.update();
        sunLightPosition();
		//sphere.rotation.y += 0.0005;
       // console.log("camera pos:" + camera.position.x +" " + camera.position.y + " " + camera.position.z); 
        
        if(!mobileDevice)
		 // clouds.rotation.y += 0.0005;		
		requestAnimationFrame(render);
		renderer.render(scene, camera);
        processNewFiles();
        processDOWNLights();
        processUPLights();   
        processFlightRoute();
        
        processRadiusEntities();
        
	}


    function processFlightRoute() 
    {
       
        if(!flightRoute.isEmpty()) {
            var pos = flightRoute.dequeue();
            camera.position.x=pos.x;
            camera.position.y=pos.y;
            camera.position.z=pos.z;
        }
    }

    function processNewFiles() {
        while(!cuaFiles.isEmpty()) {
            var rFile = cuaFiles.dequeue();
            // add file to charting
            processChartFile(rFile);
            if(!cuaLightsOFF.isEmpty()) {
                var lf = cuaLightsOFF.dequeue();
                cuaLightsUP.enqueue(startLightEffect(lf,rFile));
            }
            //add text to console
            writeLogLine(rFile.city.CapitalName + " " + rFile.city.CapitalLatitude + "-" + rFile.city.CapitalLongitude);
        }
    }

     function processUPLights() {
       for(t=0;t<cuaLightsUP.getLength();t++) {
            var lightFile = cuaLightsUP.dequeue();
            lightFile.intensity=lightFile.intensity+0.1;
            if(lightFile.intensity>3) {
                cuaLightsDOWN.enqueue(lightFile);
            } else {
               cuaLightsUP.enqueue(lightFile);
            }
        }
    }

     function processDOWNLights() {
        for(t=0;t<cuaLightsDOWN.getLength();t++) {
            var lightFile = cuaLightsDOWN.dequeue();
            lightFile.intensity=lightFile.intensity-0.1;
            if(lightFile.intensity<=0) {
                lightFile.intensity=0;
                cuaLightsOFF.enqueue(lightFile);
            } else {
               cuaLightsDOWN.enqueue(lightFile);
            }
        }
    }

    function startLightEffect(lightFile,rFile) {
         var vec  = latLongToVector3(rFile.city.CapitalLatitude,rFile.city.CapitalLongitude,5,0.05);
         lightFile.position.set(vec.x,vec.y,vec.z);
         lightFile.intensity=0;
         if(rFile.fileType==0)
              lightFile.color.setRGB(0,1,0);
         else
              lightFile.color.setRGB(1,1,0);
        
        return lightFile;
    }

   

	function createSphere(radius, segments) {
        if(mobileDevice) {
            return new THREE.Mesh(
                new THREE.SphereGeometry(radius, segments, segments),
                new THREE.MeshPhongMaterial({
                    map:THREE.ImageUtils.loadTexture('earth.jpg'),
                    bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
                    bumpScale:   0.005,
                    specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
                    specular:    new THREE.Color('grey')								
                })
            );
        } else {
            return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshLambertMaterial({
                //map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				map:         THREE.ImageUtils.loadTexture('images/1_earth_8k.jpg'),
                bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				bumpScale:   0.005,
				specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular:    new THREE.Color('grey')								
			})
		);
        }
	}


	function createClouds(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),			
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
		);		
	}

	function createStars(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments), 
			new THREE.MeshBasicMaterial({
				map:  THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'), 
				side: THREE.BackSide
			})
		);
	}


 

    function generateFiles() {
        var files = DataGenerator.generateData();
        for(t =0;t<files.length;t++) {
            
            cuaFiles.enqueue(files[t]);
        }
    }


   

/*var pox = 0;
var poy = 0;
var poz = 105;


var PI2 = Math.PI * 2;
var program = function ( context ) {

    context.beginPath();
    context.arc( 0, 0, 0.5, 0, PI2, true );
    context.fill();

}*/



function sunLightPosition() {
   var d1 = new Date();
    //d1.setHours(d1.getHours()+1);
    var sp = sunPosition(d1);
    var vec  = latLongToVector3(sp[1],sp[0],10,0.0);
   sun.position.set(vec.x,vec.y,vec.z);
   
}




function generateEntityDots(scene) {
 var entitiesAux=new Array( country_entities.length);   
 for(t=0;t<country_entities.length;t++) {
     entitiesAux[t] = generateSingleEntity(scene,country_entities[t]);
 }
  return entitiesAux;  
}

function generateSingleEntity(scene,entity) {
    var vecEntity = latLongToVector3(entity.Latitude,entity.Longitude,5,0);
    var geometry = new THREE.SphereGeometry( radiusEntity, 32, 32 );
    var material = new THREE.MeshPhongMaterial ( {specular:0x0000FF,shininess:100,color:0x0000FF} );
    var entitySphere = new THREE.Mesh( geometry, material );
    entitySphere.position=vecEntity;
    scene.add( entitySphere );
    //event listener
    domEvents.addEventListener(entitySphere, 'click', function(event){
        var clicked = getEntityByMeshId(entitySphere.id);
        if(clicked!=null)
            flightRoute = generateFlighCoordinates(camera.position,latLongToVector3(clicked.entity.Latitude,clicked.entity.Longitude,radius,1),100)});
    
    return {entitySphere:entitySphere,entity:entity};
    
}
                               

function processRadiusEntities() {
    var scaleFactor = camera.position.distanceTo (sphere.position)/(distanceInitial); 
    //need to resize exponentially
    scaleFactor=scaleFactor*scaleFactor;
    for(t=0;t<entities.length;t++) {
        entities[t].entitySphere.scale.set(scaleFactor,scaleFactor,scaleFactor);
        //sphere.scale.set(scaleFactor,scaleFactor,scaleFactor);
    }  
}


function getEntityByMeshId(id) {
    for(t=0;t<entities.length;t++) {
        if(entities[t].entitySphere.id==id)
            return entities[t];
    }
    return null;
}





 