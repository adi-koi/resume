let max = 5;
let checkArr = [];
let arrCount;
const currentTime = new Date();
let updated = 0;
let apiInterval;
let moreInfoStorage = [];
let tempupdate; 
let chart;

$('#cards').hide();
$('#liveReports').hide();
homePage();
function homePage(){
    $.ajax({
        url: 'https://api.coingecko.com/api/v3/coins/list',
        async: false,
        success: function(res){
            //prints all the cards
            $('.lds-spinner').hide();
            $('#cards').show();
            for(let i = 0; i < 100; i++){
                printCards(res, i);
            }
            
            
            
            //searches for a coin from the searchbar and shows the coin or an error
            $('#search').on('click', () => {
                $('#err').text('');
                let flag = false;
                for(let i = 0; i < 100; i++){
                    if(res[i].symbol == $('#searchKey').val()){
                        $('.cardRow').text('');
                        printCards(res, i);
                        $('#searchKey').val('');
                        flag = true;
                    }
                }
                if(!flag){
                    $('#err').text('Could not find a coin by that name');
                }
            })
            
            if(checkArr.length){
                for(let i = 0; i < 100; i++){
                    for(let j = 0; j < checkArr.length; j++){
                        if(document.querySelectorAll('.checkbox')[i].value == checkArr[j].value){
                            document.querySelectorAll('.checkbox')[i].checked = true;
                        }
                    }
                }
            }
            
            //checks if more than 5 cards have been toggled
            let checkboxes = $('input[type="checkbox"]');
            checkboxes.change(function(event){
                checkFive(checkboxes, event);
            });

            

        }
    })
}

function checkFive(checkboxes, event) {
    var current = checkboxes.filter(':checked').length;
    if(event.target.checked){
        checkArr.push(event.target);
        console.log(event.target.value);
    } else{
        let index = checkArr.indexOf(event.target);
        if (index !== -1) {
        checkArr.splice(index, 1);
        }
    }
    if(current == 6){
        Swal.fire({
            title: 'Please untick one',
            html: `
            <h3> 
                ${checkArr[0].value} 
                <label class="switch">
                    <input type="checkbox" checked class="checkboxPopup" id="0"/>
                    <span class="slider round"></span>
                </label>
            </h3>` +
            `<h3>
                ${checkArr[1].value} 
                <label class="switch">
                    <input type="checkbox" checked class="checkboxPopup" id="1"/>
                    <span class="slider round"></span>
                </label>
            </h3>` +
            `<h3> 
                ${checkArr[2].value}
                <label class="switch">
                    <input type="checkbox" checked class="checkboxPopup" id="2"/>
                    <span class="slider round"></span>
                </label>
            </h3>` +
            `<h3> 
                ${checkArr[3].value}
                <label class="switch">
                    <input type="checkbox" checked class="checkboxPopup" id="3"/>
                    <span class="slider round"></span>
                </label>
            </h3>` +
            `<h3> 
                ${checkArr[4].value}
                <label class="switch">
                    <input type="checkbox" checked class="checkboxPopup" id="4"/>
                    <span class="slider round"></span>
                </label>
            </h3>`,
            showConfirmButton: true,
            showCancelButton: true,
            didOpen: (element) => {
                Swal.getConfirmButton().setAttribute('disabled', '')
                $(element).on('change', '[type="checkbox"]', function () {
                    if (Swal.getPopup().querySelectorAll('.checkboxPopup:checked').length < 5) {
                        Swal.getConfirmButton().removeAttribute('disabled')
                    } else {
                        Swal.getConfirmButton().setAttribute('disabled', '')
                    }
                });
            },
            preConfirm: () => {
                arrCount = 0;
                for(let i = 0; i < 5; i++){
                    if(!Swal.getPopup().querySelectorAll(`.checkboxPopup`)[i].checked){
                        checkArr.splice(i-arrCount, 1)
                        arrCount++;
                    } 
                }
            }
        }).then((value) => {
            if(!value.isConfirmed){
                checkArr.splice(5, 1);
            } 
            for(let i = 0; i < 100; i++){
                document.querySelectorAll('.checkbox')[i].checked = false;
                for(let j = 0; j < checkArr.length; j++){
                    if(document.querySelectorAll('.checkbox')[i] == checkArr[j]){
                        document.querySelectorAll('.checkbox')[i].checked = true;
                    }
                }
            }
        })
    }
}


//getting more info through another ajax request and checking if its already been 2 minutes or not

