/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */

//var transPage = 'https://www.samsungsds.com/app/search/transnew.jsp';
//var transPage = 'http://1.214.35.19:8583/kr-ko/service/service-auto-ajax.do';
/* if(window.location.hostname == "182.198.89.25"){
  transPage = "/cn/search/trans.jsp"; // 타 언어
} */
let globalQuoteRequestFlag = false;
let GL_QUOTE_TEXT = {};
var hostname;
if (window.location.hostname === 'www.cello-square.com') {
  hostname = ''
} else {
  hostname = 'https://www.cello-square.com'
}

var input;      // 출발지, 도착지 클릭 element
var transport;  // VS(해상), AR(항공), EXP(특송)

var requestQuoteData = {};

var resultLength;
var deepValue;
var arrpVale;
let reqData = {};
let targetCountryObj;
let targetPortObj;
let promitionsType;
const quoteEloquaFormData = 'quoteEloquaFormData';
let quote_person_info;
const quote_person_info_key = "quote_person_info_key"
const TESTOPIA_AUTOMATION = "Testopia Automation Test";
let appJoinLinkQuoteResult = "";
let expressPackageData = "";
let exChargeWeight = 0;
// eslint-disable-next-line no-unused-vars
function fnCheckSearchBarEstimate(event, langCd) {
  input = $(event.target);

  transport = $("input[name='transport']:checked").val();

  var keyword = input.val();
  var inputStr = $.trim(keyword);
  var layerAll = $('.search-area .auto-search')
  var inputFocus =  $('.search-area input');
  var layerNow = input.closest('.search-area').find('.auto-search');
  var list = layerNow.find('ul > li');
  var actList = input.filter('.focus-color');
  var targetList;
  inputFocus.removeClass('focus-color');
  layerAll.hide();
  layerNow.show();

  // $(document).one('mouseup.search', function() {
  //   layerNow.hide();
  // });

  // 키 이벤트는 기존 소스를 거의 유지함.
  if (event.keyCode === 38) {
    // up
    if (actList.length) {
      targetList = actList.prev();
      actList.removeClass('focus-color');

      if (!targetList.length) {
        // 이전 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('focus-color');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':last').focus().addClass('focus-color');
      input.val(list.filter(':last').data('keyword'));
    }
  } else if (event.keyCode === 40) {
    // down
    if (actList.length) {
      targetList = actList.next();
      actList.removeClass('focus-color');

      if (!targetList.length) {
        // 다음 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('focus-color');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':first').focus().addClass('focus-color');
      input.val(list.filter(':first').data('keyword'));
    }
  } else if (event.keyCode === 37 || event.keyCode === 39) {
    // left, right
  } else if (event.keyCode === 13) {

    return;
  } else {

    buildSearchRouteReqData(event, transport, inputStr, langCd);
    // 국가, 포트명 불러오기
    autocompleteEstimate(requestQuoteData); //자동완성 호출
    input.addClass('focus-color');
    // 검색어 입력
    input.data('keyword', keyword); // 현재 검색어 저장
  }

  var del = input.next('.btn-delet');
  del.toggle(input.val().length !== 0);

  // 레이어 닫기
  $('.btn-popup-close, .btn-close').click(function() {
    layerNow.hide();
    inputFocus.removeClass('focus-color');
  });

  // 국가 선택시
  $(document).on('click', '.country-list li a', function() {
    $('.country-list li a').removeClass('check')
    $(this).addClass('check');
  });

  // 출발지, 도착지 input에 있는 삭제버튼 클릭시
  $(document).on('click', '.btn-delet', function() {
    requestQuoteData = {};
    $(this).prev().val('');
    $(this).hide();
    input.removeClass('focus-color');
    $(this).siblings('.auto-search').hide();
    fnBtnInquiryDisabledCheck();
  });

  // 레이어 안에 이전 버튼 클릭시
  $(document).on('click', '.btn-pre', function() {
    $('.country-list').show();
    $('.port-list.data').hide();
    $(this).hide();

    // 모바일에서 키패드 유지
    if (mobileCheck) {
      input.focus();
    }
  });

}

function buildSearchRouteReqData(event, transport, inputStr,langCd){
  reqData = {};
  var productMode  = transport;
  reqData["transport"] = transport;
  if(transport === 'VS'){
    productMode = $("input[type=radio][name=radio1]:checked").val();
  }
  if(transport === 'RL'){
    productMode += '-FCL';
  }
  reqData["productMode"] = productMode;
  reqData["keyWord"] = inputStr;
  //to: arrival from: departure
  if(event.target.id === 'departure'){
    if( reqData["keyWord"] === deepValue){
      reqData["keyWord"] = "";
    }
    reqData["nodeType"] =  'F';
    var toNode = $('#arrival').val();
    reqData['toNode'] = fnSubStringPortCode(toNode);
  }
  if(event.target.id === 'arrival'){
    if(reqData["keyWord"] === arrpVale){
      reqData["keyWord"] = "";
    }
    reqData["nodeType"] =  'T';
    var fromNode = $('#departure').val();
    reqData['fromNode'] = fnSubStringPortCode(fromNode);
  }
  reqData['langCd'] = langCd;

  return reqData;
}

// 검색어 입력시 자동완성
// 데이터 불러오는 부분만 수정함 (getCountryPortDataLayer)
function autocompleteEstimate(requestData) {

  var countryDataList = $('.country-list');
  var portDataList = $('.port-list.data');
  var portListTip = $('.port-list.tip');
  countryDataList.find('li').remove();
  portDataList.find('li').remove();
  portDataList.show();
  portListTip.hide();

  /*var input = $('.search-area input');
  var word = input.val();

  if (keyword === '') {
    word = '____';
  }*/

  /*word = word.replace(/\!|\@|\#|\$|\%|\^|\&|\*|\[|\]|\?|\(|\)/gi, ' ');
  word = word.replace(/\<|\>/gi, ' ');
  word = word.replace(/\+|\-/gi, ' ');
  word = word.replace(/\:|\;/gi, ' ');
  word = word.replace(/\[|\]/gi, ' ');
  word = word.replace(/\\/gi, ' ');*/

  getCountryPortDataLayer(requestData);
  fnNodeInputJudgeErrorInfo();
  fnBtnInquiryDisabledCheck();
  countryListFocus();
}


function countryListFocus(){
  $(".left-country-list li:first-child").css("background-color", "#daf8f2");
  $(".right-country-list li:first-child").css("background-color", "#daf8f2");

  // 点击子元素切换背景颜色
  $(".left-country-list li").on("click", function () {
    // 移除其他兄弟元素的背景颜色
    $(this).siblings().css("background-color", "");
    // 添加当前元素的背景颜色
    $(this).css("background-color", "#daf8f2");
  });

  // 点击子元素切换背景颜色
  $(".right-country-list li").on("click", function () {
    // 移除其他兄弟元素的背景颜色
    $(this).siblings().css("background-color", "");
    // 添加当前元素的背景颜色
    $(this).css("background-color", "#daf8f2");
  });
}

/*function countryListFocus2(){
/!*  $(".left-country-list li:first-child").css("background-color", "#daf8f2");
  $(".right-country-list li:first-child").css("background-color", "#daf8f2");

  // 点击子元素切换背景颜色
  $(".left-list-ul li").on("click", function () {
    // 移除其他兄弟元素的背景颜色
    $(this).siblings().css("background-color", "");
    // 添加当前元素的背景颜色
    $(this).css("background-color", "#daf8f2");
  });

  // 点击子元素切换背景颜色
  $(".right-list-ul li").on("click", function () {
    // 移除其他兄弟元素的背景颜色
    $(this).siblings().css("background-color", "");
    // 添加当前元素的背景颜色
    $(this).css("background-color", "#daf8f2");
  });*!/



  const leftDom = $('.left-country-list li:first a');
  console.log("leftDom", leftDom);
  leftDom.click(
      function () {
        // 添加 hover 效果
        $(this).css("background-color", "#daf8f2");
      },
      function () {
        // 移除 hover 效果
        $(this).css("background-color", "");
      }
  );



  const rightDom = $('.right-country-list li:first a');
  rightDom.click(
      function () {
        // 添加 hover 效果
        $(this).css("background-color", "#daf8f2");
      },
      function () {
        // 移除 hover 效果
        $(this).css("background-color", "");
      }
  );
  leftDom.trigger("click");
  rightDom.trigger("click");
}*/


// 출발지, 도착지 클릭 및 검색시 국가 및 포트 데이터를 불러온다.
// inputStr : 검색키워드
function getCountryPortDataLayer(requestData) {

  var countryDataList = $('.country-list');
  var portDataList = $('.port-list.data');
  var portListTip = $('.port-list.tip');

  countryDataList.find('li').remove();
  portDataList.find('li').remove();

  portDataList.show();
  portListTip.hide();

  if (mobileCheck) {

    // 모바일인 경우 국가선택시에서는 이전 버튼 히든 처리
    $('.auto-head .btn-pre').hide();

    // $('.auto-search').css('position', 'fixed');

    if (requestQuoteData["keyWord"]) {
      $('.country-list').hide();
      $('.port-list.tip').hide();
      $('.port-list.data').show();
      $('.auto-head .btn-pre').show();
    } else {
      $('.country-list').show();
      $('.port-list.tip').show();
      $('.port-list.data').hide();
    }
  }

  var url = hostname + "/" + requestData["langCd"] + "/estimate/ajax-getQuoteCountryRoute.do"
  $.ajax({
    //type: 'POST',

    url : url,
    type : "GET",
    async: false,
    dataType : 'json',
    data : requestData,
    error: function(xhr, status, error) {
      //console.log(status);
      //console.log(xhr);
      // console.log(error);
      //alert(ajaxErrorMsg);
    },
    success: function(result) {

      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }
      if(transport === 'EXP'){
        var continentList = result['expContinentList'];
        var countryExpList = result['expCountryList'];
        resultLength = continentList.length;
        $(continentList).each(function (i){
          var continentCd = continentList[i]['continentCd']
          var continentNm = continentList[i]['continentNm']

          countryDataList.append(
              '<li><a href=\'javascript: getPortDataLayer("'+continentCd+'","'+EscapeChar(continentNm)+'")\'>'+
              '    <p>'+ continentNm +'</p>'+
              '</a></li>'
          );
        });
        $(countryExpList).each(function (i){
          var nationNm = countryExpList[i]['nationNm'];
          var nationCd = countryExpList[i]['nationCd'];
          var nationSeqNo = countryExpList[i]['nationSeqNo'];
          var nationVal = nationNm + "(" + nationCd + ")";
          var imgUrl = hostname + "/countryImgView.do?nationSeqNo=" + nationSeqNo;
          portDataList.append(
              '<li><a href=\'javascript: fnSelectConfirmData("'+EscapeChar(nationVal)+'")\'>'+
              '    <i><img src="'+imgUrl+'" /></i>'+
              '    <em>'+ nationVal +'</em>'+
              '</a></li>'
          );
        });
      }else {
        var countryList = result['countryList'];
        resultLength = countryList.length;
        var portist = result['nodeList']

        var nodeCountryNm;
        $(countryList).each(function (i){

          var countryNm = countryList[i]['countryNm'] + "(" + countryList[i]['nationCd'] +")";
          if(i == 0){
            nodeCountryNm = countryNm;
          }
          var nationSeqNo = countryList[i]['nationSeqNo'];
          var imgUrl = hostname + "/countryImgView.do?nationSeqNo=" + nationSeqNo;
          countryDataList.append(
              '<li><a href=\'javascript: getPortDataLayer("'+nationSeqNo+'","'+EscapeChar(nodeCountryNm)+'")\'>'+
              '    <i><img src="'+imgUrl+'" /></i>'+
              '    <p>'+ countryNm +'</p>'+
              '</a></li>'
          );
        });

        $(portist).each(function (i){
          let portName = portist[i]["nodeEngNm"];
          let airportCityNm = portist[i]["airportCityNm"];

          let nodeCd = portist[i]["nodeCd"];

          let portNodeVal;
          let countryVal = nodeCountryNm;
          if(requestQuoteData['transport'] === 'AR'){
            if(portName){
              portNodeVal = portName + "(" + nodeCd + ")";
            }else {
              portNodeVal = nodeCd;
            }

            if(airportCityNm){
              countryVal =  airportCityNm + ", " + nodeCountryNm;
            }

          }else {
            portNodeVal = portName + "(" + nodeCd + ")";
          }
          var className = requestQuoteData["keyWord"] ? "portNodeVal-color" : "";

          portDataList.append(
              '<li><a href=\'javascript: fnSelectConfirmData("'+EscapeChar(portNodeVal)+'")\'>'+
              '<i></i>'+
              '<div class="inner">'+
              '    <p class= '+className+'>'+portNodeVal+'</p>'+
              '    <span>'+countryVal+'</span>'+
              '</div>'+
              '</a></li>'
          );
        });
      }

    }
  });
}

// 국가선택시 포트 데이터를 불러온다.
function getPortDataLayer(nationSeqNo, nodeCountryNm) {


  var portDataList = $('.port-list.data');
  var portListTip = $('.port-list.tip');

  portDataList.find('li').remove();
  portListTip.hide();
  portDataList.show();

  if (mobileCheck) {
    $('.country-list').hide();
    $('.port-list.tip').hide();
    $('.port-list.data').show();
    $('.auto-head .btn-pre').show();
    // 모바일에서 키패드 유지
    input.focus();
  }

  var url = hostname + "/" + requestQuoteData["langCd"] + "/estimate/ajax-getQuoteNodeRoute.do"
  $.ajax({
    type: 'GET',
    url  : url,
    data : requestQuoteData,
    error: function(xhr, status, error) {
      console.log(error);
    },
    success: function(result) {

      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }
      if(transport === 'EXP'){
        var countryExpList = result['expCountryList'];
        $(countryExpList).each(function (i){
          var nationNm = countryExpList[i]['nationNm'];
          var nationCd = countryExpList[i]['nationCd'];
          var imgUrl = hostname + "/countryImgView.do?nationSeqNo=" + countryExpList[i]['nationSeqNo'];
          var nationVal = nationNm + "(" + nationCd + ")";
          portDataList.append(
              '<li><a href=\'javascript: fnSelectConfirmData("'+EscapeChar(nationVal)+'")\'>'+
              '    <i><img src="'+imgUrl+'" /></i>'+
              '    <em>'+ nationVal +'</em>'+
              '</a></li>'
          );
        });
      }else {
        var portist = result['nodeList']
        $(portist).each(function (i){
          var nodeFrontCountryNm = portist[i]["nationNm"] + "(" + portist[i]["nationCd"] + ")";
          let portName = portist[i]["nodeEngNm"];
          let airportCityNm = portist[i]["airportCityNm"];
          let nodeCd = portist[i]["nodeCd"];

          let portNodeVal;
          let countryVal = nodeFrontCountryNm;
          if(requestQuoteData['transport'] === 'AR'){
            if(portName){
              portNodeVal = portName + "(" + nodeCd + ")";
            }else {
              portNodeVal = nodeCd;
            }
          if(airportCityNm){
            countryVal =  airportCityNm + ", " + nodeFrontCountryNm;
          }
          }else {
            portNodeVal = portName + "(" + nodeCd + ")";
          }
          var className = requestQuoteData["keyWord"] ? "portNodeVal-color" : "";
          portDataList.append(
              '<li><a href=\'javascript: fnSelectConfirmData("'+EscapeChar(portNodeVal)+'")\'>'+
              '<i></i>'+
              '<div class="inner">'+
              '    <p class='+className+'>'+portNodeVal+'</p>'+
              '    <span>'+countryVal+'</span>'+
              '</div>'+
              '</a></li>'
          );
        });
      }
    }
  });
}

