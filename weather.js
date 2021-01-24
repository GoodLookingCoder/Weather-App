const {format} = require('date-fns');
let loader = document.querySelector("#loader");
let sun = document.querySelector("#rays");
let ubication = document.querySelector("#ubication");
let input = document.querySelector("input");
let submit = document.querySelector("#submit");
let unix = "metric";
let grades = "C"
let section = document.querySelector("section");

submit.onclick = clickSubmit;

function clickSubmit(e){
    e.preventDefault();
    submit.style.backgroundColor = "rgb(207, 77, 1)"
    setTimeout(()=>submit.style.backgroundColor = "rgb(255, 102, 0)", 100);
    let value = input.value;
    if(!window.navigator.onLine){
        displayError("You are offline");
        return;
    }else if (!value){
        displayError("Complete the field");
    }else if(!checkIfCanLook()){
        return;
    }else{
        document.querySelector("#submit").onclick = (e)=>e.preventDefault();
        document.querySelector("#ubication").onclick = (e)=>e.preventDefault();
        document.querySelector(".checkbox").onclick = (e)=>e.preventDefault();
        if(document.querySelector("#rays")&&document.querySelector(".section-center").style.display!=="none") sun.style.animation = "add 9.00s linear infinite";
        else {
            document.querySelector("#loaderWrapper").style.animationName = "    appear";
            document.querySelector("#loaderWrapper").style.animationDuration = "500ms";
            loader.style.display = "block";
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const controller2 = new AbortController();
        let timeoutId2;
        fetch("https://sher-s7.github.io/weather-app/citylist.json", {signal: controller.signal})
        .then(cities=> {clearTimeout(timeoutId);console.log(cities); return cities.json()})
        .then(citiesJSON => citiesJSON.filter((city) => city.name.toUpperCase() === value.toUpperCase()).map(city => city.id))
        .then(cityIDs =>{
            if(cityIDs.length > 20){
                cityIDs.splice(20, cityIDs.length);
            }
            timeoutId2 = setTimeout(() => controller2.abort(), 60000);
            return fetch(`https://api.openweathermap.org/data/2.5/group?id=${cityIDs.join(',')}&appid=d9e6b4a5f789baf097c8d930e8ab8091&units=${unix}`, {signal: controller2.signal})
        })
        .then(res=>{   
                clearTimeout(timeoutId2);
                if(res.status == 200) return res.json();
                throw new Error(res.status);
            }
        )
        .then(data=>{
            console.log(data);
            displayResults(data, data.cnt);
        })
        .catch((error) => {
            console.error(error);
            if (error.toString().indexOf("404") == -1) displayError("Check your connection");
            else displayError('Could not find city');
        })
    }
}

ubication.onclick = clickUbication;

function clickUbication(e){
    e.preventDefault();
    ubication.style.backgroundColor = "rgb(207, 77, 1)";
    setTimeout(()=>ubication.style.backgroundColor = "rgb(255, 102, 0)", 100);
    if(!window.navigator.onLine){
        displayError("You are offline");
        return;
    }
    if (navigator.geolocation){
        document.querySelector("#submit").onclick = (e)=>e.preventDefault();
        document.querySelector("#ubication").onclick = (e)=>e.preventDefault();
        document.querySelector(".checkbox").onclick = (e)=>e.preventDefault();
        if(document.querySelector("#rays")&&document.querySelector(".section-center").style.display!=="none") sun.style.animation = "add 9.00s linear infinite";
        else{
            document.querySelector("#loaderWrapper").style.animationName = "appear";
            document.querySelector("#loaderWrapper").style.animationDuration = "500ms";
            loader.style.display = "block";
        } 
        navigator.geolocation.getCurrentPosition(showPosition, showError, {timeout:8000});
    }else{
        displayError("Geolocation is not supported by this browser.");
    }
      
    function showPosition(position){
        let lat = position.coords.latitude;  
        let lon = position.coords.longitude;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=d9e6b4a5f789baf097c8d930e8ab8091&units=${unix}`)
        .then(res=>res.json())
        .then(data=>displayResults(data, 1))
    }
    
    function showError(error) {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            displayError("User denied the request for Geolocation.")
            break;
          case error.POSITION_UNAVAILABLE:
            displayError("Location information is unavailable.")
            break;
          case error.TIMEOUT:
            displayError("Check your conection")
            break;
          case error.UNKNOWN_ERROR:
            displayError("An unknown error occurred.")
            break;
        }
    }
}

input.onkeydown = function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      return false;
    }
};

function displayResults(results, cnt){
    //Removing
    if(document.querySelector(".section-center")&&document.querySelector(".section-center").style.display!=="none"){
        document.querySelector(".section-center").style.animationName = "vanish";
        document.querySelector(".section-center").style.animationDuration = "1000ms";
        document.querySelector("#helpText").style.animationName = "vanish";
        document.querySelector("#helpText").style.animationDuration = "1000ms";
        setTimeout(()=>{
            sun.style.animation = "";
            document.querySelector(".section-center").remove();
            document.querySelector("#helpText").remove();
            if(!document.querySelector("section").style.overflowY)document.querySelector("section").style.overflowY="scroll";
        }, 1000)
    }else{
        setTimeout(()=>{
            document.querySelector("#loaderWrapper").style.animationName = "vanish";
            document.querySelector("#loaderWrapper").style.animationDuration = "500ms";
            if(!document.querySelector("section").style.overflowY)document.querySelector("section").style.overflowY="scroll";
        },1000)
        setTimeout(()=>{
            loader.style.display = "none";
        },1500)

        let length = document.querySelectorAll(".cityContainer").length;
        for (let i = 0; i < length ; i++){
            document.querySelectorAll(".cityContainer")[i].style.animationName = "vanish";
            document.querySelectorAll(".cityContainer")[i].animationDuration = "1000ms";
            document.querySelectorAll(".mapLink")[i].style.animationName = "vanish";
            document.querySelectorAll(".mapLink")[i].animationDuration = "1000ms";
            console.log(document.querySelectorAll(".cityContainer")[i])
            setTimeout(()=>{
                document.querySelectorAll(".cityContainer")[0].remove();
                document.querySelectorAll(".mapLink")[0].remove();                
            },1000)
        }
    }

    if(!document.querySelector("#numOfCities")){
        let numOfCities = document.createElement("h3");
        numOfCities.id = "numOfCities";
        if (results.list && cnt > 1) numOfCities.innerHTML = "Found " + cnt + " cities named " + `<span id="spanOrange">${results.list[0].name}</span>`;
        else if(results.list)numOfCities.innerHTML = "Found " + cnt + " city named " + `<span id="spanOrange">${results.list[0].name}</span>`;
        else numOfCities.innerHTML = "The weather in " + results.name + " is";

        setTimeout(()=>{
            section.appendChild(numOfCities);
            numOfCities.style.animationName = "appear";
            numOfCities.style.animationDuration = "200ms";
        },1000)

    }else{
        setTimeout(()=>{
            if (results.list && cnt > 1) numOfCities.innerHTML = "Found " + cnt + " cities named " + `<span id="spanOrange">${results.list[0].name}</span>`;
            else if(results.list)numOfCities.innerHTML = "Found " + cnt + " city named " + `<span id="spanOrange">${results.list[0].name}</span>`;
            else numOfCities.innerHTML = "The weather in " + results.name + " is";
        },1000)
    }
    setTimeout(()=>{
        let data;
        if(document.querySelector("#spanOrange")){
            data = {
                city:(document.querySelector("#spanOrange").innerHTML).toLowerCase(),
                resultss: results,
                cant: cnt,
                gradess: grades
            }
        }else{
            data = {
                city:"your",
                resultss: results,
                cant: cnt,
                gradess: grades
            } 
        }
        sessionStorage.setItem("lastS",JSON.stringify(data));
    },1002)

    for (let i = 0; i < cnt; i++) {
        let cityContainer = document.createElement("div");

        let aSection = document.createElement("div");
        let flag = document.createElement("img");
        let bSection = document.createElement("p");
        let cSection = document.createElement("div");
        let icon = document.createElement("img");

        let empty1 = document.createElement("div");
        let dSection = document.createElement("p");
        let empty2 = document.createElement("div");

        let visibility = document.createElement("p");
        let vSpan1 = document.createElement("span");
        let vBr = document.createElement("br");
        let vSpan2 = document.createElement("span");

        let wind = document.createElement("p");
        let wSpan1 = document.createElement("span");
        let wBr = document.createElement("br");
        let wSpan2 = document.createElement("span");

        let sunrise = document.createElement("p");
        let srSpan1 = document.createElement("span");
        let srBr = document.createElement("br");
        let srSpan2 = document.createElement("span");

        let humidity = document.createElement("p");
        let hSpan1 = document.createElement("span");
        let hBr = document.createElement("br");
        let hSpan2 = document.createElement("span");

        let cloudiness = document.createElement("p");
        let cSpan1 = document.createElement("span");
        let cBr = document.createElement("br");
        let cSpan2 = document.createElement("span");

        let sunset = document.createElement("p");
        let stSpan1 = document.createElement("span");
        let stBr = document.createElement("br");
        let stSpan2 = document.createElement("span");

        let mapLink = document.createElement("a");

        cityContainer.className = "cityContainer";
        
        aSection.id = "aSection";

        bSection.id = "bSection";
        
        cSection.id = "cSection";
        icon.id = "weatherIcon";

        dSection.id = "dSection";

        vSpan1.className = "dataSpan";
        wSpan1.className = "dataSpan";
        srSpan1.className = "dataSpan";
        hSpan1.className = "dataSpan";
        cSpan1.className = "dataSpan";
        stSpan1.className = "dataSpan";

        mapLink.className = "mapLink";
        if(results.list){
            //FirstS
            flag.src =` https://www.countryflags.io/${ results.list[i].sys.country.toLowerCase()}/shiny/32.png` 
            bSection.innerHTML = results.list[i].main.temp + `<sup id="specialSup">º${grades}</sup>`;
            let ic = results.list[i].weather[0].icon;
            let num = ic.substring(0,2);
            icon.src = `PNG/${num}.png`;

            //SecondS
            dSection.innerHTML = results.list[i].weather[0].description;

            //ThirdS
            vSpan1.innerHTML = "Visivility";
            vSpan2.innerHTML = results.list[i].visibility/1000 +`<sup>km</sup>`;
            wSpan1.innerHTML = "Wind";
            wSpan2.innerHTML = (results.list[i].wind.speed * 3.6).toFixed(2) + `<sup>km/h</sup>`;
            srSpan1.innerHTML = "Sunrise";
            const srD = new Date((results.list[i].sys.sunrise + results.list[i].sys.timezone) * 1000);
            const UTCsrDate = new Date(srD.getUTCFullYear(), srD.getUTCMonth(), srD.getUTCDate(), srD.getUTCHours(), srD.getUTCMinutes(), srD.getUTCSeconds());
            console.log(format(UTCsrDate, 'h:mma').substring(0, format(UTCsrDate, 'h:mma').indexOf("M")-1))
            srSpan2.innerHTML = `${format(UTCsrDate, 'h:mma').substring(0, format(UTCsrDate, 'h:mma').indexOf("M")-1)}<sup>${format(UTCsrDate, 'h:mma').substring(format(UTCsrDate, 'h:mma').indexOf("M")-1,format(UTCsrDate, 'h:mma').indexOf("M")+2)}</sup>`;
            hSpan1.innerHTML = "Humidity";
            hSpan2.innerHTML = results.list[i].main.humidity + `<sup>%</sup>`;
            cSpan1.innerHTML = "Cloudiness";
            cSpan2.innerHTML =  results.list[i].clouds.all + `<sup>%</sup>`;
            stSpan1.innerHTML = "Sunset";
            const stD = new Date((results.list[i].sys.sunset + results.list[i].sys.timezone) * 1000)
            const UTCstDate = new Date(stD.getUTCFullYear(), stD.getUTCMonth(), stD.getUTCDate(), stD.getUTCHours(), stD.getUTCMinutes(), stD.getUTCSeconds());     
            stSpan2.innerHTML = `${format(UTCstDate, 'h:mma').substring(0, format(UTCstDate, 'h:mma').indexOf("M")-1)}<sup>${format(UTCstDate, 'h:mma').substring(format(UTCstDate, 'h:mma').indexOf("M")-1,format(UTCstDate, 'h:mma').indexOf("M")+2)}</sup>`;

            //Link
            mapLink.href = `https://www.google.com/maps/place/${results.list[i].coord.lat},${results.list[i].coord.lon}`
        
        }else{
            //FirstS
            flag.src =`https://www.countryflags.io/${ results.sys.country.toLowerCase()}/shiny/32.png` 
            bSection.innerHTML = results.main.temp + `<sup id="specialSup">º${grades}</sup>`;
            let ic = results.weather[0].icon;
            let num = ic.substring(0,2);
            icon.src = `PNG/${num}.png`;
 
            //SecondS
            dSection.innerHTML = results.weather[0].description;

            //ThirdS
            vSpan1.innerHTML = "Visivility";
            vSpan2.innerHTML = results.visibility/1000 + `<sup>km</sup>`;
            wSpan1.innerHTML = "Wind";
            wSpan2.innerHTML = (results.wind.speed * 3.6).toFixed(2) + `<sup>km/h</sup>`;
            srSpan1.innerHTML = "Sunrise";
            console.log(results.sys.sunrise + " + " + results.sys.timezone);
            const srD = new Date((results.sys.sunrise + results.timezone) * 1000);
            const UTCsrDate = new Date(srD.getUTCFullYear(), srD.getUTCMonth(), srD.getUTCDate(), srD.getUTCHours(), srD.getUTCMinutes(), srD.getUTCSeconds());
            srSpan2.innerHTML = `${format(UTCsrDate, 'h:mma').substring(0, format(UTCsrDate, 'h:mma').indexOf("M")-1)}<sup>${format(UTCsrDate, 'h:mma').substring(format(UTCsrDate, 'h:mma').indexOf("M")-1,format(UTCsrDate, 'h:mma').indexOf("M")+2)}</sup>`;
            hSpan1.innerHTML = "Humidity";
            hSpan2.innerHTML = results.main.humidity + `<sup>%</sup>`;
            cSpan1.innerHTML = "Cloudiness";
            cSpan2.innerHTML =  results.clouds.all + `<sup>%</sup>`;
            stSpan1.innerHTML = "Sunset";
            const stD = new Date((results.sys.sunset + results.timezone)* 1000)
            const UTCstDate = new Date(stD.getUTCFullYear(), stD.getUTCMonth(), stD.getUTCDate(), stD.getUTCHours(), stD.getUTCMinutes(), stD.getUTCSeconds());     
            stSpan2.innerHTML =  `${format(UTCstDate, 'h:mma').substring(0, format(UTCstDate, 'h:mma').indexOf("M")-1)}<sup>${format(UTCstDate, 'h:mma').substring(format(UTCstDate, 'h:mma').indexOf("M")-1,format(UTCstDate, 'h:mma').indexOf("M")+2)}</sup>`;

            //Link
            mapLink.href = `https://www.google.com/maps/place/${results.coord.lat},${results.coord.lon}`
        }

        mapLink.target = "_blank"
        mapLink.innerHTML = "View on Map";

        cityContainer.style.animationName = "appear";
        cityContainer.style.animationDuration = "1000ms";
    
        mapLink.style.animationName = "appear";
        mapLink.style.animationDuration = "1000ms"; 

        //1rs Row
        aSection.appendChild(flag);
        cSection.appendChild(icon);

        cityContainer.appendChild(aSection);
        cityContainer.appendChild(bSection);
        cityContainer.appendChild(cSection);

        //2nd Row
        cityContainer.appendChild(empty1);
        cityContainer.appendChild(dSection);
        cityContainer.appendChild(empty2);

        //3rd Row
        visibility.appendChild(vSpan1);
        visibility.appendChild(vBr);
        visibility.appendChild(vSpan2);
        wind.appendChild(wSpan1);
        wind.appendChild(wBr);
        wind.appendChild(wSpan2);
        sunrise.appendChild(srSpan1);
        sunrise.appendChild(srBr);
        sunrise.appendChild(srSpan2);

        cityContainer.appendChild(visibility);
        cityContainer.appendChild(wind);
        cityContainer.appendChild(sunrise);

        //4th Row
        humidity.appendChild(hSpan1);
        humidity.appendChild(hBr);
        humidity.appendChild(hSpan2);
        cloudiness.appendChild(cSpan1);
        cloudiness.appendChild(cBr);
        cloudiness.appendChild(cSpan2);
        sunset.appendChild(stSpan1);
        sunset.appendChild(stBr);
        sunset.appendChild(stSpan2);

        cityContainer.appendChild(humidity);
        cityContainer.appendChild(cloudiness);
        cityContainer.appendChild(sunset);

        setTimeout(()=>{
            section.appendChild(cityContainer);
            section.appendChild(mapLink);
            document.querySelector("#submit").onclick = clickSubmit;
            document.querySelector("#ubication").onclick = clickUbication;
            document.querySelector(".checkbox").onclick = changeUnits;
        },1000)
    }
}

