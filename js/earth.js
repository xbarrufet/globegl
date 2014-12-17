// Created by Bjorn Sandvik - thematicmapping.org

var cuaFiles,cuaLightsON,cuaLightsUP,cuaLightsDOWN;
var webglEl,scene,camara,renderer;
var sphere,clouds,sun;



$(document).ready(function() {
         cuaFiles = new Queue();
         cuaLightsOFF = new Queue();
         cuaLightsUP = new Queue();
         cuaLightsDOWN = new Queue();

         webglEl = document.getElementById('webgl');
    
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage(webglEl);
            //return;
        }

        var width  = window.innerWidth,
            height = window.innerHeight;

        // Earth params
        var radius   = 5,
            segments = 32,
            rotation = 6;  

         scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
        camera.position.z = 15

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);

        sphere = createSphere(radius, segments);
        sphere.rotation.y = rotation; 
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
      
        clouds = createClouds(radius, segments);
        clouds.rotation.y = rotation;
        scene.add(clouds)

        var stars = createStars(90, 64);
        scene.add(stars);

        controls = new THREE.TrackballControls(camera);

        webglEl.appendChild(renderer.domElement);

        render();
    
        setInterval(function () {generateFiles()}, 500);
        setInterval ('cursorAnimation()', 600);

}); //end jquery


	function render() {
		controls.update();
        sunLightPosition();
		sphere.rotation.y += 0.0005;
		clouds.rotation.y += 0.0005;		
		requestAnimationFrame(render);
		renderer.render(scene, camera);
        processNewFiles();
        processDOWNLights();
        processUPLights();    
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
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map:         THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				bumpMap:     THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				bumpScale:   0.005,
				specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular:    new THREE.Color('grey')								
			})
		);
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


function latLongToVector3(lat, lon, radius, heigth) {
        var phi = (lat)*Math.PI/180;
        var theta = (lon-180)*Math.PI/180;
 
        var x = -(radius+heigth) * Math.cos(phi) * Math.cos(theta);
        var y = (radius+heigth) * Math.sin(phi);
        var z = (radius+heigth) * Math.cos(phi) * Math.sin(theta);
        return new THREE.Vector3(x,y,z);
}




 