function EscapeChar(HaveSpecialval) {
  //转换半角单引号
  HaveSpecialval = HaveSpecialval.replace(/\'/g, "\\\'");

  //也可以使用&acute;
  HaveSpecialval = HaveSpecialval.replace(/\'/g, "&acute;");
  return HaveSpecialval;
}

function fnSearch(keyword) {
  var input = $('.search-area input');
  $(document).off('mouseup.search');

  input.val(keyword);

  alert('serach : ' + keyword);
}

// 검색 초기화
function fnSearchInit() {
  requestQuoteData = {};
  $('.search-area input').val('');
  $('.search-area input').removeClass('focus-color');
  $('.search-area .auto-search').hide();
  $('#freightInfo').val(1);
  $('#freightInfoExpress').val("");
  fnSingleDisplayByName("freightInfo-error",-1);
  $('#freightInfo').removeClass("error")
  $('#freightInfoExpress').removeClass("error")
  $('#departure-form-con-info').hide();
  $('#departure-auto-search').hide();
  $('#departure').removeClass("error")
  $('#arrival-form-con-info').hide();
  $('#arrival-auto-search').hide();
  $('#arrival').removeClass("error")
  $("div[name=freightUnit]").each(function () {
    $(this).addClass("disabled");
  });
}

function transportChange(val, langCd) {
  $('.selectWrap.new-select-style .ui-selectmenu-text').text($('#FCL-select option:first').text());
  $('#FCL-select').val($('#FCL-select option:first').val());
  $("#freightInfoExpress").hide();
  $("#ocean-radio").hide();
  $("#freightInfo").hide();
  var placeholderVal = "";
  var freightUnitIndex;
  if(val === "VS"){
    $("#ocean-radio").show();
    $("#freightInfo").show();
    if('kr-ko' === langCd){
      placeholderVal = '항구명 선택 또는 검색(국/영문)';
    }else if('mx-es' === langCd){
      placeholderVal = 'Selecciona o busca un puerto';
    }else if('vn-vi' === langCd){
      placeholderVal = 'Chọn/Tìm kiếm Cảng';
    }else {
      placeholderVal = "Selector search a port";
    }
    var oceanRadioVal = $("input[type=radio][name=radio1]:checked").val();
    freightUnitIndex = getFreightUnitIndexByOcean(oceanRadioVal);
  }
  if(val === "AR"){
    $("#freightInfo").show();
    if('kr-ko' === langCd){
      placeholderVal = '공항명 선택 또는 검색(국/영문)';
    }else if('vn-vi' === langCd){
      placeholderVal = 'Chọn/Tìm kiếm Cảng bay';
    }else {
      placeholderVal = "Selector search a airport";
    }
    freightUnitIndex = 2;

  }
  if(val === "RD"){
    $("#freightInfo").show();
    $("#freightInfo").show();
    if('kr-ko' === langCd){
      placeholderVal = '';
    }else {
      placeholderVal = "Selecciona o busca un puerto";
    }

    freightUnitIndex = 3;
  }
  if(val === "EXP"){
    $("#freightInfoExpress").show();
    $("#freightInfoExpress").attr('type', 'text');
    if('kr-ko' === langCd){
      placeholderVal = '국가 선택 또는 검색(국/영문)';
    }else {
      placeholderVal = "Selector search a country";
    }
    freightUnitIndex = 2;
  }
  $("#departure").attr("placeholder",placeholderVal);
  $("#arrival").attr("placeholder",placeholderVal);

  fnSingleDisplayByName('freightUnit', freightUnitIndex);
  fnBtnInquiryDisabledCheck();
}

// 배송 수단 선택시(해상, 항공, 특송)
function fnTransportType(langCd) {
  $('.search-area input').val('');
  fnSearchInit();
  var transportVal = $("input[type=radio][name=transport]:checked").val();
  transportChange(transportVal, langCd);
}

// 포트 선택시 input 상자에 데이터 넣기
function fnSelectConfirmData(port) {
  var inputId = input.attr("id");
  if(inputId === 'departure'){
    deepValue = port;
  }else{
    arrpVale = port;
  }

  input.val(port);
  input.siblings('.btn-delet').hide();
  input.siblings('.auto-search').hide();
  fnBtnInquiryDisabledCheck();
}

/**
 * 키보드 언어 탭  Click Function
 *
 * 최초 로딩시 PC : KOR, ENG All Show
 *            Mobile : KOR show
 * @Date 2023.03.06
 */




fnSingleDisplayByName = function (name,index) {
  $("div[name="+name+"]").each(function (i){
    if (i == index){
      $(this).show();
    } else {
      $(this).hide();
    }
  });
};

function oceanRadioClick(value){
  $('.selectWrap.new-select-style .ui-selectmenu-text').text($('#FCL-select option:first').text());
  $('#FCL-select').val($('#FCL-select option:first').val());
  fnSearchInit();
  fnBtnInquiryDisabledCheck();
  var freightUnitIndex = getFreightUnitIndexByOcean(value);
  fnSingleDisplayByName('freightUnit', freightUnitIndex);
}

function getFreightUnitIndexByOcean(val){
  var freightUnitIndex;
  if("VS-FCL" === val){
    freightUnitIndex = 0;
  }else {
    freightUnitIndex = 1;
  }
  return freightUnitIndex;
}

fnSubStringPortCode = function (PortName) {
  if(PortName.indexOf("(") >= 0){
    return PortName.substring(PortName.lastIndexOf("(")+1,PortName.lastIndexOf(")"));
  }
  return PortName;
};

fnNodeInputJudgeErrorInfo = function () {
  var nodeInputId = input.attr('id');
  var value = input.val();
  /*if (nodeInputId === 'departure') {
    if (value === deepValue) {
      $('#departure-form-con-info').hide();
      $('#departure-auto-search').hide();
      $('#departure').removeClass("error");
      return;
    }
  }
    if (nodeInputId === 'arrival') {
      if (value === arrpVale) {
        $('#arrival-form-con-info').hide();
        $('#arrival-auto-search').hide();
        $('#arrival').removeClass("error");
        return;
      }
    }*/

    if (resultLength === 0) {
      if (nodeInputId === 'departure') {
        $('#departure-form-con-info').show();
        $('#departure-auto-search').hide();
        $('#departure').addClass("error")
      } else {
        $('#arrival-form-con-info').show();
        $('#arrival-auto-search').hide();
        $('#arrival').addClass("error")
      }

    } else {
      if (nodeInputId === 'departure') {
        $('#departure-form-con-info').hide();
        $('#departure').removeClass("error")
      } else {
        $('#arrival-form-con-info').hide();
        $('#arrival').removeClass("error")
      }
    }

}

$("#freightInfo").bind('change keyup blur',function (e) {

  var freightInfo = $(this).val();
  var index;
  var transport = $("input[name='transport']:checked").val();

  var value = $("input[type=radio][name=radio1]:checked").val()

  if (transport == 'VS' && $("input[type=radio][name=radio1]:checked").val() == "VS-LCL" && freightInfo > 43) {
    index = 0;
    $(this).addClass("error");
  } else if ( transport == "AR" && freightInfo > 500) {

   index = 1;
    $(this).addClass("error");
  } else {
    index = -1;
    $(this).removeClass("error");
  }

  fnSingleDisplayByName("freightInfo-error",index);
  if(freightInfo.trim() != ""){
    $("div[name=freightUnit]").each(function () {
      $(this).removeClass("disabled");
    });
  } else {
    $("div[name=freightUnit]").each(function () {
      $(this).addClass("disabled");
    });
  }

  fnBtnInquiryDisabledCheck();
});

fnBtnInquiryDisabledCheck = function () {
  var transport = $("input[name='transport']:checked").val();
  var flag = false;
  if(transport === 'VS'){
    flag = $("#freightInfo").val() <= 0;
    if($("input[type=radio][name=radio1]:checked").val() == "VS-LCL"){
      flag = $("#freightInfo").val() > 43;
    }
  }else if(transport === 'EXP'){
    flag = $("#freightInfoExpress").val() > 500 || $("#freightInfoExpress").val() <= 0;
  }else {
    flag = $("#freightInfo").val() > 500 || $("#freightInfo").val() <= 0;
  }

  var freFlag = false;
  if ($("#departure").val().trim() == "" ||
      $("#arrival").val().trim() == "" ||
      $("#freightInfo").val().trim() == "" || flag) {

    $("#btnInquiry").attr("disabled",true);
  } else {
    freFlag = true;
    $("#btnInquiry").attr("disabled",false);
  }


  if(freFlag){
    $("div[name=freightUnit]").each(function () {
      $(this).removeClass("disabled");
    });
  } else {
    $("div[name=freightUnit]").each(function () {
      $(this).addClass("disabled");
    });
  }
};


function estimateAutoUrlCopy(url){
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = url;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    let langCd = getLangCdByUrlSplit();
    if(langCd === 'en'){
      alert("The URL has been copied to your clipboard.");
    }else if(langCd === 'vn'){
      alert("URL đã được lưu trữ vào bộ nhớ tạm của bạn.");
    }else if(langCd === 'es'){
      alert("URL copiado al portapapeles.");
    }else {
      alert("URL이 클립보드에 복사되었습니다.");
    }
};

function getCountryTransModeAjax(event,searchNation){
  if(searchNation === undefined) {
    searchNation = '';
  }
  if(event) {

    let input = $(event.target)
    let del = input.next('.btn-delet');
    del.toggle(input.val().length !== 0);
    del.click(function() {
      input.val('');
      del.hide();
    });
  }

  $.ajax({
    type: 'GET',
    url  : "/estimate/getQuoteCountryAjax.do?searchNation=" + searchNation,
    async: false,
    error: function(xhr, status, error) {
      console.log(error);
    },
    success: function(result) {
      $('.head-country-list').children().remove();
      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }
      let text = "";

      $.each(result.data, function (index, obj) {
        let src = "/countryImgView.do?nationSeqNo=" + obj.nationSeqNo;
        text += `<li >
                      <a href="#" value="${obj.nationCd}">
                        <i><img src="${src}" alt="${obj.nationNm}"></i>
                        <p>${obj.nationNm}</p>
                      </a>
                    </li>`;
      });
      if(text != ''){
        $('.head-no-list').hide();
        $('.head-country-list').append(text);
        $('.head-country-list').show();
      }else{
        $('.head-country-list').hide();
        $('.head-no-list').show();
      }
    }
  });
}

function getTransModeByNationCdAjax(nationCd){
  let quoteData = getGlobalData("estimateResponseData");
  if(!quoteData){
    removeQuoteResult();
  }
  let langCd = getLangCdByUrlSplit();
  $.ajax({
    async: false,
    type: 'GET',
    url  : "/estimate/getTransModeByNationCdAjax.do?nationCd=" + nationCd + "&langCd=" + langCd,
    error: function(xhr, status, error) {
      console.log(error);
    },
    success: function(result) {
      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }
      $('#nationCd').val(nationCd);
      // [Zendesk] 用户手动切换国家时，更新 sessionStorage
      sessionStorage.setItem('QUOTE_NATION_CD', nationCd);
      let text = "";
      let transmode = $('[name="transport"]');
      transmode.each((ind, obj) => {
        $(obj).parent().hide();
      });
      $('#type-fcl').parent().hide();
      $('#type-lcl').parent().hide();
      if(nationCd === 'KR' /*|| nationCd === 'CN'*/){
        $('#type-express1-1').parent().show();
      }
      let vsRadio = [];
      $.each(result.data, function (index, obj) {
        const cd = obj.cd.split('-');
        if(cd.length > 1){
          //FCL, LCL 的展示
          if(vsRadio.indexOf(cd[1]) === -1){
            vsRadio.push(cd[1]);
          }
        }
        $(`[name="transport"][value="${cd[0]}"]`).parent().show();
      });
      $('#FCL-select option').remove();
      $.each(result.unitList, function (index, obj){
          $('#FCL-select').append(`<option value="${obj.cd}">${obj.defaultCdName}</option>`)
      });
      if(vsRadio.length > 1){
        $('#type-fcl').click();
        $('#type-fcl').parent().show();
        $('#type-lcl').parent().show();
      }
      selectInt();
      $('#FCL-select+#FCL-select-button+.ui-selectmenu-menu .ui-menu-item:first').click();
      //$('.ui-menu-item:first').click();

    }
  });
  $('.transport-type input[type="radio"]:first').click();
  resetQuoteInput();

}