//make a localstorage for each id thats clicked. in the localstorage the value of that id will be: [last time it was clicked, res information]. maybe object
function getMoreInfo(id, index){
    let arrIndex;
    $(`#collapse${index}`).html(`
    <div class="lds-spinner" style="margin-left: 30%;">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>`)
        console.log(id, index);
    
    if(localStorage.getItem('moreInfoStorage')){
        console.log('storage');
        moreInfoStorage = JSON.parse(localStorage.getItem('moreInfoStorage'));
        for(let i = 0; i < moreInfoStorage.length; i++){
            console.log(i);
            if(moreInfoStorage[i].id == id){
                updated = moreInfoStorage[i].updatedTime;
                console.log(updated);
                arrIndex = i;
                console.log(arrIndex);
            }
        }
    }
    console.log(currentTime.getTime() - updated);
    console.log(currentTime.getTime());
    console.log(updated);
    if((currentTime.getTime() - updated) > 120000 || updated == 0){
        console.log('in');
        $.ajax({
            url: `https://api.coingecko.com/api/v3/coins/${id}`,
            async: false,
            success: function(res){
                if(arrIndex != undefined){
                    moreInfoStorage[arrIndex] = {id: id, updatedTime: currentTime.getTime(), image: res.image.small, ils: res.market_data.current_price.ils, usd: res.market_data.current_price.usd, eur: res.market_data.current_price.eur};
                    console.log('yes');
                } else{
                    moreInfoStorage.push({id: id, updatedTime: currentTime.getTime(), image: res.image.small, ils: res.market_data.current_price.ils, usd: res.market_data.current_price.usd, eur: res.market_data.current_price.eur});
                    arrIndex = moreInfoStorage.length - 1;
                    console.log('no');
                    console.log(arrIndex);
                }
                localStorage.setItem('moreInfoStorage', JSON.stringify(moreInfoStorage));
            }
        })
        
    }
    console.log(arrIndex);
    if(moreInfoStorage[arrIndex].eur == undefined){
        $(`#collapse${index}`).html(`
        <img style="width: 50px" src="${moreInfoStorage[arrIndex].image}" alt="">
        <p>0₪</p>
        <p>0$</p>
        <p>0€</p>
        `);
    } else{
        $(`#collapse${index}`).html(`
        <img style="width: 50px" src="${moreInfoStorage[arrIndex].image}" alt="">
        <p>${moreInfoStorage[arrIndex].ils}₪</p>
        <p>${moreInfoStorage[arrIndex].usd}$</p>
        <p>${moreInfoStorage[arrIndex].eur}€</p>
        `);
    }
    updated = 0;
}

$('#about').on('click', () => {
    $('.cardRow').text('');
    $('#liveReports').hide();
    clearInterval(apiInterval);
    aboutPage();
})

$('#home').on('click', () => {
    $('#aboutInfo').text('');
    $('#liveReports').hide();
    $('.cardRow').text('');
    clearInterval(apiInterval);
    homePage();
    
})

$('#reports').on('click', () => {
    $('.cardRow').text('');
    $('#aboutInfo').text('');
    $('#liveReports').show();
    bonus();
})

function printCards(res, i){
    $('.cardRow').append(
        `<div class="card col-sm-12 col-md-2" style="width: 18rem; margin-right: 30px; margin-bottom: 30px">
            <div class="card-body">
                <h5 class="row card-title">
                    <span class="cardTitleName col-sm-6">${res[i].symbol}</span>
                    <span class="cardSwitch col-sm-3">
                        <label class="switch">
                            <input class="form-check-input checkbox" type="checkbox" role="switch" id="flexSwitchCheckDefault" value="${res[i].symbol}">
                            <span class="slider round"></span>
                        </label>
                    </span>
                </h5>
                <p class="card-text">${res[i].name}</p>
                <button type="button" class="btn btn-info" data-toggle="collapse" data-target="#collapseExample${i}" aria-expanded="false" aria-controls="collapseExample${i}" onclick="getMoreInfo('${res[i].id}', '${i}')">More Info</button>
                <div class="collapse" id="collapseExample${i}">
                    <div class="card card-body" id="collapse${i}">
                    </div>
                </div>
            </div>
        </div>`);
}

function aboutPage(){
    $('#aboutInfo').html(`
        <h4>Name: Adi</h4>
        </br>
        <h4>About the Project:</h4>
        <h5>This project is a single page application that makes virtual trade information more accessible.</h5>
        </br>
        <img style="width: 100px"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjSmoEfPmKV54S6uo8YxWh2dZj_nddpYgsDw&usqp=CAU" alt="">
    `)
}

function bonus(){
    //array that will hold the name and the rate of the chosen coins
    let nameRate = [];
    let urlKey = '';
    let dataset = [];

    //pushing the names of the chosen coins into the new array and key
    for(let i = 0; i < checkArr.length; i++){
        //checkArr is an array that has the toggled coins and is used earlier in the code
        nameRate.push({name: checkArr[i].value.toUpperCase()});
        urlKey += nameRate[i].name + ',';
        dataset.push({
                label: nameRate[i].name,
                data: [i],
                borderWidth: 1
            })
    }

    
    console.log(urlKey);
    console.log(dataset);

    //getting the api every 2 seconds
    apiInterval = window.setInterval(function () {
        $.ajax({
            url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${urlKey}&tsyms=USD`,
            async: false,
            success: function (res) {
                for (let i = 0; i < nameRate.length; i++) {
                    for (const coin in res) {
                        if (coin == nameRate[i].name) {
                            nameRate[i].rate = res[coin].USD;
                        }
                    }
                }
                $('#reperr').text('');
                for(let i = 0; i < nameRate.length; i++){
                    console.log(nameRate[i]);
                    if(!nameRate[i].rate){
                        $('#reperr').append(`
                        ${nameRate[i].name} does not have an avilable rate and will not be shown.
                        </br>
                        `)
                    }
                }
            }
        })
    }, 2000);
    chart = new Chart($('#linechart'), {
        type: 'line',
        data: {
            datasets: dataset
        },
        options: {
            plugins: {
                streaming: {
                    duration: 20000
                }
            },
            scales: {
                x: {
                    type: 'realtime',
                    realtime: {
                        onRefresh: chart => {
                            chart.data.datasets.forEach(dataset => {
                                for(let i = 0; i < nameRate.length; i++){
                                    if (dataset.label == nameRate[i].name){
                                        dataset.data.push({
                                            x: Date.now(),
                                            y: nameRate[i].rate
                                        });
                                    }
                                }
                                
                            });
                        }
                    }
                }
            }
        }
    });
}