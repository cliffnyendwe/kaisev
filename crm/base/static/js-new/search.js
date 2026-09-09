/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */

//var transPage = 'https://www.samsungsds.com/app/search/transnew.jsp';

/* if(window.location.hostname == "182.198.89.25"){
  transPage = "/cn/search/trans.jsp"; // 타 언어
} */

var hostname;
if (window.location.hostname === 'www.cello-square.com') {
  hostname = ''
} else {
  hostname = 'https://www.cello-square.com'
}

// eslint-disable-next-line no-unused-vars
function fnCheckSearchBar(event, contsTp, langCd) {
  var input = $(event.target);
  var keyword = input.val();
  var inputStr = $.trim(keyword);
  /* 220503 수정 */
  var targetId = input.attr("id");

  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  /* //220503 수정 */
  var list = listCon.find('ul > li');
  var actList = list.filter('.active');
  var targetList;

  //listCon.show();

  $(document).one('mouseup.search', function() {
    listCon.hide();
  });

  if (event.keyCode === 38) {
    // up
    if (actList.length) {
      targetList = actList.prev();
      actList.removeClass('active');

      if (!targetList.length) {
        // 이전 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':last').focus().addClass('active');
      input.val(list.filter(':last').data('keyword'));
    }
  } else if (event.keyCode === 40) {
    // down
    if (actList.length) {
      targetList = actList.next();
      actList.removeClass('active');

      if (!targetList.length) {
        // 다음 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':first').focus().addClass('active');
      input.val(list.filter(':first').data('keyword'));
    }
  } else if (event.keyCode === 37 || event.keyCode === 39) {
    // left, right
  } else if (event.keyCode === 13) {

      if(contsTp == "estimate" && !inputEqualToSearch(targetId)){
        return ;
      }
      // enter
      input.val(inputStr); //trim value
      fnSearch(keyword, contsTp, targetId); // 검색
  } else {
    // 검색어 입력
    input.data('keyword', keyword); // 현재 검색어 저장
    if(inputStr.length > 1) {// 2글자 이상부터 자동완성
        /* 220503 수정 */
	  	autocomplete(keyword, contsTp, langCd, input); //자동완성 호출
	}
  }

  var del = input.next('.btn-delet');
  del.toggle(input.val().length !== 0);

  del.off('click.search').on('click.search', function (e) {
    input.val('');
  });
}

function inputEqualToSearch(targetId){
  var check = false;
  $("."+targetId+"-auto-complete-list").find('ul').find('li').each(function (i) {
    if ( $(this).text() == $("#"+targetId).val() ) {
      check = true;
    }
  });
  return check;
}

function autocomplete(keyword, contsTp, langCd , input) {

  var word = input.val();
  /* 220503 수정 */
  var targetId = input.attr("id");

  /*if (keyword === '') {
    word = '____';
  }*/

  if(contsTp == "estimate" && inputEqualToSearch(targetId)){
    return ;
  }

  word = word.replace(/\!|\@|\#|\$|\%|\^|\&|\*|\[|\]|\?|\(|\)/gi, ' ');
  word = word.replace(/\<|\>/gi, ' ');
  word = word.replace(/\+|\-/gi, ' ');
  word = word.replace(/\:|\;/gi, ' ');
  word = word.replace(/\[|\]/gi, ' ');
  word = word.replace(/\\/gi, ' ');

  var inputStr = $.trim(word + ''); //검색어
  var transPage = hostname + "/"+langCd+"/"+contsTp+"/"+contsTp+"-auto-ajax.do";
  var param = {searchValue: '' + inputStr, searchType : $("#searchType").val()};

  /* 220503 수정 */
  if(targetId == "departure" || targetId == "arrival"){

    param.searchType = $("input[type=radio][name=transport]:checked").val();
  }
  /* //220503 수정 */

  $.ajax({
    //type: 'POST',
    type: 'GET',
    data: param,
    url  : transPage,
    error: function(xhr, status, error) {
      //console.log(status);
      //console.log(xhr);
      //console.log(error);
      //alert(ajaxErrorMsg);
    },
    success: function(result) {
      //console.log(result);
      if (typeof result !== 'object') {
        result = JSON.parse(result); //text를 javascript 객체로 변환
      }
      var cnt = keyword.length; //검색어 글자수

      /* 220503 수정 */
      var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');

      listCon.find('li').remove();

      var li;
      var flag = false;
      if(contsTp === 'glossary'){
        $.each(result.dataMap, function (k, v) {
          flag = true;
          listCon.find('ul').append('<li></li>');
          li = listCon.find('ul').find('li:last');
          /* 220503 수정 */
          var rst = v;
          li.append(
              '<a href="javascript:void(0)" class="kwd" onclick="javascript:fnSearch(\'' +
              stringEscape(rst) +
              '\', \''+contsTp+'\', \''+targetId+'\', \''+k+'\')">' +
              rst.replace(
                  new RegExp('(|.+)(' + keyword + ')(.+|)', 'g'),
                  '$1<strong class="mark">$2</strong>$3'
              ) +
              '</a>'
          );

          /* 220503 수정 */
          if( targetId == "searchValue" ){
            li.append(
                '<a href="#" class="btn-add" role="button" onclick="javascript:fnSearch(\'' +
                stringEscape(rst) +
                '\', \''+contsTp+'\', \''+targetId+'\', \''+k+'\')"><class class="hidden">추가</span></a>'
            );
          }

          li.data('keyword', rst);
        });
        if(flag){
          listCon.show();
        }else {
          listCon.hide();
        }
        return;
      }else {
        $(result).each(function(i) {
          listCon.find('ul').append('<li></li>');
          li = listCon.find('ul').find('li:last');
          /* 220503 수정 */
          var rst = result[i];
          li.append(
              '<a href="javascript:void(0)" class="kwd" onclick="javascript:fnSearch(\'' +
              stringEscape(rst) +
              '\', \''+contsTp+'\', \''+targetId+'\')">' +
              rst.replace(
                  new RegExp('(|.+)(' + keyword + ')(.+|)', 'g'),
                  '$1<strong class="mark">$2</strong>$3'
              ) +
              '</a>'
          );

          /* 220503 수정 */
          if( targetId == "searchValue" ){
            li.append(
                '<a href="#" class="btn-add" role="button" onclick="javascript:fnSearch(\'' +
                stringEscape(rst) +
                '\', \''+contsTp+'\', \''+targetId+'\')"><class class="hidden">추가</span></a>'
            );
          }

          li.data('keyword', rst);
        });
      }

      if(result.length>0){
        listCon.show();
      }else {
        listCon.hide();
      }
    }
  });
}

function stringEscape(str){
  if(!str){
    return str;
  }
  return str.replace(/\'/g, "&#39;").replace(/\"/g, "&quot;").replace(/&/g, "&amp;");
}

function stringEscape2(str){
  if(!str){
    return str;
  }
  return str.replace(/&/g, "&amp;");
}

function stringUnEscape(str){
  if(!str){
    return str;
  }
  var temp = document.createElement("div");
  // temp.innerHTML = str; // prevent xss
  temp.textContent = str;
  var rst = temp.innerText;
  temp = null;
  return rst;
}

function fnSearch(keyword, contsTp, targetId, seqNo) {
  //var input = $('.search-area input');
  $(document).off('mouseup.search');
  keyword = stringUnEscape(keyword);
  /*220503 수정*/
  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  // $('#searchValue').val(keyword);
  $('#'+targetId).val(keyword);
  listCon.hide();
  if(targetId == "searchValue"){
    if(contsTp === 'glossary'){
      $("#glossarySeqNo").val(seqNo);
    }
    $("#btnSearch").click();
  } else {
    $("#"+targetId).change();
  }


  //input.val(keyword);
  //alert('serach : ' + keyword);

}

function fnLanguageTapClick(lang) {

  $element = $('.mo-glossary-tap .tablinks');

  $element.removeClass('active');

  if (lang == 'kor') {

    $element.eq(0).addClass('active');

    $('#KOR').show();

    $('#ENG').hide();
    $('#enResult').hide();
    $('#krResult').show();

  }

  if (lang == 'eng') {
    console.log($element);
    $element.eq(1).addClass('active');

    $('#KOR').hide();

    $('#ENG').show();
    $('#krResult').hide();
    $('#enResult').show();

  }

}

/**
 * 키보드 언어 탭  Click Function
 *
 * 최초 로딩시 PC : KOR, ENG All Show
 *            Mobile : KOR show
 * @Date 2023.03.06
 */
window.onload = function() {
  // This checks if the current device is in fact mobile
  if (/Android|iPhone/i.test(navigator.userAgent)) {
    // $('#ENG').hide();
  }

};

function fnCheckSearchBarExpress(event, contsTp, langCd, expressNationJson) {
  var input = $(event.target);
  var keyword = input.val();
  var inputStr = $.trim(keyword);
  /* 220503 수정 */
  var targetId = input.attr("id");

  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  /* //220503 수정 */
  var list = listCon.find('ul > li');
  var actList = list.filter('.active');
  var targetList;

  //listCon.show();

  $(document).one('mouseup.search', function() {
    listCon.hide();
  });

  if (event.keyCode === 38) {
    // up
    if (actList.length) {
      targetList = actList.prev();
      actList.removeClass('active');

      if (!targetList.length) {
        // 이전 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':last').focus().addClass('active');
      input.val(list.filter(':last').data('keyword'));
    }
  } else if (event.keyCode === 40) {
    // down
    if (actList.length) {
      targetList = actList.next();
      actList.removeClass('active');

      if (!targetList.length) {
        // 다음 없으면 저장한 검색어 넣기
        input.val(input.data('keyword'));
      } else {
        targetList.focus().addClass('active');
        input.val(targetList.data('keyword'));
      }
    } else {
      list.filter(':first').focus().addClass('active');
      input.val(list.filter(':first').data('keyword'));
    }
  } else if (event.keyCode === 37 || event.keyCode === 39) {
    // left, right
  } else if (event.keyCode === 13) {

    if(contsTp == "estimate" && !inputEqualToSearch(targetId)){
      return ;
    }
    // enter
    input.val(inputStr); //trim value
    fnSearch(keyword, contsTp, targetId); // 검색
  } else {
    // 검색어 입력
    input.data('keyword', keyword); // 현재 검색어 저장
    if(inputStr.length > 1) {// 2글자 이상부터 자동완성
      /* 220503 수정 */
      autocompleteExpress(keyword, contsTp, langCd, input, expressNationJson); //자동완성 호출
    }
  }

  var del = input.next('.btn-delet');
  del.toggle(input.val().length !== 0);

  del.off('click.search').on('click.search', function (e) {
    input.val('');
  });
}

function autocompleteExpress(keyword, contsTp, langCd , input, expressNationJson) {

  var word = input.val();
  /* 220503 수정 */
  var targetId = input.attr("id");

  if(contsTp == "estimate" && inputEqualToSearch(targetId)){
    return ;
  }
  var inputStr = $.trim(word + ''); //검색어
  /* 220503 수정 */
  var listCon = targetId == "searchValue" ? $('.auto-complete-list') : $('.'+targetId+'-auto-complete-list');
  listCon.find('li').remove();
  var li;

  if(expressNationJson.data != undefined){
    var expressNationList = expressNationJson.data;
    var flag = false;
    $.each(expressNationList, function (index, item){
      var rst = item.nation_eng_nm + "(" + item.nation_cd + ")";

      if(rst.toLowerCase().indexOf(inputStr.toLowerCase()) !== -1){
        flag = true;
        listCon.find('ul').append('<li></li>');
        li = listCon.find('ul').find('li:last');
        /* 220503 수정 */

        li.append(
            '<a href="javascript:void(0)" class="kwd" onclick="javascript:fnSearch(\'' +
            stringEscape(rst) +
            '\', \''+contsTp+'\', \''+targetId+'\')">' +
            rst.replace(
                new RegExp('(|.+)(' + keyword + ')(.+|)', 'g'),
                '$1<strong class="mark">$2</strong>$3'
            ) +
            '</a>'
        );

        /* 220503 수정 */
        if( targetId == "searchValue" ){
          li.append(
              '<a href="#" class="btn-add" role="button" onclick="javascript:fnSearch(\'' +
              stringEscape(rst) +
              '\', \''+contsTp+'\', \''+targetId+'\')"><class class="hidden">추가</span></a>'
          );
        }

        li.data('keyword', rst);
      }
    });
    if(flag){
      listCon.show();
    }else {
      listCon.hide();
    }
  }
}

// <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js"></script>
/*function encryptQueryData(queryData) {
  var passPhrase =
    '81109e268d0a2495485ae5c97abd1e68d995322a00304de200277c6c36b43541999ca6055d7210399f5b2515e88a7438a112c4cea9444997e8439fb969c4483c';
  var encryptData = CryptoJS.AES.encrypt(queryData, passPhrase);
  return encryptData;
}*/