$(document).on("click","#FCL-select-button",function(){
  $('#FCL-select-button .ui-selectmenu-text').text($("#FCL-select-menu .ui-menu-item a[aria-selected='true']").text());
})
$(document).on("click","#FCL-select-menu li",function(){
  $('#FCL-select-button .ui-selectmenu-text').text($(this).find("a").text());
})

function autoPortFirst(event){
  transport = $("input[name='transport']:checked").val();
  let input = $(event.target);
  // check is arrival input or departure input
  const checkPortType = input.prop('id');
  console.log('$(\'#nationCd\').val()', $('#nationCd').val())
  reqData = buildSearchRouteReqData(event, transport, $.trim(input.val()), $('#nationCd').val());
  closeAutoSearch();
  if(mobileCheck){
    $('.port-list').hide();
  }
  $('.country-list').show();
  if(reqData['nodeType'] === "F"){
      $('#departure-auto-search').show();
  }else {
    $('#arrival-auto-search').show();
  }
  const container_quote = $(".quote-query-container");
  if(container_quote.length === 1) {
    targetCountryObj = event.target.id === 'departure' ? $('.quote-query-container .country-list')[0] :  $('.quote-query-container .country-list')[1];
    targetPortObj = event.target.id === 'departure' ? $('.quote-query-container .auto-port-list')[0] :  $('.quote-query-container .auto-port-list')[1];
  } else {
    targetCountryObj = event.target.id === 'departure' ? $('.country-list')[0] :  $('.country-list')[1];
    targetPortObj = event.target.id === 'departure' ? $('.auto-port-list')[0] :  $('.auto-port-list')[1];
  }
  $(targetCountryObj).children().remove();
  $(targetPortObj).children().remove();
  const $target = $('#quote-container-div');
  if($target.length > 0) {
    // 注释promition 详情页面过滤出发地到达地显示逻辑
    // reqData['promotionType'] = "promotionType";
    reqData['checkPortType'] = checkPortType;
  }
  const $radio = $target.find('#type-lcl');
  let isChecked = $radio.is(':checked');
  const emValue = $('.country em').text();
  console.log("reqData", reqData);
  $.ajax({
    type : 'GET',
    data : reqData,
    url  : "/estimate/ajax-getQuoteRouteInit.do",
    error: function(xhr, status, error) {
      console.log(error);
    },
    success: function(result) {
      $(targetCountryObj).children().remove();
      $(targetPortObj).children().remove();
      if (typeof result !== 'object') {
        result = JSON.parse(result);
        // 注释promition 详情页面过滤出发地到达地显示逻辑
        // console.log('country list ----> ', result)//text를 javascript 객체로 변환
        // if ($target.length !== 0 && isChecked && transport === 'VS' && emValue === 'Korea, Republic of') {
        //   if (checkPortType === 'departure') {
        //     result.countryList = result.countryList.filter(item => item.nationSeqNo === '318');
        //     result.nodeList = result.nodeList.filter(item => item.nodeCd === 'KRPUS');
        //   } else if (checkPortType === 'arrival') {
        //     result.countryList = result.countryList.filter(item => ['361', '311', '412', '304'].includes(item.nationSeqNo));
        //     result.nodeList = result.nodeList.filter(item => ['INMAA', 'USLGB', 'NLRTM', 'JPTYO', 'JPOSA'].includes(item.nodeCd));
        //   }
        // }
      }
      let text = "";
      let countryNm = "";
      if('EXP' != transport){
        if(result.countryList.length > 0){
          countryNm = result.countryList[0]['countryNm'] + "(" + result.countryList[0]['nationCd'] +")";
        }
      }

      expAutoFirst(result);
      //country-list
      $.each(result.countryList, function (index, obj) {
          let src = "/countryImgView.do?nationSeqNo=" + obj.nationSeqNo;
          let classNm = obj.nationCd === reqData['langCd'] ? 'active' : '';
          let countryNmCd = EscapeChar(obj.countryNm + '(' + obj.nationCd + ')');
          text += `<li>
                      <a onclick="autoPortList('${obj.nationSeqNo}', '${countryNmCd}', this)" class="${classNm}" data-v="${obj.nationSeqNo}">
                        <i><img src="${src}" alt="${obj.countryNm}"></i>
                        <p>${obj.countryNm}</p>
                      </a>
                   </li>`;

      });
      $(targetCountryObj).append(text);
      //port-list
      appendPortList(result, countryNm);
    }
  });
}

function autoPortList(nationSeq, countryNm, ele){
  $(".country-list li a").removeClass('active')
  $(ele).addClass('active');
  let input = $(ele);
  // check is arrival input or departure input
  const checkPortType = input.prop('id');
  $(targetPortObj).children().remove();
  let transport = $("input[name='transport']:checked").val();
  if(transport === 'EXP'){
    reqData["continentCd"] = nationSeq;
  }else {
    reqData["nationSeqNo"] = nationSeq;
  }
  const $target = $('#quote-container-div');
  if($target.length > 0) {
    // 注释promition 详情页面过滤出发地到达地显示逻辑
    // reqData['promotionType'] = "promotionType";
    reqData['checkPortType'] = checkPortType;
  }
  $.ajax({
    type : 'GET',
    data : reqData,
    url  : "/estimate/new-ajax-getQuoteNodeRoute.do",
    error: function(xhr, status, error) {
      console.log(error);
    },
    success: function(result) {
      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }

      appendPortList(result, countryNm);
    }
  });
  if (mobileCheck) {
    $('.auto-port-list').show();
    $('.country-list').hide();
  }
};

function appendPortList(result, countryNm){
  let portText = '';
  $.each(result.nodeList, function (index, obj) {
    let portName =obj.nodeEngNm;
    let airportCityNm = obj.airportCityNm;
    let nodeCd = obj.nodeCd;
    let portNodeVal;
    let countryVal = countryNm;
    if(reqData.transport === 'AR'){
      if(portName){
        portNodeVal = portName + "(" + nodeCd + ")";
      }else {
        portNodeVal = nodeCd;
      }
      if(airportCityNm){
        countryVal =  airportCityNm + ", " + countryNm;
      }
    }else {
      portNodeVal = portName + "(" + nodeCd + ")";
    }
    var className = reqData.keyword ? "keyword" : "";
    portNodeVal = EscapeChar(portNodeVal)
    portText += `<li>
                    <a href="javascript: fnSelectPort('${portNodeVal}')" class="${className}">
                      <i></i>
                      <div class="inner">
                        <p>${portNodeVal}</p>
                        <span>${countryVal}</span>
                      </div>
                    </a>
                  </li>`;
  });
  if(portText != ''){
    $(targetPortObj).append(portText);
  }
  let countryExpText = '';
  //exp countryList
  $.each(result.expCountryList, function (index, obj) {
    var nationNm = obj.nationNm;
    var nationCd =obj.nationCd;
    var nationVal = nationNm + "(" + nationCd + ")";
    var imgUrl = "/countryImgView.do?nationSeqNo=" + obj.nationSeqNo;
    nationVal = EscapeChar(nationVal);
    countryExpText += ` <li>
                          <a href="javascript: fnSelectPort('${nationVal}')" >
                              <i><img src="${imgUrl}" alt="${nationNm}"></i>
                              <p>${nationVal}</p>
                          </a>
                      </li>`

  });
  $(targetPortObj).append(countryExpText);
  checkDepArrInputClose();
  checkErrorText(result);
  btnGetQuoteDisabledCheck();
  console.log('mobileCheck', mobileCheck);

}

function closeAutoSearch(){
  $('#departure-auto-search').hide();
  $('#arrival-auto-search').hide();
};

function fnSelectPort(val){

  if(reqData.nodeType === 'F'){
    deepValue = val;
    $('#departure').val(val);
  }else{
    arrpVale = val;
    $('#arrival').val(val);
  }
  closeAutoSearch();
  checkDepArrInputClose();
  btnGetQuoteDisabledCheck();
}

$(".country-list li a").on("click", function () {
  // 移除其他兄弟元素的背景颜色
  $(this).siblings().removeClass('active');
  // 添加当前元素的背景颜色
  $(this).addClass('active');
});

// 点击子元素切换背景颜色
$(".right-country-list li a").on("click", function () {
  $(this).siblings().removeClass('active');
  // 添加当前元素的背景颜色
  $(this).addClass('active');
});

function expAutoFirst(result){

  let continentText = '';
  $.each(result.expContinentList, function (index, obj) {
    let classNm = index === 0 ? 'active' : '';
    let continentNm = EscapeChar(obj.continentNm);
    continentText += `<li>
                      <a onclick="autoPortList('${obj.continentCd}', '${continentNm}', this)" class="${classNm}", data-v="${obj.continentCd}">
                        <p>${obj.continentNm}</p>
                      </a>
                   </li>`;

  });
  $(targetCountryObj).append(continentText);
}

function checkDepArrInputClose(){
  if($('#departure').val() === undefined){
    return;
  }
  if($('#departure').val().length > 0){
    $('#departure-delet').show();
  }else {
    $('#departure-delet').hide();
  }
  if($('#arrival').val() === undefined){
    return;
  }
  if($('#arrival').val().length > 0){
    $('#arrival-delet').show();
  }else {
    $('#arrival-delet').hide();
  }
}

function clearInputVal(id){
  $('#' + id).val('');
  checkDepArrInputClose();
  btnGetQuoteDisabledCheck();
}

function checkErrorText(result){
  if(reqData['nodeType'] === "F"){
    $('#departure-auto-search').show();
  }else {
    $('#arrival-auto-search').show();
  }
  let errorObj = reqData.nodeType === 'F' ? $('#departure-error-text') : $('#arrival-error-text');
  let searchListObj = reqData.nodeType === 'F' ? $('#departure-auto-search') : $('#arrival-auto-search');
  let nationVal = $('#nationCd').val();
  let selNationObj = $(`.head-country-list > li > a[value='${nationVal}']`);
  let errorFrontObj = errorObj.children(':first');
  let text = '';
  let langCd = getLangCdByUrlSplit();
  if(selNationObj.length < 1){
    //no select country
    if(globalQuoteRequestFlag){
        text = GL_QUOTE_TEXT.q006;
    }else {
      if('en' === langCd){
        text = 'Please select the country of your business first.';
      }
      if('kr' === langCd){
        text = '사업자가 위치한 국가를 선택해 주세요.';
      }
      if('es' === langCd){
        text = 'Por favor, seleccione el país de su negocio.';
      }
      if('vn' === langCd){
        text = 'Vui lòng chọn quốc gia của doanh nghiệp bạn.';
      }
    }

    errorFrontObj.text(text);
    errorObj.show();
    searchListObj.hide();
    return;
  }
  if((result.nodeList !== undefined && result.nodeList.length > 0) || (result.expCountryList !== undefined && result.expCountryList.length > 0)){
    errorObj.hide()
  }else {
    if(globalQuoteRequestFlag){
      text = GL_QUOTE_TEXT.q017;
    }else {
      if('en' === getLangCdByUrlSplit()){
        text = 'No search results found.';
      }
      if('kr' === getLangCdByUrlSplit()){
        text = '결과를 찾을 수 없습니다.';
      }
      if('es' === getLangCdByUrlSplit()){
        text = 'No se encontraron resultados.';
      }
      if('vn' === getLangCdByUrlSplit()){
        text = 'Không tìm thấy kết quả.';
      }
    }

    errorFrontObj.text(text);
    errorObj.show();
    searchListObj.hide();
  }
}

function freightInfoCheck(val){

  $('#kg-error-text').hide();
  $('#cbm-error-text').hide();

  console.log("val", val);
  const transport = $("input[name='transport']:checked").val();
  if("VS" === transport){
    const productMode = $("input[type=radio][name=radio1]:checked").val();
    if('VS-LCL' === productMode){
      if(val > 43) {
        $('#cbm-error-text').show();
      }
    }
  }else {
    if("RL" != transport) {
      if (val > 500) {
        $('#kg-error-text').show();
      }
    }
  }
  btnGetQuoteDisabledCheck();
}

function btnGetQuoteDisabledCheck(){
  let flag = $('#cbm-error-text').is(':hidden') &&  $('#kg-error-text').is(':hidden') && $("#departure").val().trim() !== '' && $("#arrival").val().trim() !== '' && ($('#freightInfo').val() > 0 || $('#freightInfo_text').val()) &&  $('#nationCd').val();
  if(flag){
    $("#btn-get-quote").attr("disabled",false);
  }else {
    $("#btn-get-quote").attr("disabled", true);
  }
  return flag;
}

function btnQuotePersonTerms(flag, langCd){
  let paramMap = getUrlParameters();
  if($('#nationCd').val() === 'CN' || quote_person_info || 'SDS' === paramMap.internal){
    getQuote(flag, langCd);
    return;
  }
  if(flag === 'estimate'){
    $('#popup_personal_info').getInstance().open();
    return;
  }
  if(flag === 'main'){
    $('.personal-info-wrap').show();
  }
}

