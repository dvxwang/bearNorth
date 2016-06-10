app.config(function ($stateProvider) {
    $stateProvider.state('survey', {
        url: '/survey/:choice',
        templateUrl: 'js/survey/survey.html',
        controller: 'SurveyCtrl'
    });
});


app.controller('SurveyCtrl',function($state,$scope,$stateParams){
	
	$(document).ready(function(){
		$(".difSelect").on('click', function(){
			if($(this).hasClass('selected')){
				$(".difSelect").removeClass('selected');
			}
			else {
				$(".difSelect").removeClass('selected');
				$(this).addClass('selected');
			}
		});
		$(".tempSelect").on('click', function(){
			if($(this).hasClass('selected')){
				$(".tempSelect").removeClass('selected');
			}
			else {
				$(".tempSelect").removeClass('selected');
				$(this).addClass('selected');
			}
		});
		$(".lenSelect").on('click', function(){
			if($(this).hasClass('selected')){
				$(".lenSelect").removeClass('selected');
			}
			else {
				$(".lenSelect").removeClass('selected');
				$(this).addClass('selected');
			}
		});
	})
	
	$scope.goToPackage = function(){
		var arr=[$stateParams.choice], qArr=['.diff','.temp','.length'];
		for (var i=0; i<qArr.length; i++){
			if($(qArr[i]+' .selected').length){
				arr.push($(qArr[i]+' .selected')[0].innerHTML);
			}
			else {
				arr.push("blank");
			}
		}
		$state.go('package', {selection: arr});
	}

})