function displayError(error){
    document.querySelector("#submit").onclick = (e)=>e.preventDefault();
    document.querySelector("#ubication").onclick = (e)=>e.preventDefault();
    document.querySelector(".checkbox").onclick = (e)=>e.preventDefault();
    if(sun.style.animation&&document.querySelector(".section-center").style.display!=="none") sun.style.animation = "none";
    else{
        document.querySelector("#loaderWrapper").style.animationName = "vanish";
        document.querySelector("#loaderWrapper").style.animationDuration = "500ms";
        setTimeout(()=>{
            loader.style.display = "none";
        },500)
    }

    document.querySelector("#error").innerHTML = error;
    document.querySelector("#error").style.display = "block";
    document.querySelector(".head-flex").style.marginBottom = "0px";
    document.querySelector(".button-cover").style.marginTop = "7px";
    document.querySelector("#error").style.animationName = "appear";
    document.querySelector("#error").style.animationDuration = "100ms";   
  
    setTimeout(()=>{
        document.querySelector("#error").style.animationName = "vanish";
        document.querySelector("#error").style.animationDuration = "200ms";
    },3000)
    
    setTimeout(()=>{
        document.querySelector("#error").style.display = "none";
        document.querySelector(".head-flex").style.marginBottom = "40px"
        document.querySelector(".button-cover").style.marginTop = "0px";

        document.querySelector("#submit").onclick = clickSubmit;
        document.querySelector("#ubication").onclick = clickUbication;
        document.querySelector(".checkbox").onclick = changeUnits;
    }, 3170);
    
}