function getTermsInfo(langCd, type){
  const url = ctxs +"/"+ langCd +"/get-terms-info.do?type=popup_term0" + type;
  $("#terms-info-container").load(url,function(response, status, xhr){
    if (status === "error") {
      isTermsLoading = false;
      return;
    }
    setTimeout(()=> {
      window.cqui && window.cqui.initTermsPopup();
      $('#popup_term0'+ type).getInstance().open();
      $(".term-box").scrollTop(0);
      isTermsLoading = false; 
    },500)
  });
}

function personInfoClose(flag){
  if(flag === 'estimate'){
    $('#popup_personal_info').getInstance().close();
    return;
  }
  if(flag === 'main'){
    $('.personal-info-wrap').hide();
  }
}

function btnPreClick(){
  $('.auto-port-list').hide();
  $('.country-list').show();
}

function getQuote(estimateFlag, langCd){
  removeQuoteResult();
  showLoading(()=>{
    setTimeout(()=> {
      sendQuote(estimateFlag, langCd)
    },200)
  })
};

function sendQuote(estimateFlag, langCd){
  let requestData = getQuoteRequestData(langCd)
  let result ;
  $("#lcl-call-fcl-result").remove();
  $('#lcl-express').remove();
  $('#air-express').remove();
  if($('#base-quote-result').css('margin-top') === "100px"){
    $('#base-quote-result').css('margin-top', '0');
  }
  $.ajax({
    url : "/sendQuote.do",
    type : "POST",
    dataType : 'json',
    data : requestData,
    async : false,
    contentType : "application/x-www-form-urlencoded; charset=UTF-8",
    success : function(data) {
      offLoading();
      console.log('sendQuote-result', data);
      if(estimateFlag === 'estimate' || globalQuoteRequestFlag){
        buildQuoteResult(data, langCd);
      }
      result = data;
      if(data && data.openApiQuoteRequest){
          console.log('openApiQuoteRequest', data.openApiQuoteRequest);
      }
     /* clearGlobalData("estimateResponseData");*/
    },
    error : function() {
      offLoading();
      quoteFail();
    }
  });

  if(quote_person_info === undefined && requestData.routeNation !== 'CN'){
    quote_person_info = getQuotePersonInfoData(langCd);
  }
  if(quote_person_info){
    let eloquaFormData = buildQuoteEloquaData(requestData, result, quote_person_info);
    if(estimateFlag === 'main'){
        setGlobalData(quoteEloquaFormData, eloquaFormData);
        setGlobalData(quote_person_info_key, quote_person_info);
    }else {
      try {
        sendQuoteEloqua(eloquaFormData);
      }catch (e){
        console.log('eloqua-error-info', e);
      }
    }
  }
  if(estimateFlag === 'main' && result.status === 'success' && result.quoteList.length > 0){
    saveQuoteData(requestData, result, langCd);
  }
  if(estimateFlag === 'main' && (result.status !== 'success' || result.quoteList.length < 1)){
    sendQuoteEloqua(getGlobalData(quoteEloquaFormData))
    quoteFail();
  }
};

function buildQuoteResult(data, langCd){
    let transport = $("input[name='transport']:checked").val();
    if(data.status === 'Limit Exceeded'){
        console.log('Remote quote api limit exceeded');
        quoteFail();
        //popup
        return;
    }
    if(data.status === 'success'){
      const list = data.quoteList
      if(list.length > 0){
        if ($("#express-quote-contact-content").length) {
          $("#express-quote-contact-content").show();
        };
        $('#quote-result-id').show();
        $('#base-quote-result').show();
        $('#base-transport-result').show();
        $('html,body').animate({scrollTop: $('#quote-result-id').offset().top - (window.screen.height / 2 - 338)}, 500);
        const routeClass = getRouteResultClassNm(transport);
        let quoteReqData = getQuoteRequestData(langCd);
        joinLocationAutoEstimateUrl(quoteReqData);
        let tcdX = (transport === 'AR' || transport === 'EXP') ? '' : 'x ';
        let routeText =
              `<div class="route ${routeClass}  quote-result-remove"><!-- 해상일때 ocean, 항공일 때 flight 클래스 추가 -->
                    <span class="depart-country"><b>${list[0].nationCd}</b> ${list[0].deppNm}</span>
                    <span class="arrow"></span>
                    <span class="arrive-country"><b>${list[0].arrNationCd}</b> ${list[0].arrpNm}</span>
                </div>
                <div class="weight-box  quote-result-remove">
                    <div id="freight_weight">${quoteReqData.freightInfo}</div>
                    <div id="freight_unit">${tcdX}${quoteReqData.tcd}</div>
                </div>`;
        let serverResult = '';
        $.each(list, function (index, obj){
            if(langCd === 'en'){
              promotionText = `Promotional Price`;
            }else if(langCd === 'es'){
              promotionText = `Precio Promocional`;
            }else if(langCd === 'vn'){
              promotionText = `Giá Khuyến Mãi`;
            }else if(langCd === 'kr'){
              promotionText = `프로모션 특가`;
            }
            if(!obj.promotionCode){
              promotionText = '';
            }
            serverResult += `<li>
                                <span class="company">${obj.carrierName}</span>
                                <span class="price">
                                  <div>
                                    <div class="price-add">${obj.originalPrice?.mainCurrency || ''} ${obj.originalPrice?.quoteFare || ''}</div>
                                    ${obj.mainCurrency} ${obj.total}
                                    <i>${promotionText}</i>
                                  </div>
                                </span>
                              </li>`;

        });
        let baseResultText = `※ 터미널 화물 처리 비용, 항만 사용료 등 부대비용이 제외된 금액입니다.<br>
                    <span class="spaces-span mo-hidden"></span>부대비용까지 확인하고 싶다면? <br class="mo-br"><a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">첼로스퀘어 회원가입</a>으로 한눈에 확인하세요.
                    ${quoteReqData.freightInfo >= 10 && quoteReqData.svcClassCd === "LCL" ? '<br>※ 10CBM 이상일 경우 분할 선적될 수 있습니다.' :''}
                </p>`;
        if(langCd === 'en'){
          baseResultText = `※ The additional charges such as the terminal handling charge and the wharfage charge are excluded in the price.<br>
                    <span class="spaces-span mo-hidden"></span>If you want to check the additional charges as well, <br class="mo-br"><a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">sign up</a> to view everything at a glance!
                    ${quoteReqData.freightInfo >= 10 && quoteReqData.svcClassCd === "LCL" ? '<br>※ Shipments over 10 CBM may be split into multiple consignments.' :''}
                </p>`;
        }else if(langCd === 'es'){
          baseResultText = `※ Los costos adicionales como tarifas de manejo de terminal y tarifas de muelle están excluidos del precio. <br>
                    <span class="spaces-span mo-hidden"></span>Si deseas verificar los cargos adicionales, <br class="mo-br"><a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">regístrate</a> para ver todo de un vistazo!
                    ${quoteReqData.freightInfo >= 10 && quoteReqData.svcClassCd === "LCL" ? '<br>※ Los envíos que superen los 10 CBM pueden ser divididos en múltiples cargamentos.' :''}
                </p>`;
        }else if(langCd === 'vn'){
          baseResultText = `※ Các chi phí bổ sung như phí xử lý tại cảng và lưu kho không được tính vào giá. <br>
                    <span class="spaces-span mo-hidden"></span>Nếu bạn muốn kiểm tra các khoản phí bổ sung, <br class="mo-br">hãy <a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">đăng ký</a> để xem mọi thứ một cách tổng quan!
                    ${quoteReqData.freightInfo >= 10 && quoteReqData.svcClassCd === "LCL" ? '<br>※ Các lô hàng trên 10 CBM có thể được chia thành nhiều chuyến vận chuyển.' :''}
                </p>`;
        }
        if(globalQuoteRequestFlag){
          baseResultText = GL_QUOTE_TEXT.r002.replace('#', appJoinLinkQuoteResult);
        }
        if(transport === 'VS' || transport === 'AR' || transport === 'RD' || transport === 'RL'){
            $('#base-quote-result').append(routeText);
            $('#base-transport-result').append(serverResult);
            $('#inner-quote-result').append(`<p class="info-text quote-result-remove">${baseResultText}</p>`)
            addVRFCLQuoteResult();
            if(transport === 'AR'){
              buildArLclExpModuleResultContent(data, quoteReqData, langCd, "AR");
            }
            if(transport === 'VS') {
              if(data.quoteLclCallFclList?.length > 0){
                buildLcLCallFclResult(data, quoteReqData, langCd);
              }
              if(data.quoteLclCallExpList?.length > 0){
                buildArLclExpModuleResultContent(data, quoteReqData, langCd, "LCL");
              }
            }
        }
        if(transport === 'EXP'){
            buildExpressQuoteResult(data, quoteReqData, langCd);
            //addExpressKRtoUSQuoteResult();
        }
      }else {
        //showpop
        quoteFail();
      }
      return;
    }
    console.log('Local quote api exception');
    quoteFail();
  //popup
}

function buildLcLCallFclResult(data, quoteReqData, langCd){
  $("#lcl-call-fcl-result").remove();
  const list = data.quoteLclCallFclList;
  const routeClass = getRouteResultClassNm(quoteReqData.svcMedCtgryCd);
  let fclText = 'FCL 서비스 운임도 확인해보세요.';
  if(langCd === 'en'){
    fclText = 'Check our FCL service rates as well.';
  }
  if(langCd === 'es'){
    fclText = 'Consulta también nuestras tarifas para el servicio FCL.';
  }
  if(langCd === 'vn'){
    fclText = 'Hãy kiểm tra thêm bảng giá dịch vụ FCL của chúng tôi.';
  }
  let fclTipsText = `<div class="express-text quote-result-remove" style="margin-bottom:40px;">
                                 <em>${fclText}</em>
                               </div>`;
  let tcdX = (transport === 'AR' || transport === 'EXP') ? '' : 'x ';
  let routeText =
        `<div class="route ${routeClass}  quote-result-remove"><!-- 해상일때 ocean, 항공일 때 flight 클래스 추가 -->
              <span class="depart-country"><b>${list[0].nationCd}</b> ${list[0].deppNm}</span>
              <span class="arrow"></span>
              <span class="arrive-country"><b>${list[0].arrNationCd}</b> ${list[0].arrpNm}</span>
          </div>
          <div class="weight-box  quote-result-remove">
              <div id="freight_weight">1</div>
              <div id="freight_unit">x 20' Dry</div>
          </div>`;
  let serverResult = '';
  $.each(list, function (index, obj){
    if(langCd === 'en'){
      promotionText = `Promotional Price`;
    }else if(langCd === 'es'){
      promotionText = `Precio Promocional`;
    }else if(langCd === 'vn'){
      promotionText = `Giá Khuyến Mãi`;
    }else if(langCd === 'kr'){
      promotionText = `프로모션 특가`;
    }
    if(!obj.promotionCode){
      promotionText = '';
    }
    serverResult += `<li>
                        <span class="company">${obj.carrierName}</span>
                        <span class="price">
                          <div>
                            <div class="price-add">${obj.originalPrice?.mainCurrency || ''} ${obj.originalPrice?.quoteFare || ''}</div>
                            ${obj.mainCurrency} ${obj.total}
                            <i>${promotionText}</i>
                          </div>
                        </span>
                      </li>`;

  });
  let baseResultText = `※ 터미널 화물 처리 비용, 항만 사용료 등 부대비용이 제외된 금액입니다.<br>
              <span class="spaces-span mo-hidden"></span>부대비용까지 확인하고 싶다면? <br class="mo-br"><a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">첼로스퀘어 회원가입</a>으로 한눈에 확인하세요.
          </p>`;
  if(langCd === 'en'){
    baseResultText = `※ The additional charges such as the terminal handling charge and the wharfage charge are excluded in the price.<br>
              <span class="spaces-span mo-hidden"></span>If you want to check the additional charges as well, <br class="mo-br"><a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">sign up</a> to view everything at a glance!
          </p>`;
  }else if(langCd === 'es'){
    baseResultText = `※ Los costos adicionales como tarifas de manejo de terminal y tarifas de muelle están excluidos del precio. <br>
              <span class="spaces-span mo-hidden"></span>Si deseas verificar los cargos adicionales, <br class="mo-br"><a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">regístrate</a> para ver todo de un vistazo!
          </p>`;
  }else if(langCd === 'vn'){
    baseResultText = `※ Các chi phí bổ sung như phí xử lý tại cảng và lưu kho không được tính vào giá. <br>
              <span class="spaces-span mo-hidden"></span>Nếu bạn muốn kiểm tra các khoản phí bổ sung, <br class="mo-br">hãy <a href="${appJoinLinkQuoteResult}" class="link-text-under" target="_blank">đăng ký</a> để xem mọi thứ một cách tổng quan!
          </p>`;
  }
  const lclCallFcl = `<div id="lcl-call-fcl-result" style="margin-bottom: 100px;">
  ${fclTipsText}
  <div class="sort-content-box">${routeText}</div>
  <div class="transport-result ">${serverResult}</div>
  <p class="info-text quote-result-remove">${baseResultText}</p>
  </div>
  `
  $('#inner-quote-result').append(lclCallFcl);
}

function getRouteResultClassNm(transport){
    let classNm = '';
    if(transport === 'VS'){
        return 'ocean';
    }
    if(transport === 'AR'){
        return 'flight';
    }
    if(transport === 'EXP'){
        return 'express';
    }
    if(transport === 'RD'){
      return 'truck';
    }
  if(transport === 'RL'){
    return 'train';
  }
    return  '';
}

