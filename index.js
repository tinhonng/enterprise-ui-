/**
 * Created by tinhonng on 4/5/15.
 */
Countrys = new Mongo.Collection("countrys");

if(Meteor.isClient) {
    Meteor.startup(function () {
        Session.set('choice', 'Country 1');
    });
    function drawChart(currentCountry) {
        var quarterArr = currentCountry.country_data.yearly_distribution;
        var yArr = [];

        for (var j = 0; j < quarterArr.length; j++) {
            var str = quarterArr[j].sales;
            yArr[j] = str.substring(0, str.length - 1);

        }
        $('#bar-chart-area').highcharts({
            chart: {
                type: 'column'
            },

            xAxis: {
                categories: [
                    'Q1',
                    'Q2',
                    'Q3',
                    'Q4'
                ],
                crosshair: true
            },
            title: '',
            yAxis: {
                gridLineWidth: 0,
                min: 0,
                title: {
                    text: ''
                }
            },
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            exporting: {enabled: false},
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        color: 'gray',
                        formatter: function () {
                            return this.y + 'M';
                        }
                    }
                }


            },
            series: [{
                name: '',
                data: [{y: Number(yArr[0]), color: '#368bd1'}, {
                    y: Number(yArr[1]),
                    color: '#368bd1'
                }, {y: Number(yArr[2]), color: '#368bd1'}, {y: Number(yArr[3]), color: '#368bd1'}]

            }]
        });

    }
    Template.outer.onCreated(function(){
        this.subscribe("countrys");
    });

    Template.mainContent.onRendered(function(){
        var country = Countrys.findOne({name:'Country 1'});
        drawChart(country);
        var rightBtn = document.getElementsByClassName('glyphicon-chevron-right')[0];
        var leftBtn = document.getElementsByClassName('glyphicon-chevron-left')[0];
        var rb = new Hammer(rightBtn);
        var lb = new Hammer(leftBtn);
        rb.on("tap", function (ev) {
            var curIndex = $(".clicked")[0].dataset['index'];
            curIndex = (curIndex + 1) % 3;
            $(".country-btn").attr("class", "country-btn");
            var btn = $(".country-btn[data-index=" + curIndex + "]");
            var newChoice = btn.data('choice');
            btn.addClass('clicked');
            btn.addClass('animated fadeInRight');
            Session.set('choice', newChoice);
            var country = Countrys.findOne({name: newChoice});
            drawChart(country);
        });
        lb.on("tap", function (ev) {
            var curIndex = $(".clicked")[0].dataset['index'];
            curIndex = curIndex - 1;
            if (curIndex < 0)
                curIndex = 2;
            $(".country-btn").attr("class", "country-btn");
            var btn = $(".country-btn[data-index=" + curIndex + "]");
            var newChoice = btn.data('choice');
            btn.addClass('clicked');
            btn.addClass('animated fadeInLeft');
            Session.set('choice', newChoice);
            var country = Countrys.findOne({name: newChoice});
            drawChart(country);
        });
    });
    Template.mainContent.events({
        "click .country-btn": function (event) {
            var str = event.target.dataset['choice'];
            Session.set('choice', str);
            var countryName = str.replace(/ /g, '');
            Session.set('countryName', countryName);
            var country = Countrys.findOne({name: str});
            if (country) {
                Session.set('country', country);
                drawChart(country);
            }
            event.defaultValue = false;
        }
    });
    Template.mainContent.helpers({
        checkedOrUnchecked: function (choice) {
            return choice === Session.get('choice');
        },
        countrys: function () {
            var countries = Countrys.find();
            if (countries) {
                var newCountries = countries.fetch();
                for (var i = 0; i < newCountries.length; i++) {
                 newCountries[i].index = i;
                 }
                return newCountries;
            }
        },
        getCountryName: function () {
            if (Session.get('choice'))
                return Session.get('choice').replace(/ /g, '');
        },
        products: function () {
            var choice = Session.get('choice');
            var country = Countrys.findOne({name: choice});
            if (country) {
                return country.country_data.best_sellers;
            }
        }
    });
}

if(Meteor.isServer){
    Meteor.startup(function(){
        if (Countrys.find().count() === 0) {
            console.log("importing nets-sales.json to mongodb");

            var data = JSON.parse(Assets.getText("nets-sales.json"));

            data.forEach(function (item, index, array) {
                Countrys.insert(item);
            });
        }

        Meteor.publish("countrys", function(){
            return Countrys.find();
        });
    });
}