document.querySelector(".checkbox").onclick = changeUnits;
function changeUnits(){ 
    let fgrades = window.getComputedStyle(document.querySelector('.knobs'),':before').getPropertyValue("content")
    console.log(fgrades);
    if (fgrades == `"C"`) {
        unix = "metric";
        grades = "C";
        update({gradess: "C"})
    }else{
        unix = "imperial";
        grades = "F";
        update({gradess: "F"})
    }

    if (document.querySelector(".cityContainer")){
        for (let i = 0; i < document.querySelectorAll(".cityContainer").length; i++){
            let bSec = document.querySelectorAll(".cityContainer")[i].querySelector("#bSection").textContent;
            console.log(bSec)
            let ffgrades;
            if (bSec.indexOf("C")!==-1){
                ffgrades = bSec.substring(0, bSec.indexOf("º"));
                document.querySelectorAll(".cityContainer")[i].querySelector("#bSection").innerHTML = parseFloat((ffgrades * 9/5 + 32).toFixed(2)) + `<sup id="specialSup">ºF</sup>`;           
            }else{
                ffgrades = bSec.substring(0, bSec.indexOf("º")); 
                document.querySelectorAll(".cityContainer")[i].querySelector("#bSection").innerHTML = parseFloat(((ffgrades-32) * 5/9).toFixed(2)) + `<sup id="specialSup">ºC</sup>`;           
            }
        }
    }
}