function getQuoteRequestData(langCd){
  let requestData = {};
  var transport = $("input[type=radio][name=transport]:checked").val();
  requestData["svcMedCtgryCd"] = transport;
  requestData["deppNm"] = fnSubStringPortCode($("#departure").val());
  requestData["arrpNm"] = fnSubStringPortCode($("#arrival").val());
  requestData["freightInfo"] = expressPackageData ? "0" : $("#freightInfo").val();
  requestData["searchGa"] = getCookieGa();
  requestData["routeNation"] = $('#nationCd').val();
  requestData["langCd"] =langCd;
  requestData["pack"] = expressPackageData;
  if(transport == "VS"){
    var transMode = $("input[type=radio][name=radio1]:checked").val();
    transMode = transMode.substring(transMode.indexOf("-") + 1);
    requestData["svcClassCd"] = transMode;
    if(transMode === "FCL"){
      requestData["uldTcd"] = $("#FCL-select").val();
      requestData["tcd"] = $('#FCL-select').find(`option[value=${$('#FCL-select').val()}]`).text();
    }else{
      requestData["tcd"] = "CBM";
    }
  }
  if(transport === "AR" || transport === "EXP"){
    requestData["tcd"] = "KG";
  }
  if(transport === 'RD'){
    if(requestData["routeNation"] === 'TH'){
      requestData["tcd"] = $('#FTL-select').find(`option[value=${$('#FTL-select').val()}]`).text();
      requestData["uldTcd"] = $('#FTL-select').val();
    }else {
      requestData["tcd"] = $('#truck-unit-tcd').text();
      requestData["uldTcd"] = $('#truck-unit-tcd').data('value');
    }
  }
  if(transport === 'RL'){
    requestData["svcClassCd"] = 'FCL';
    requestData["uldTcd"] = $("#FCL-select").val();
    requestData["tcd"] = $('#FCL-select').find(`option[value=${$('#FCL-select').val()}]`).text();
  }
  requestData["depp"] = $("#departure").val();
  requestData["arrp"] = $("#arrival").val();
  requestData["userUuid"] = getQuoteUserUUID();
  requestData["testopia"] = TESTOPIA_AUTOMATION === $('#last-name').val();
  console.log("requestData", JSON.stringify(requestData))
  return requestData;
}

function buildArLclExpModuleResultContent(resultData, quoteReqData, langCd, type){

    const airExpList = type === "AR" ? resultData.airExpList : resultData.quoteLclCallExpList;
    if(!airExpList || airExpList.length < 1){
      return '';
    }
    const lclWeight = 167 * (quoteReqData.freightInfo * 10) / 10;
    const weight = type === "LCL" ? lclWeight : quoteReqData.freightInfo;
    const unit = type === "LCL" ?  "KG" : quoteReqData.tcd;
    var deepImgUrl = "/countryImgView.do?nationSeqNo=" + airExpList[0].deepNationSeqNo;
    var arrpImgUrl = "/countryImgView.do?nationSeqNo=" + airExpList[0].arrpNationSeqNo;
    let airExpText1_1 = "화물을 더 빠르게, Door-to-Door로 보내고 싶으시다면?";
    let airExpText1_2 = "Cello Square의 경쟁력 있는 항공특송 운임을 확인해 보세요!"
    if(langCd === 'en'){
      airExpText1_1 = 'Want to send your cargo faster, Door-to-Door?';
      airExpText1_2 = 'Check out Cello Square’s competitive air express rates!';
    }
    if(langCd === 'es'){
      airExpText1_1 = '¿Quieres enviar tu carga más rápido, puerta a puerta?';
      airExpText1_2 = '¡Consulta las tarifas competitivas de envío exprés aéreo de Cello Square!';
    }
  if(langCd === 'vn'){
    airExpText1_1 = 'Bạn muốn gửi hàng nhanh hơn và giao hàng tận tay không?';
    airExpText1_2 = 'Khám phá ngay giá cước hàng không hấp dẫn của Cello Square!';
  }
    if(type === "LCL" && quoteReqData.freightInfo < 1){
      if(langCd === 'kr'){
        airExpText1_2 = 'Cello Square의 경쟁력 있는 특송 운임을 확인해 보세요!!</br>' +
            '자체적으로 중량 환산(kg) 적용한 운임이며, 특송 견적에서는 보다 세부적인 중량(kg) 조회가 가능합니다.';
      }
      if(langCd === 'en'){
        airExpText1_2 = 'Check out Cello Square\'s competitive express shipping rates!</br>' +
            'The freight rates are based on our internally converted chargeable weight (kg), and you can check more detailed weight (kg) in the express quote.';
      }
      if(langCd === 'es'){
        airExpText1_2 = '¡Consulte las competitivas tarifas exprés de Cello Square!</br>' +
            'La tarifa del flete se calcula en función de nuestra propia conversión de peso (kg), y puede verificar el peso (kg) con más detalle en la cotización de envío urgente.';
      }
      if(langCd === 'vn'){
        airExpText1_2 = 'Hãy xem mức giá chuyển phát nhanh cạnh tranh của Cello Square!</br>' +
            'Giá cước vận chuyển được tính dựa trên quy đổi trọng lượng (kg) của chúng tôi và bạn có thể kiểm tra trọng lượng (kg) chi tiết hơn trong báo giá chuyển phát nhanh.';
      }
    }
    if(type === "LCL" && quoteReqData.freightInfo >=1){
      airExpText1_2 = ""
    }
    let airExpText1 = `<div class="express-text quote-result-remove">
                                 <em>${airExpText1_1}</em>
                                 <p>${airExpText1_2}</p>
                               </div>`;


    let airExpText2 = `<div class="sort-content-box">
                                   <div class="route express">
                                        <span class="depart-country"></span>
                                    </div>
                                    <div class="route express country">
                                        <span class="depart-country"><img src="${deepImgUrl}" alt="${airExpList[0].deppNationNm}"><i>${airExpList[0].deppNationNm}</i></span>
                                        <span class="arrow"></span>
                                        <span class="arrive-country"><img src="${arrpImgUrl}" alt="${airExpList[0].arrpNationNm}"><i>${airExpList[0].arrpNationNm}</i></span>
                                    </div>
                                    <div class="weight-box">
                                        <div id="freight_weight">${weight}</div>
                                        <div id="freight_unit"> ${unit}</div>                                 
                                    </div>
                                </div>`;
    let loopText = '';
    $.each(airExpList, function (index, obj){
      loopText += `<li>
                    <span class="company">${obj.carrierName}</span>
                    <span class="price"><b>Lead Time 2~3 days</b>${obj.mainCurrency} ${obj.total}</span>
                  </li>`;

    });
    let airExpText3_1 = `<i>실제 발송시 발송물 중량은 국제항공운송협회IATA) 규정에 따라 화물 중량과 부피 중 큰 값을 기준으로 산정됩니다.</i>
                                  <i>배송상황에 따라 부가 운임이 발생할 수 있으며 , 선적일에 따라서 견적은 변경될 수 있습니다.</i>`;
    if(langCd === 'en'){
      airExpText3_1 = `<i>Upon actual shipment, the weight of the shipment is calculated based on the larger of cargo weight and volume in accordance with International Air Transport Association (IATA) regulations.</i>`;
    }
    if(langCd === 'es'){
      airExpText3_1 = `<i>En el caso de un envío real, el peso se calcula según las regulaciones de la Asociación Internacional de Transporte Aéreo (IATA), basándose en el peso y el volumen de la carga.</i>`
    }
  if(langCd === 'vn'){
    airExpText3_1 = `<i>Khi gửi hàng, trọng lượng của hàng hóa được tính dựa trên quy định của Hiệp hội Vận tải Hàng không Quốc tế (IATA).</i>`;
  }
    let airExpText3 = ` <ul class="transport-result">
                                    ${loopText}
                                </ul>
                                <p class="guide-txt express">
                                    ${airExpText3_1}
                                </p>`;
  if(type === "AR"){
   $('#inner-quote-result').append(airExpText1);
  }

    let arExpText = `<div class="sort-content chk-result quote-result-remove">                               
                                   ${airExpText2}
                                   ${airExpText3} 
                              </div>`
  if(type === "AR"){
   $('#inner-quote-result').append(arExpText);
  }


  if(type === "LCL"){
    let lclExpress = `<div id="lcl-express">
      ${airExpText1}
      ${arExpText}
    </div>`
    $('#lcl-express').remove();
    $('#inner-quote-result').append(lclExpress);
  }
}

function buildExpressQuoteResult(resultData, quoteReqData, langCd){
  let quoteApiRes = resultData.quoteApiRep.trim();
  if (quoteApiRes && quoteApiRes.startsWith("{") && quoteApiRes.endsWith("}")){
    const expressData = JSON.parse(quoteApiRes);
    exChargeWeight = expressData?.standard_fare?.charge_weight || 0;
  }
    const quoteList = resultData.quoteList;
    var deepImgUrl = "/countryImgView.do?nationSeqNo=" + quoteList[0].deepNationSeqNo;
    var arrpImgUrl = "/countryImgView.do?nationSeqNo=" + quoteList[0].arrpNationSeqNo;
    let expRouteText = `<div class="route express quote-result-remove"><!-- 특송일때 express 클래스 추가--><!-- 해상일때 ocean, 항공일 때 flight 클래스 추가 -->
                                <span class="depart-country"></span>
                            </div>
                            <div class="route express country quote-result-remove">
                                <span class="depart-country"><img src="${deepImgUrl}" alt="${quoteList[0].deppNationNm}"><i>${quoteList[0].deppNationNm}</i></span>
                                <span class="arrow"></span>
                                <span class="arrive-country"><img src="${arrpImgUrl}" alt="${quoteList[0].arrpNationNm}"><i>${quoteList[0].arrpNationNm}</i></span>
                            </div>
                            <div class="weight-box quote-result-remove">
                                <div id="freight_weight">${quoteReqData.freightInfo}</div>
                                <div id="freight_unit"> ${quoteReqData.tcd}</div>
                            </div>`;
    if(expressPackageData) {
      expRouteText = `<div class="route express quote-result-remove"><!-- 특송일때 express 클래스 추가--><!-- 해상일때 ocean, 항공일 때 flight 클래스 추가 -->
                                <span class="depart-country"></span>
                            </div>
                            <div class="route express country quote-result-remove">
                                <span class="depart-country"><img src="${deepImgUrl}" alt="${quoteList[0].deppNationNm}"><i>${quoteList[0].deppNationNm}</i></span>
                                <span class="arrow"></span>
                                <span class="arrive-country"><img src="${arrpImgUrl}" alt="${quoteList[0].arrpNationNm}"><i>${quoteList[0].arrpNationNm}</i></span>
                            </div>
                            `;
    }
    let expTransportText = '';
    let vipFree = '첼로스퀘어 회원운임';
    if(langCd === 'en'){
      vipFree = 'Cello Square member rates';
    }
    if(langCd === 'es'){
      vipFree = 'Tarifa para miembros de Cello Square';
    }
  if(langCd === 'vn'){
    vipFree = 'Giá cước dành cho thành viên Cello Square';
  }
    if(globalQuoteRequestFlag){
      vipFree = GL_QUOTE_TEXT.r013;
    }
    $.each(quoteList, function (index, obj){
      expTransportText += `<li>
                          <span class="${obj.carrierName}">Express</span>                                    
                          <span class="price">
                              <div>
                                  <em class="price-add">${obj.mainCurrency} ${obj.marketingPrice}</em>${obj.mainCurrency} ${obj.total}
                                  <i>${vipFree}</i>
                              </div>
                          </span>
                        </li>`;
    });
    let expGuideText = ` <p class="guide-txt express quote-result-remove">
                                    <i>실제 발송시 발송물 중량은 국제항공운송협회IATA) 규정에 따라 화물 중량과 부피 중 큰 값을 기준으로 산정됩니다.</i>
                                    <i>배송상황에 따라 부가 운임이 발생할 수 있으며 , 선적일에 따라서 견적은 변경될 수 있습니다.</i>
                                    <i>일부&nbsp;국가(유엔&nbsp;제재국가,&nbsp;분쟁지역)는 서비스 이용에 제약이 있을 수 있습니다. 자세한 정보는 배송 전 담당자에게 문의 바랍니다.</i>
                                    <i>정기적인 해외발송이 있으신가요? 회원가입 하시면 특송담당자가 빠르게 연락드리겠습니다.</i>
                                </p>`;
    const pageTitleName = $("#sub-contents h1.con-title2").text();
    if(pageTitleName && pageTitleName.includes("특송 (Express)") && location.pathname.startsWith("/kr/service/view-")){
      expGuideText = ` <p class="guide-txt express quote-result-remove">
                          <i>발송물 청구 중량은 국제항공운송협회(IATA) 규정에 따라 무게 중량과 부피 중량 중 큰 값을 기준으로 산정됩니다.</i>
                          <i>부피 중량에 대한 산출식은 박스의 [가로*세로*높이(cm)/5500] 입니다. (UPS 기준)</i>
                          <i>무게 중량과 부피 중량은 실제 측정한 청구 중량과 다를 수 있으며, 청구 중량은 첼로스퀘어에서 실측한 값을 기준으로 산정됩니다.</i>
                          <i>항공 운송 운임(AFC) 및 Surcharge(FSC, PSS 등)는 실제 청구시 운임이 상이하거나 Surcharge 항목이 추가될 수 있습니다.</i>
                          <i>시스템에서 안내되는 배송일은 주요 국가/도시, 정상 통관 기준이며, 각 국가별 물류 현황 및 통관 일정에 따라 배송일정은 변경될 수 있습니다.</i>
                          <i>그 외 배송상황이나 배송물 특성에 따라 부가 운임이 발생할 수 있습니다.</i>
                          <i>일부 국가(유엔 제재국가, 분쟁지역)는 서비스 이용에 제약이 있을 수 있습니다. 자세한 정보는 배송 전 담당자에게 문의 바랍니다.</i>
                          <i>표준 서비스 운임은 회원 가입 시 제공되고 있으며, 운임 변경 시 사전에 공지하고 있습니다.</i>
                      </p>`;
    }
    if(langCd === 'en'){
      expGuideText = ` <p class="guide-txt express quote-result-remove">
                                    <i>Upon actual shipment, the weight of the shipment is calculated based on the larger of cargo weight and volume in accordance with International Air Transport Association (IATA) regulations.</i>
                                    <i>Additional shipping charges may apply depending on delivery conditions, and the quote may change depending on the shipment date.</i>
                                    <i>Some countries (UN sanctioned countries, conflict zones) may have restrictions on use of the service. For more detailed information, please contact the person in charge before delivery.</i>
                                    <i>Do you have regular overseas shipments? If you sign up as a member, a special delivery representative will contact you quickly.</i>
                                </p>`;
    }
    if(langCd === 'es'){
      expGuideText = ` <p class="guide-txt express quote-result-remove">
                                    <i>En el caso de un envío real, el peso se calcula según las regulaciones de la Asociación Internacional de Transporte Aéreo (IATA), basándose en el peso y el volumen de la carga.</i>
                                    <i>Pueden aplicarse cargos adicionales de envío según las condiciones de entrega y la cotización puede cambiar según la fecha de envío./embarque.</i>
                                    <i>Algunos países (países sancionados por la ONU, zonas de conflicto) pueden tener restricciones en el uso del servicio. Para obtener información más detallada, póngase en contacto con la persona a cargo antes de la entrega.</i>
                                    <i>¿Tiene envíos internacionales regulares? Si se registra como miembro, un representante de entrega especial se pondrá en contacto con usted rápidamente.**</i>
                                </p>`;
    }
  if(langCd === 'vn'){
    expGuideText = ` <p class="guide-txt express quote-result-remove">
                                    <i>Khi gửi hàng, trọng lượng của hàng hóa được tính dựa trên quy định của Hiệp hội Vận tải Hàng không Quốc tế (IATA).</i>
                                    <i>Phí vận chuyển bổ sung có thể áp dụng tùy theo điều kiện giao hàng, và báo giá có thể thay đổi tùy theo ngày gửi hàng.</i>
                                    <i>Dịch vụ của chúng tôi có thể bị hạn chế ở một số quốc gia (quốc gia bị Liên Hợp Quốc trừng phạt, khu vực xung đột). Để biết thêm thông tin chi tiết, vui lòng liên hệ với nhân viên phụ trách trước khi giao hàng.</i>
                                    <i>Bạn có thường xuyên gửi hàng quốc tế không? Nếu đăng ký thành viên, một nhân viên chuyên trách sẽ liên hệ bạn nhanh chóng</i>
                                </p>`;
  }
    if(globalQuoteRequestFlag){
      expGuideText = ` <p class="guide-txt express quote-result-remove">
                                    <i>${GL_QUOTE_TEXT.r008}</i>
                                    <i>${GL_QUOTE_TEXT.r009}</i>
                                    <i>${GL_QUOTE_TEXT.r010}</i>
                                    <i>${GL_QUOTE_TEXT.r011}</i>
                                </p>`;
    }
  $('#base-quote-result').append(expRouteText);
  $('#base-transport-result').append(expTransportText);
  $('#inner-quote-result').append(expGuideText);
}

function getCookieGa(){
  if(document.cookie){
    var cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].split("=");
      if(cookie[0].trim() == "_ga"){
        return cookie[1]
      }
    }
  }
  return "";
}

function resetQuoteInput(){
  const tabValue = $("input[name='transport']:checked").val();
  $('#freightInfo').val(1);
  $('#departure').val('');
  $('#arrival').val('');
  $('#departure-auto-search').hide();
  $('#arrival-auto-search').hide();
  $('#departure-error-text').hide();
  $('#arrival-error-text').hide();
  $('#kg-error-text').hide();
  $('#cbm-error-text').hide();
  checkDepArrInputClose();
  if(tabValue === 'EXP'){
    $('#departure').val($.cookie('defaultExpVal'));
    deepValue = $.cookie('defaultExpVal');
    $('#freightInfo').val(0);
  }
};

function quoteFail(){
  /*$('#popup_personal_info').getInstance().close();*/
  if(globalQuoteRequestFlag){
    $('#popup_quote_gl').getInstance().open();
  }else {
    $('#popup_quote').getInstance().open();
  }

  /*showPop("No search results found.<br>Please try it later.","estimate-email estimate-email-fail");*/
}

function personInfoCheck(langCd, type){
  if(type === "promotion-quote"){
    let lastNameCheck;
    let emailAddressCheck;
    let mobilePhoneCheck;
    let companyCheck;
    let firstNameCheck = true;
    if(globalQuoteRequestFlag){
      if('en' === langCd || 'es' === langCd || 'vn' === langCd){
        firstNameCheck = fnGlQuoteName("first-name_quote", langCd);
      }
      lastNameCheck = fnGlQuoteName("last-name_quote", langCd);
      emailAddressCheck = fnGLQuoteEmail("e-mail_quote", langCd);
      mobilePhoneCheck = fnGlQuoteNumber("call-number_quote", langCd);
      companyCheck = fnGlQuoteText("company-name_quote", langCd);
    }else {
      lastNameCheck = fnName("last-name_quote", langCd);
      emailAddressCheck = fnEmail("e-mail_quote", langCd);
      mobilePhoneCheck = fnNumber("call-number_quote", langCd);
      companyCheck = fnText("company-name_quote", langCd);
      if('en' === langCd || 'es' === langCd || 'vn' === langCd){
        firstNameCheck = fnName("first-name_quote", langCd);
      }
    }
    if(!firstNameCheck){
      $('#first-name_quote').next().show();
    }
    if(!lastNameCheck){
      $('#last-name_quote').next().show();
    }
    if(!emailAddressCheck){
      $('#e-mail_quote').next().show();
    }
    if(!mobilePhoneCheck){
      $('#call-number_quote').next().show();
    }
    if(!companyCheck){
      $('#company-name_quote').next().show();
    }
    var retTF = lastNameCheck && emailAddressCheck && mobilePhoneCheck && companyCheck && firstNameCheck;
    //agree6 agree3
    let agree2OrAaree3 = false;
    if(getLangCdByUrlSplit() !== 'kr'){
      agree2OrAaree3 = !$("#agree2_quote").is(":checked") || !$("#agree3_quote").is(":checked");
    }
    if (!$("#agree5_quote").is(":checked") || !$("#agree1_quote").is(":checked") || !$("#agree6_quote").is(":checked") || agree2OrAaree3) {
      $("#terms-warning-text_quote").show();
      retTF = false;
    } else {
      $("#terms-warning-text_quote").hide();
    }
    if($('#terms-warning-text_quote').is(':visible')){
      retTF = false;
    }
    return retTF;
  } else {
    let lastNameCheck;
    let emailAddressCheck;
    let mobilePhoneCheck;
    let companyCheck;
    let firstNameCheck = true;
    if(globalQuoteRequestFlag){
      if('en' === langCd || 'es' === langCd || 'vn' === langCd){
        firstNameCheck = fnGlQuoteName("first-name", langCd);
      }
      lastNameCheck = fnGlQuoteName("last-name", langCd);
      emailAddressCheck = fnGLQuoteEmail("e-mail", langCd);
      mobilePhoneCheck = fnGlQuoteNumber("call-number", langCd);
      companyCheck = fnGlQuoteText("company-name", langCd);
    }else {
      lastNameCheck = fnName("last-name", langCd);
      emailAddressCheck = fnEmail("e-mail", langCd);
      mobilePhoneCheck = fnNumber("call-number", langCd);
      companyCheck = fnText("company-name", langCd);
      if('en' === langCd || 'es' === langCd || 'vn' === langCd){
        firstNameCheck = fnName("first-name", langCd);
      }
    }
    if(!firstNameCheck){
      $('#first-name').next().show();
    }
    if(!lastNameCheck){
      $('#last-name').next().show();
    }
    if(!emailAddressCheck){
      $('#e-mail').next().show();
    }
    if(!mobilePhoneCheck){
      $('#call-number').next().show();
    }
    if(!companyCheck){
      $('#company-name').next().show();
    }
    var retTF = lastNameCheck && emailAddressCheck && mobilePhoneCheck && companyCheck && firstNameCheck;
    //agree6 agree3
    let agree2OrAaree3 = false;
    if(getLangCdByUrlSplit() !== 'kr'){
      agree2OrAaree3 = !$("#agree2").is(":checked") || !$("#agree3").is(":checked");
    }
    if (!$("#agree5").is(":checked") || !$("#agree1").is(":checked") || !$("#agree6").is(":checked") || agree2OrAaree3) {
      $("#terms-warning-text").show();
      retTF = false;
    } else {
      $("#terms-warning-text").hide();
    }
    if($('#terms-warning-text').is(':visible')){
      retTF = false;
    }
    return retTF;
  }
}

function btnSendQuoteClick(estimateFlag, langCd, type){
  promitionsType = type;
  const retTF = personInfoCheck(langCd, type);
  if(retTF){
    if(estimateFlag === 'main'){
      personInfoClose('main');
    }
    if(estimateFlag === 'estimate'){
      personInfoClose('estimate');
    }
    //判断是否勾选了 可选条款 agree4 & agreeEmail & agreeKakao & agreeSms
    var suffix = (type === 'promotion-quote') ? '_quote' : '';
    var intercepted = checkMarketingAgreeAndProceed(langCd, function(){
      getQuote(estimateFlag, langCd);
    }, suffix);
    if(!intercepted){
      //调用报价接口
      getQuote(estimateFlag, langCd);
    }
  }
}

function sendQuoteEloqua(eloquaFormData){
  if('SDS' === getUrlParameters().internal){
    return;
  }
  console.log('eloquaFormData', eloquaFormData);
  $.each(eloquaFormData, function (index, elqObj){
    if(elqObj.lastName === TESTOPIA_AUTOMATION){
        return;
    }
    $.ajax({
      //url: "https://secure.p07.eloqua.com/api/bulk/2.0/customObjects/132/imports"
      url: "https://s73756918.t.eloqua.com/e/f2"
      , type: "POST"
      , dataType: 'json'
      , data: elqObj
      , contentType: "application/x-www-form-urlencoded; charset=UTF-8"
      , success: function (data) {
        console.log("eloquaSuccessData: ", data);
      }
      , error: function (json) {
        console.log("eloquaErrorRep: ", json)
      }
    });
  })

}


function jumpContact(langCd, select){
  let quoteRequestData = getQuoteRequestData(langCd);
  let param = "";
  for (const key in quoteRequestData){
    param += "&" + key + "=" + quoteRequestData[key];
  }
  window.location.href = "/" + langCd + "/contact.do?celloInSelect=" + select + param;
}

function saveQuoteData(requestData, data, langCd){

  let saveData = {};
  saveData.saveRequestData = JSON.parse(JSON.stringify(requestData));
  saveData.saveRequestData.depp = $("#departure").val();
  saveData.saveRequestData.arrp = $("#arrival").val();
  saveData.quoteResponseData = data;
  setGlobalData("estimateResponseData", saveData);
  window.location.href = "/" + langCd + "/quote/quote-request.do";
}
function settingMainJumpEstimateFont(){
  let quoteData = getGlobalData("estimateResponseData");
  console.log("settingMainJumpEstimateFont", JSON.stringify(quoteData));
  if(quoteData){
    let requestData = quoteData.saveRequestData;
    if(requestData.routeNation !== 'CN'){
      quote_person_info = getGlobalData(quote_person_info_key);
    }
    setDefaultEstimateByMain(requestData);
    buildQuoteResult(quoteData.quoteResponseData, requestData.langCd);
    clearGlobalData("estimateResponseData");
    clearGlobalData(quote_person_info_key);
  }
  let eloquaFormData = getGlobalData(quoteEloquaFormData);
  console.log("settingMainJumpEstimateFont-mainEloquaFormData", eloquaFormData);
  if(eloquaFormData){
    clearGlobalData(quoteEloquaFormData);
    try {
      sendQuoteEloqua(eloquaFormData);
    }catch (e){
      console.log('eloqua-error-info', e);
    }
  }
}

function setDefaultEstimateByMain(requestData){
  var deppNm = requestData.depp;
  var arrpNm = requestData.arrp;
  /*${requestData.langCd}*/
 /* [value='SG']*/
  $(`.head-country-list > li > a[value='${requestData.routeNation}']`).click();
  $('#nationCd').val(requestData.routeNation);
  $("input[type=radio][name=transport][value="+requestData.svcMedCtgryCd+"]").click();
  if(requestData.svcMedCtgryCd === "VS"){
    $("input[type=radio][name=radio1][value=VS-"+requestData.svcClassCd+"]").click();
    if(requestData.svcClassCd === "FCL"){
      $("#FCL-select").val(requestData.uldTcd);
      const selObj = $('#FCL-select').find("option[value=" + requestData.uldTcd + "]");
      $('#FCL-select+#FCL-select-button .ui-selectmenu-text').text(selObj.text());
    }
  }else if(requestData.svcMedCtgryCd === "RD"){
    if(requestData.routeNation === 'TH') {
      $("#FTL-select").val(requestData.uldTcd);
      const selObj = $('#FTL-select').find("option[value=" + requestData.uldTcd + "]");
      $('#FTL-select+#FTL-select-button .ui-selectmenu-text').text(selObj.text());
    }
  }
  if(deppNm){
    deepValue = deppNm;
    $("#departure").val(deppNm);
    $('#departure-delet').show();
  }
  if(arrpNm){
    arrpVale = arrpNm;
    $("#arrival").val(arrpNm);
    $('#arrival-delet').show();
  }
  $("#freightInfo").val(requestData.freightInfo);

  btnGetQuoteDisabledCheck();
}