function checkIfCanLook(){
    let line = document.querySelector("#numOfCities");
    if (line) {
        let arr = line.innerHTML.split(" ");
        let lastWord = arr[arr.length-1];
        if(lastWord == "is") {
            return true
        }
        else{
            if((input.value).toLowerCase() == (document.querySelector("#spanOrange").innerHTML).toLowerCase())return false;
            else return true;
        }    
    }
    else{ 
        return true
    }
}

if(sessionStorage.getItem("lastS")){
    document.querySelector(".section-center").style.display = "none";
    document.querySelector("#helpText").style.display = "none";
    document.querySelector("#loaderWrapper").style.animationName = "appear";
    document.querySelector("#loaderWrapper").style.animationDuration = "500ms";
    loader.style.display = "block";

    let s = JSON.parse(sessionStorage.getItem("lastS"));
    if(s.gradess == "F") document.querySelector(".checkbox").click();

    if(s.city!=="your"){
        input.value = s.city;
        submit.click();
    }else{
        input.value = "";
        ubication.click()
    }
    console.log(s)
}

function update(value){
    let prevData = JSON.parse(sessionStorage.getItem('lastS'));
    Object.keys(value).forEach(function(val){
         prevData[val] = value[val];
    })
    sessionStorage.setItem('lastS', JSON.stringify(prevData));
}