function getQuotePersonInfoData(langCd){
  let personInfoData = {};
  if(promitionsType === "promotion-quote") {
    personInfoData.lastName = $('#last-name_quote').val();
    if(personInfoData.lastName.length === 0){
      return;
    }
    if('en' === langCd || 'es' === langCd || 'vn' === langCd) {
      personInfoData.firstName = $('#first-name_quote').val();
      personInfoData.lastName = $('#last-name_quote').val()
    }

    personInfoData.emailAddress = $('#e-mail_quote').val();
    personInfoData.businessPhone = $('#call-number_quote').val();
    personInfoData.company = $('#company-name_quote').val();
    personInfoData.langCd = langCd;
    personInfoData.HQ_Optin_Terms = $("#agree5_quote").is(":checked") ? "Yes" : "No";
    personInfoData.HQ_Optin_Privacy = $("#agree1_quote").is(":checked") ? "Yes" : "No";
    if(langCd !== 'kr'){
      personInfoData.HQ_Optin_Transfer_Overseas =  $("#agree2_quote").is(":checked") ? "Yes" : "No";
      personInfoData.HQ_Optin_Share_GlobalOffices =  $("#agree3_quote").is(":checked") ? "Yes" : "No";
    }
    personInfoData.HQ_Optin_Age =  $("#agree6_quote").is(":checked") ? "Yes" : "No";
    personInfoData.hqEmailOptIn = $("#agree4_quote").is(":checked") ? "Yes" : "No";
    let isContact = $("#agree7_quote").is(":checked") ? "Yes" : "No";
    personInfoData.hqMktEmail = isContact;
    personInfoData.hqMktPhone = isContact;
    personInfoData.hqMktSms =  isContact;
     if(langCd === "kr") {
      personInfoData.hqMktEmail = $("#agreeEmail_quote").is(":checked") ? "Yes" : "No";;
      personInfoData.hqMktKakao = $("#agreeKakao_quote").is(":checked") ? "Yes" : "No";
      personInfoData.hqMktSms =  $("#agreeSms_quote").is(":checked") ? "Yes" : "No";
    }
  } else {
    personInfoData.lastName = $('#last-name').val();
    if(personInfoData.lastName.length === 0){
      return;
    }
    if('en' === langCd || 'es' === langCd || 'vn' === langCd) {
      personInfoData.firstName = $('#first-name').val();
      personInfoData.lastName = $('#last-name').val()
    }

    personInfoData.emailAddress = $('#e-mail').val();
    personInfoData.businessPhone = $('#call-number').val();
    personInfoData.company = $('#company-name').val();
    personInfoData.langCd = langCd;
    personInfoData.HQ_Optin_Terms = $("#agree5").is(":checked") ? "Yes" : "No";
    personInfoData.HQ_Optin_Privacy = $("#agree1").is(":checked") ? "Yes" : "No";
    if(langCd !== 'kr'){
      personInfoData.HQ_Optin_Transfer_Overseas =  $("#agree2").is(":checked") ? "Yes" : "No";
      personInfoData.HQ_Optin_Share_GlobalOffices =  $("#agree3").is(":checked") ? "Yes" : "No";
    }
    personInfoData.HQ_Optin_Age =  $("#agree6").is(":checked") ? "Yes" : "No";
    personInfoData.hqEmailOptIn = $("#agree4").is(":checked") ? "Yes" : "No";
    let isContact = $("#agree7").is(":checked") ? "Yes" : "No";
    personInfoData.hqMktEmail = isContact;
    personInfoData.hqMktPhone = isContact;
    personInfoData.hqMktSms =  isContact;
     if(langCd === "kr") {
      personInfoData.hqMktEmail = $("#agreeEmail").is(":checked") ? "Yes" : "No";;
      personInfoData.hqMktKakao = $("#agreeKakao").is(":checked") ? "Yes" : "No";
      personInfoData.hqMktSms =  $("#agreeSms").is(":checked") ? "Yes" : "No";
    }
  }
  console.log(personInfoData);
  return personInfoData;
}

function buildQuoteEloquaData(quoteRequestData, quoteResponseData, personInfoData){

  let eloquaDataArray = [];
  let eloquaDataObj = {};
  var formName;
  if ("kr"===quoteRequestData.langCd){
    formName = "CS_QuoteRequestForm_Kr-Ko"
  }else {
    formName = getElqFormName(quoteRequestData.routeNation,'quote');
  }
  console.log("liuhaha",formName)
  eloquaDataObj.elqFormName = formName;
  eloquaDataObj.elqSiteID = "73756918";
  var resolvedElqCustomerGUID = elqCustomerGUID && elqCustomerGUID.trim() !== "" ? elqCustomerGUID : elqGetCookieSubValue('ELOQUA', 'GUID');
  eloquaDataObj.elqCustomerGUID = resolvedElqCustomerGUID;
  eloquaDataObj.emailAddress = personInfoData.emailAddress;
  eloquaDataObj.firstName = personInfoData.firstName;
  eloquaDataObj.lastName = personInfoData.lastName;
  eloquaDataObj.company = personInfoData.company;
  eloquaDataObj.businessPhone = personInfoData.businessPhone;
  eloquaDataObj.country = quoteRequestData.routeNation; //这里是选择查询报价的国家
  eloquaDataObj.Q_Number = quoteResponseData.quoteSeqNo;
  eloquaDataObj.Trans_Gubun = quoteRequestData.svcMedCtgryCd;
  eloquaDataObj.Container_Type = quoteRequestData.svcClassCd;
  eloquaDataObj.Origin_Port = quoteRequestData.deppNm;
  eloquaDataObj.Destination_Port = quoteRequestData.arrpNm;
  eloquaDataObj.Cargo_information = (expressPackageData ? Number(exChargeWeight) : quoteRequestData.freightInfo) + "x" + quoteRequestData.tcd;
  eloquaDataObj.Q_Result = quoteResponseData.quoteApiRep;
  eloquaDataObj.agree1 = personInfoData.HQ_Optin_Privacy;
  if(quoteRequestData.langCd !== 'kr'){
    eloquaDataObj.agree2 = personInfoData.HQ_Optin_Transfer_Overseas;
    eloquaDataObj.agree3 = personInfoData.HQ_Optin_Share_GlobalOffices;
  }
  eloquaDataObj.agree4 = personInfoData.hqEmailOptIn;
  eloquaDataObj.agree5 = personInfoData.HQ_Optin_Terms;
  eloquaDataObj.agree7 = personInfoData.HQ_Optin_Age;
  eloquaDataObj.hQMKTinfoEmail = personInfoData.hqMktEmail;
  eloquaDataObj.hQMKTinfoPhone = "kr" !== quoteRequestData.langCd ? personInfoData.hqMktPhone : undefined;
  eloquaDataObj.hQMKTinfoSMS = personInfoData.hqMktSms;
  eloquaDataObj.hQMKTinfoKakao = "kr" === quoteRequestData.langCd ? personInfoData.hqMktKakao : undefined;
  eloquaDataObj.language = quoteRequestData.langCd;

  eloquaDataObj.User_Number = getQuoteUserUUID();
  eloquaDataObj.Q_Date = getDteFormat();
  if(quoteResponseData.status === 'success') {
      if(quoteResponseData.quoteList.length > 0){

        $.each(quoteResponseData.quoteList, function (index, obj){
          eloquaDataObj.Q_Seq = index + 1;
          eloquaDataObj.Service = obj.carrierName; //这里要确认一下是要 前端展示的内容 还是 API 返回的内容；
          eloquaDataObj.Currency = obj.quoteCurrency;
          eloquaDataObj.Currency_Amount = obj.quoteCurrency +" " +  obj.quoteFare;
          eloquaDataObj.Amount = obj.quoteFare;
          eloquaDataObj.Origin_Country = obj.nationCd ;
          eloquaDataObj.Destination_Country = obj.arrNationCd;
          let copyObj = Object.assign({}, eloquaDataObj);
          eloquaDataArray.push(copyObj);
        });
      }
     if(quoteRequestData.svcMedCtgryCd === 'AR' && quoteResponseData.airExpList && quoteResponseData.airExpList.length > 1){
       eloquaDataObj.Q_Number = quoteResponseData.sqNo;
       $.each(quoteResponseData.airExpList, function (index, obj){
         eloquaDataObj.Q_Result = quoteResponseData.airExpQuoteRep;
         eloquaDataObj.Q_Seq = index + 1;
         eloquaDataObj.Service = obj.carrieName; //这里要确认一下是要 前端展示的内容 还是 API 返回的内容；
         eloquaDataObj.Currency = obj.quoteCurrency;
         eloquaDataObj.Currency_Amount = obj.quoteCurrency +" " +  obj.quoteFare;
         eloquaDataObj.Amount = obj.quoteFare;
         eloquaDataObj.Origin_Country = obj.nationCd ;
         eloquaDataObj.Destination_Country = obj.arrNationCd;
         let copyObj = Object.assign({}, eloquaDataObj);
         eloquaDataArray.push(copyObj);
       });
     }
  }else {
    eloquaDataArray.push(eloquaDataObj);
  }
  if(eloquaDataArray.length === 0){
    eloquaDataArray.push(eloquaDataObj);
  }
  return eloquaDataArray;
}

function getDteFormat(){
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const fullDate = `${year}-${month}-${day}`;
  return  fullDate;
}

function getQuoteUserUUID(){
  //localStorage.setItem("browserUuid", event.data);
  let quoteUserUUID = localStorage.getItem("quoteUserUUID")
  if(!quoteUserUUID){
    quoteUserUUID = guid();
    localStorage.setItem("quoteUserUUID", quoteUserUUID);
  }
  return quoteUserUUID;
}
function guid () {
  return 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0
    var v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function joinLocationAutoEstimateUrl(requestData){

  let langCd = requestData.langCd;
  let locationBaseUrl =  location.protocol + "//" + location.host +  location.pathname + "?";
  if(location.pathname.indexOf('global-network') > 0){
    let param = getUrlParameters();
    locationBaseUrl += "country=" + param['country'] + "&lang=" + param['lang'] + "&";
  }
  locationBaseUrl += "svcMedCtgryCd=" + requestData['svcMedCtgryCd'] +  "&deppNm=" + requestData['deppNm']
      + "&arrpNm=" + requestData['arrpNm'] + "&freightInfo=" + requestData['freightInfo'] + "&routeNation=" + requestData.routeNation;
  if(requestData['svcClassCd']){
    locationBaseUrl += "&svcClassCd=" + requestData['svcClassCd'];
  }
  if(requestData['uldTcd']){
    locationBaseUrl += "&uldTcd=" + requestData['uldTcd'];
  }
  $('.url-copy a').attr('href', 'javascript: estimateAutoUrlCopy("'+locationBaseUrl+'")');
  //content-sns
  $('.content-sns').show();
  return locationBaseUrl;
}

function analysisUrlParamInitEstimate(){
  let quoteRequestData = getUrlParameters();
  if(quoteRequestData.deppNm && quoteRequestData.arrpNm){
    quoteRequestData.depp = quoteRequestData.deppNm;
    quoteRequestData.arrp = quoteRequestData.arrpNm;
    deepValue = quoteRequestData.depp;
    arrpVale = quoteRequestData.arrp;
    setDefaultEstimateByMain(quoteRequestData);
    let btn = $("#btn-get-quote").prop("disabled");
    if(!btn){
      getQuote('estimate', getLangCdByUrlSplit());
      //$("#btn-get-quote").click();
    }
  } else {
    if(quoteRequestData.country){
      $(`.head-country-list > li > a[value='${quoteRequestData.country}']`).click();
      $('#nationCd').val(quoteRequestData.country);
    }
  }
}

function getLangCdByUrlSplit(){
    const path = window.location.pathname;
    return path.split('/')[1];
}

function getPageTypeByUrlSplit(){
  const path = window.location.pathname;
  return path.split('/')[2];
}

function getUrlParameters() {
  var urlParams = {};
  var match,
      regex = /([^&=]+)=([^&]*)/g;
  var searchString = window.location.search.substring(1);
  while ((match = regex.exec(searchString))) {
    var key = decodeURIComponent(match[1]);
    var value = decodeURIComponent(match[2]);
    urlParams[key] = value;
  }
  return urlParams;
}

function removeQuoteResult(){
  $('.quote-result-remove').remove();
  $('#quote-result-id').hide();
  if ($("#express-quote-contact-content").length) {
    $("#express-quote-contact-content").hide();
  }
  $('#quote-url-copy-id').hide();
  $('#base-transport-result').children().remove();
}

function setDeepArrpPlaceholder(langCd){
  let target = $('.transport-type input[type="radio"]:checked')
  let checkedVal = target.val();
  let placeholderVal = '';
  //항구명 선택 또는 검색(국/영문)
  if(langCd === 'kr'){
    if(checkedVal === 'VS' || checkedVal === 'RL'){
      placeholderVal = '항구명 선택 또는 검색(국/영문)'
    }
    if(checkedVal === 'AR'){
      placeholderVal = '공항명 선택 또는 검색(국/영문)'
    }
    if(checkedVal === 'EXP'){
      placeholderVal = '국가명 선택 또는 검색(국/영문)';
    }
    if(checkedVal === 'RD'){
      placeholderVal = '도시명 선택 또는 검색(국/영문)'
    }
  }
  if(langCd === 'en'){
    if(checkedVal === 'VS' || checkedVal === 'RL'){
      placeholderVal = 'Select or search a port'
    }
    if(checkedVal === 'AR'){
      placeholderVal = 'Select or search an airport'
    }
    if(checkedVal === 'EXP'){
      placeholderVal = 'Select or search a city/port';
    }
    if(checkedVal === 'RD'){
      placeholderVal = 'Select or search a city'
    }
  }

  if(langCd === 'es'){
    if(checkedVal === 'VS' || checkedVal === 'RL'){
      placeholderVal = 'buscar un Puerto'
    }
    if(checkedVal === 'AR'){
      placeholderVal = 'buscar un aeropuerto'
    }
    if(checkedVal === 'EXP'){
      placeholderVal = 'buscar país';
    }
    if(checkedVal === 'RD'){
      placeholderVal = 'Seleccionar ciudad'
    }
  }

  if(langCd === 'vn'){
    if(checkedVal === 'VS' || checkedVal === 'RL'){
      placeholderVal = 'Chọn hoặc tìm kiếm cảng (tiếng Việt/Anh)'
    }
    if(checkedVal === 'AR'){
      placeholderVal = 'Chọn hoặc tìm kiếm sân bay (tiếng Việt/Anh)'
    }
    if(checkedVal === 'EXP'){
      placeholderVal = 'Chọn hoặc tìm kiếm thành phố/cảng (tiếng Việt/Anh)';
    }
    if(checkedVal === 'RD'){
      placeholderVal = 'Chọn hoặc tìm kiếm thành phố/cảng (tiếng Việt/Anh)'
    }
  }

  $("#departure").attr("placeholder",placeholderVal);
  $("#arrival").attr("placeholder",placeholderVal);
  settingTruckUnitInfo();
}

function settingTruckUnitInfo(){
  let target = $('.transport-type input[type="radio"]:checked')
  let checkedVal = target.val();
  if(checkedVal !== 'RD'){
    return;
  }
  getFTLUldTcdList();
}

function setGlobalNetworkQuoteDeepArrpPlaceholder(fontText){
  let target = $('.transport-type input[type="radio"]:checked')
  let checkedVal = target.val();
  let placeholderVal = '';
  if(checkedVal === 'VS' || checkedVal === 'RL'){
    placeholderVal = fontText.q013;
  }
  if(checkedVal === 'AR'){
    placeholderVal = fontText.q014;
  }
  if(checkedVal === 'EXP'){
    placeholderVal = fontText.q015;
  }
  if(checkedVal === 'RD'){
    placeholderVal = fontText.q015;
  }
  $("#departure").attr("placeholder",placeholderVal);
  $("#arrival").attr("placeholder",placeholderVal);
  settingTruckUnitInfo();
}

fnGlQuoteName = function(id, langCd) {
  var maxByte = $("#"+id).attr("data-byte");
  var msg = $("#"+id).attr("data-vmsg");
  if(typeof maxByte == "undefined") {
    maxByte = "0";
  }
  if(typeof msg == "undefined") {
    msg = "";
  }

  $("#"+id+"_Byte").find("span").text(fnChkByteChk2(id));
  if($.trim($("#"+id).val()) === "") {
    fnValid(id, false, msg);
    $("#"+id+"_Byte").addClass("error");
    return false;
  } else {
    if (fnNumberSpecialChk(id) == true) {
      //todo: 这里是合法性校验 但是文本没有给
      fnValid(id, false, msg);
      $("#"+id+"_Byte").addClass("error");
      return false;
    } else {
      if(fnChkByteChk(id, maxByte) == false) {
        //todo: 这里是字节大小校验 但是文本没有给
        fnValid(id, false, msg);
        $("#"+id+"_Byte").addClass("error");
        return false;
      } else {
        fnValid(id, true, "");
        $("#"+id+"_Byte").removeClass("error");
        return true;
      }
    }
  }
};

fnGLQuoteEmail = function(id, langCd) {
  var maxByte = $("#"+id).attr("data-byte");
  var msg = $("#"+id).attr("data-vmsg");
  if(typeof maxByte == "undefined") {
    maxByte = "0";
  }
  if(typeof msg == "undefined") {
    msg = "";
  }

  if($.trim($("#"+id).val()) == "") {
    fnValid(id, false, msg);
    return false;
  } else {
    if (fnEmailChk(id) == false) {
      fnValid(id, false, msg);
      return false;
    } else {
      if(fnChkByteChk(id, maxByte) == false) {
        fnValid(id, false, msg);
        return false;
      } else {
        fnValid(id, true, "");
        return true;
      }
    }
  }
};

fnGlQuoteNumber = function(id, langCd) {
  var maxByte = $("#"+id).attr("data-byte");
  var msg = $("#"+id).attr("data-vmsg");
  if(typeof maxByte == "undefined") {
    maxByte = "0";
  }
  if(typeof msg == "undefined") {
    msg = "";
  }

  $("#"+id+"_Byte").find("span").text(fnChkByteChk2(id));

  if($.trim($("#"+id).val()) == "") {
    fnValid(id, false, msg);
    $("#"+id+"_Byte").addClass("error");
    return false;
  } else {
    if(fnNumberChk(id) == false) {
      fnValid(id, false, msg);
      $("#"+id+"_Byte").addClass("error");
      return false;
    } else {
      if(fnChkByteChk(id, maxByte) == false) {
        fnValid(id, false, msg);
        $("#"+id+"_Byte").addClass("error");
        return false;
      } else {
        fnValid(id, true, "");
        $("#"+id+"_Byte").removeClass("error");
        return true;
      }
    }
  }
};

fnGlQuoteText = function(id, langCd) {
  var maxByte = $("#"+id).attr("data-byte");
  var msg = $("#"+id).attr("data-vmsg");
  if(typeof maxByte == "undefined") {
    maxByte = "0";
  }
  if(typeof msg == "undefined") {
    msg = "";
  }

  $("#"+id+"_Byte").find("span").text(fnChkByteChk2(id));

  if($.trim($("#"+id).val()) == "") {
    fnValid(id, false, msg);
    $("#"+id+"_Byte").addClass("error");
    return false;
  } else {
    if(fnChkByteChk(id, maxByte) == false) {
      fnValid(id, false, msg);
      $("#"+id+"_Byte").addClass("error");
      return false;
    } else {
      fnValid(id, true, "");
      $("#"+id+"_Byte").removeClass("error");
      return true;
    }
  }
};

function getFTLUldTcdList() {

  getUldTcdList("FTL_SELECT_GRP", function (result, nationCd){
      console.log('callback-result', result);
      $('#ftl_unit').empty();
      if (result.uldTcdList.length > 1){
        //执行下拉框的逻辑
        let optionList = "";
        result.uldTcdList.forEach((item) => {
          optionList += ` <option value="${item.cd}">${item.defaultCdName}</option>`
        });
        const ftlSel = `<div class="selectWrap">
                                  <select id="FTL-select">
                                    ${optionList}
                                  </select>
                                </div>`
        $('#ftl_unit').append(ftlSel)
        selectInt();
        $('#FTL-select+#FTL-select-button+.ui-selectmenu-menu .ui-menu-item:first').click();
        $('#FCL-select+#FCL-select-button+.ui-selectmenu-menu .ui-menu-item:first').click();
        return;
      }

      let uldTcd = result.uldTcdList[0];
      let tipsText = getFtlUnitTip(nationCd);
      let ftlText  = ` <span class="txt"><span id="truck-unit-tcd" data-value="${uldTcd.cd}">${uldTcd.defaultCdName}</span>
                                                <span class="tooltipItem">
                                                    <button type="button" class="btnTooltip" onclick="truckUnitTips(event)">안내</button>
                                                    <div class="tooltipCont" id="tooltipContId" onclick="stopE(event)">
                                                        <p id="truck-unit-font">${tipsText}</p>
                                                    </div>
                                                </span>
                                            </span>`
      $('#ftl_unit').append(ftlText)
  });
};

function truckUnitTips(e){
  e.stopPropagation()
  $('#tooltipContId').addClass('active');
}

function stopE(e){
  e.stopPropagation()
}

$(document).on("click",(e)=>{
  $('#tooltipContId').removeClass('active');
})




function getUldTcdList(grpCd, callback) {
  let langCd = getLangCdByUrlSplit();
  let nationCd = $('#nationCd').val();
  $.ajax({
    async: false,
    type: 'GET',
    url  : "/estimate/getUnitList.do?nationCd=" + nationCd + "&langCd=" + langCd + "&grpCd=" + grpCd,
    error: function(xhr, status, error) {
      console.log(error);
    },
    success: function(result) {
      callback(result, nationCd);
    }
  });
};

function getFtlUnitTip(nationCd){
  let tipsText = '';
  if(globalQuoteRequestFlag){
    tipsText = GL_QUOTE_TEXT['t002_' + nationCd];
  }else {
    tipsText = getRDUnitTipsMap()[nationCd];
  }
  return tipsText;
}

function getRDUnitTipsMap(){
  let langCd = getLangCdByUrlSplit();
  let RDUnitMap = {};
  if('kr' === langCd) {
    RDUnitMap.MX = '북미-중미 간 53피트 컨테이너 트럭 운송 서비스';
    RDUnitMap.AE = '걸프만 국가 간 13.5미터 트럭 운송 서비스';
    RDUnitMap.ZA = '32 Ton Super Link';
    RDUnitMap.TR = '24 Ton Tilt Truck';
    RDUnitMap.US = '캐나다, 멕시코 간 53피트 컨테이너 트럭 운송 서비스';
    RDUnitMap.CA = '캐나다-미국 53피트 컨테이너 트럭 운송 서비스';
  }
  if('en' === langCd) {
    RDUnitMap.MX = '53\'FT container for U.S.-Central America cross-border service';
    RDUnitMap.AE = '13.5M box trailer for GCC Countries cross-border service';
    RDUnitMap.ZA = '32 Ton Super Link';
    RDUnitMap.TR = '24 Ton Tilt Truck';
    RDUnitMap.US = '53\'FT container for Canada, Mexico cross-border service';
    RDUnitMap.CA = '53\'FT container for U.S cross-border service';
  }
  if('es' === langCd) {
    RDUnitMap.MX = '53\'FT contenedor para servicio transfronterizo a Estados Unidos y Centroamérica';
    RDUnitMap.AE = '13.5M box trailer for GCC Countries cross-border service';
    RDUnitMap.ZA = '32 Ton Super Link';
    RDUnitMap.TR = '24 Ton Tilt Truck';
    RDUnitMap.US = 'Contenedor de 53\'FT para servicio transfronterizo de Canadá y México';
    RDUnitMap.CA = 'Contenedor de 53\'FT para servicio transfronterizo de EE. UU.';
  }
  if('vn' === langCd) {
    RDUnitMap.MX = '53\'FT container for U.S.-Central America cross-border service';
    RDUnitMap.AE = '13.5M box trailer for GCC Countries cross-border service';
    RDUnitMap.ZA = '32 Ton Super Link';
    RDUnitMap.TR = '24 Ton Tilt Truck';
    RDUnitMap.US = 'Container 53\'FT tuyến xuyên biên giới Canada, Mexico';
    RDUnitMap.CA = 'Container 53\'FT cho tuyến xuyên biên giới Hoa Kỳ';
  }
  return RDUnitMap;
}

function addVRFCLQuoteResult(){
  let langCd = getLangCdByUrlSplit();
  if(langCd !== 'kr')
    return;
  let requestData = getQuoteRequestData(langCd);
  let pathName = window.location.pathname;
  if('VS' === requestData.svcMedCtgryCd &&  'FCL' === requestData.svcClassCd && '/kr/quote/quote-request.do' === pathName){
    $('#inner-quote-result').append(`
                <div class="banner-quote-ocean quote-result-remove">
                    <a href="/kr/contact.do?celloInSelect=Bidding">
                        <img src="/static/assets-new/banner-quote-ocean.png" alt="경쟁력 있는 운임, 안정적 선적 보장" class="pc-img">
                        <img src="/static/assets-new/banner-quote-ocean-mo.png" alt="경쟁력 있는 운임, 안정적 선적 보장" class="mo-img">
                    </a>
                </div>`)
  }
}

function addExpressKRtoUSQuoteResult(){
  let langCd = getLangCdByUrlSplit();
  if(langCd !== 'kr')
    return;
  let requestData = getQuoteRequestData(langCd);
  let pathName = window.location.pathname;
  if('EXP' === requestData.svcMedCtgryCd && requestData.deppNm === 'KR' && requestData.arrpNm === 'US'){
    $('#inner-quote-result').append(`
                <div class="pt-100 quote-result-remove">
                    <a href="https://www.cello-square.com/kr/promotion/view-174.do">
                        <img src="/static/assets-new/popup/240902-img03.jpg" alt="미국 특송 한정 특가 이벤트" style="width:100%;height:auto;" class="pc-img">
                        <img src="/static/assets-new/popup/240902-img03(m).jpg" alt="미국 특송 한정 특가 이벤트" style="width:100%;height:auto;" class="mo-img">
                    </a>
                </div`)
  }
}

function estimateBtnSearchClick(){
  let inputVal =$(event.target).prev().prev().val();
  getCountryTransModeAjax("", inputVal);
}

function defaultSelCountry(clientQuoteNation){
  console.log("clientQuoteNation: ", clientQuoteNation)
  if(!clientQuoteNation)
    return;
  setTimeout(()=> {
    $(`.head-country-list > li > a[value='${clientQuoteNation}']`).click();
    $('#nationCd').val(clientQuoteNation);
    // [Zendesk] 将 IP 识别的国家存入 sessionStorage，供聊天组件使用
    sessionStorage.setItem('QUOTE_NATION_CD', clientQuoteNation);
  }, 50)
}
