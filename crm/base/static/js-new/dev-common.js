let seqEvtNo = false;
$(function() {

	expressResponseDataFun = function (){
		var data;
		$.ajax({
			url: "/estimate/list-express-nation-ajax.do",
			dataType: 'json',
			async: false,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			type: "GET",
			success: function (json){
				console.log(json)
				data = json;
			},
			error: function (){
				console.log("查询失败");
				data = "";
			}
		});
		return data;
	};
	// 검색어 x클릭시 초기화
	$(".btn-delet").click(function() {
		$("#searchValue").val("");
		$(this).hide();
	});

	// 전체상품 노출
	$("#globalProView, #globalBtnSearch, #globalProViewBtn, #floatingProView").click(function() {
		var sendValue = {"globalSearchValue":$("#globalSearchValue").val(), "globalSearchType":$("#globalSearchType").val()}
		$.ajax({
			url : "/globalProView.do"
			, dataType : 'json'
			, data : sendValue
			, type : "GET"
			, contentType: "application/x-www-form-urlencoded; charset=UTF-8"
			, success : function (json){
				//성공시
				//console.log(json.list);
				var resultText = ""; //html 삽입값
				var sortnumber = ""; //data-sort 구분
				var bkgrColorType = ""; //viewTypeBg구분 viewTypeImgBkgrColorCcd GOODS_VW_BG_01
				var pcIconImg = ""; //viewTypeImgCcd구분 (아이콘)
				var mobIconImg = ""; //viewTypeImgCcd구분 (아이콘)
				var hTag = ""; // viewTypeImgHashTag 값 담기

				$.each(json.list, function (index, list) {

					if(list.mvSqprdCtgry == "MVSQPRD_01"){
						sortnumber = 'sort1';
					} else if(list.mvSqprdCtgry == "MVSQPRD_02") {
						sortnumber = 'sort2';
					} else if(list.mvSqprdCtgry == "MVSQPRD_03") {
						sortnumber = 'sort3';
					}

					if(list.viewTypeImgBkgrColorCcd == "GOODS_VW_BG_01") {
						bkgrColorType = '#000'; // 블랙
					} else if(list.viewTypeImgBkgrColorCcd == "GOODS_VW_BG_02") {
						bkgrColorType = '#00c5a8'; //그린
					} else if(list.viewTypeImgBkgrColorCcd == "GOODS_VW_BG_03") {
						bkgrColorType = '#FAAC58'; // 오렌지
					} else if(list.viewTypeImgBkgrColorCcd == "GOODS_VW_BG_04") {
						bkgrColorType = '#'+list.viewTypeImgBkgrColorVal; //사용자지정
					}

					if(list.viewTypeImgCcd == "GOODS_VW_BG_DIV_01") { //--------------------------이미지 나오면 변경해야됨!------------------
						pcIconImg = '/static/assets/icon_p_flight.png';
						mobIconImg = '/static/assets/icon_m_flight.png';
					} else if(list.viewTypeImgCcd == "GOODS_VW_BG_DIV_01") {
						pcIconImg = '/static/assets/icon_p_flight.png';
						mobIconImg = '/static/assets/icon_m_flight.png';
					} else if(list.viewTypeImgCcd == "GOODS_VW_BG_DIV_01") {
						pcIconImg = '/static/assets/icon_p_flight.png';
						mobIconImg = '/static/assets/icon_m_flight.png';
					} else if(list.viewTypeImgCcd == "GOODS_VW_BG_DIV_01") {
						pcIconImg = '/static/assets/icon_p_flight.png';
						mobIconImg = '/static/assets/icon_m_flight.png';
					}

					resultText += '<input type="hidden" id="metaOgTitle_'+list.metaSeqNo+'" value="'+list.metaTitleNm+'"/>';
					resultText += '<input type="hidden" id="metaOgDesc_'+list.metaSeqNo+'" value="'+list.metaDesc+'"/>';
					if(list.viewTypeImg == 'GOODS_VW_TP_01'){
						resultText += '<div class="card-con image-type">'; // <-이부분 에따라서 이미지 타입이 달라짐
						resultText += '<div class="card-con-inner">';
					    resultText += '<a href="/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'" role="button">';
					    resultText += '<em class="category" data-sorting="'+sortnumber+'">'+ list.mvSqprdCtgryNm + '</em>';
					    resultText += '<strong class="title">'+list.sqprdNm+'</strong>';
				        resultText += '<p class="text">'+list.sqprdSummaryInfo+'</p>';
				        resultText += '<div class="img">';
				        resultText += '<img src="/goodsImgView.do?sqprdSeqNo='+list.sqprdSeqNo+'&imgKinds=viewTypeList" alt="'+list.viewTypeImgAlt+'">';
				        resultText += '</div>';
				        resultText += '</a>';
				        resultText += '<button type="button" class="btn-share"><span class="hidden">공유하기 열기</span></button>';
				        resultText += '<div class="content-sns-box">';
				        resultText += '<button type="button"><span class="hidden">공유하기 닫기</span></button>';
				        resultText += '<ul class="content-sns">';
				        resultText += '<li class="kakao" id="kakao-link-globalBtn-'+index+'"><a href="javascript:;" role="button"><span class="hidden">kakaotalk</span></a></li>';
				        resultText += '<li class="facebook"><a href="javascript:;" onclick="facebookShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">facebook</span></a></li>';
				        //resultText += '<li class="twitter"><a href="javascript:;" onclick="twiterShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">twitter</span></a></li>';
				        resultText += '<li class="linked-in"><a href="javascript:;" onclick="linkedinShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">LinkedIn</span></a></li>';
				        resultText += '<li class="url-copy"><a href="javascript:;" onclick="urlCopy(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">url copy</span></a></li>';
				        resultText += '</ul>';
				        resultText += '</div>';
				        resultText += '</div>';
				        resultText += '</div>';
					} else if (list.viewTypeImg == 'GOODS_VW_TP_02') {
						resultText += '<div class="card-con image-bg-type">';
						resultText += '<div class="card-con-inner">';
						resultText += '<a href="/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'" role="button">';
				        resultText += '<em class="category" data-sorting="'+sortnumber+'">'+ list.mvSqprdCtgryNm + '</em>';
				        resultText += '<strong class="title">'+list.sqprdNm+'</strong>';
				        resultText += '<p class="text">'+list.sqprdSummaryInfo+'</p>';
				        resultText += ' <div class="img">';
				        resultText += '<img src="/goodsImgView.do?sqprdSeqNo='+list.sqprdSeqNo+'&imgKinds=viewTypeList" alt="'+list.viewTypeImgAlt+'">';
				        resultText += '</div>';
				        resultText += '</a>';
				        resultText += '<button type="button" class="btn-share"><span class="hidden">공유하기 열기</span></button>';
				        resultText += '<div class="content-sns-box">';
				        resultText += '<button type="button"><span class="hidden">공유하기 닫기</span></button>';
				        resultText += '<ul class="content-sns">';
				        resultText += '<li class="kakao" id="kakao-link-globalBtn-'+index+'"><a href="javascript:;" role="button"><span class="hidden">kakaotalk</span></a></li>';
				        resultText += '<li class="facebook"><a href="javascript:;" onclick="facebookShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">facebook</span></a></li>';
				        //resultText += '<li class="twitter"><a href="javascript:;" onclick="twiterShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">twitter</span></a></li>';
				        resultText += '<li class="linked-in"><a href="javascript:;" onclick="linkedinShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">LinkedIn</span></a></li>';
				        resultText += '<li class="url-copy"><a href="javascript:;" onclick="urlCopy(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">url copy</span></a></li>';
				        resultText += '</ul>';
				        resultText += '</div>';
				        resultText += '</div>';
				        resultText += '</div>';
					} else if (list.viewTypeImg == 'GOODS_VW_TP_03') {
						if(list.viewTypeImgBkgrColorOpt == 'GOODS_VW_BG_OP_01') {
							resultText += '<div class="card-con text-type">';
							resultText += '<div class="card-con-inner" style="background:'+bkgrColorType+'">'; //<- 색상값
					        resultText += '<a href="/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'" role="button">';
							resultText += '<em class="category" data-sorting="'+sortnumber+'">'+ list.mvSqprdCtgryNm + '</em>';
							resultText += '<strong class="title">'+list.sqprdNm+'</strong>';
							resultText += '<p class="text">'+list.sqprdSummaryInfo+'</p>';
							resultText += '<div class="from-to">';
							resultText += '<span>'+list.viewTypeImgFrom+'</span>';
							resultText += '<div class="img">';
							resultText += '<img src="'+pcIconImg+'" alt="" class="pc-img">';
							resultText += '<img src="'+mobIconImg+'" alt="" class="mo-img">';
							resultText += '</div>';
							resultText += '<span>'+list.viewTypeImgTo+'</span>';
							resultText += '</div>';
					        resultText += '</a>';
					        resultText += '<button type="button" class="btn-share"><span class="hidden">공유하기 열기</span></button>';
					        resultText += '<div class="content-sns-box">';
					        resultText += '<button type="button"><span class="hidden">공유하기 닫기</span></button>';
					        resultText += '<ul class="content-sns">';
					        resultText += '<li class="kakao" id="kakao-link-globalBtn-'+index+'"><a href="javascript:;" role="button"><span class="hidden">kakaotalk</span></a></li>';
					        resultText += '<li class="facebook"><a href="javascript:;" onclick="facebookShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">facebook</span></a></li>';
				      		//resultText += '<li class="twitter"><a href="javascript:;" onclick="twiterShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">twitter</span></a></li>';
				      		resultText += '<li class="linked-in"><a href="javascript:;" onclick="linkedinShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">LinkedIn</span></a></li>';
				       		resultText += '<li class="url-copy"><a href="javascript:;" onclick="urlCopy(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">url copy</span></a></li>';
					        resultText += '</ul>';
					        resultText += '</div>';
					        resultText += '</div>';
					        resultText += '</div>';
						} else if(list.viewTypeImgBkgrColorOpt == 'GOODS_VW_BG_OP_02') {
							resultText += '<div class="card-con text-type">';
							resultText += '<div class="card-con-inner" style="background:'+bkgrColorType+'">'; //<- 색상값
							resultText += '<a href="/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'" role="button">';
					        resultText += '<em class="category" data-sorting="'+sortnumber+'">'+ list.mvSqprdCtgryNm + '</em>';
					        resultText += '<strong class="title">'+list.sqprdNm+'</strong>';
					        resultText += '<p class="text">'+list.sqprdSummaryInfo+'</p>';
					        hTag = list.viewTypeImgHashTag;
							var arrHTag = hTag.split(",");
					        resultText += '<ul class="hash-tag-list">';
							for (var i = 0; i < arrHTag.length; i++) {
								 resultText += '<li><span>#'+arrHTag[i]+'</span></li>';
							}
					        resultText += '</ul>';
					        resultText += '</a>';
					        resultText += '<button type="button" class="btn-share"><span class="hidden">공유하기 열기</span></button>';
					        resultText += '<div class="content-sns-box">';
					        resultText += '<button type="button"><span class="hidden">공유하기 닫기</span></button>';
					        resultText += '<ul class="content-sns">';
					        resultText += '<li class="kakao" id="kakao-link-globalBtn-'+index+'"><a href="javascript:;" role="button"><span class="hidden">kakaotalk</span></a></li>';
					        resultText += '<li class="facebook"><a href="javascript:;" onclick="facebookShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">facebook</span></a></li>';
				       		//resultText += '<li class="twitter"><a href="javascript:;" onclick="twiterShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">twitter</span></a></li>';
				       		resultText += '<li class="linked-in"><a href="javascript:;" onclick="linkedinShare(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">LinkedIn</span></a></li>';
				       		resultText += '<li class="url-copy"><a href="javascript:;" onclick="urlCopy(\'/'+list.langCd+'/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\');" role="button"><span class="hidden">url copy</span></a></li>';
					        resultText += '</ul>';
					        resultText += '</div>';
					        resultText += '</div>';
					        resultText += '</div>';
						}
					}

					resultText += '<script type="text/javascript">';
					resultText += '	kakaoShare(\'kakao-link-globalBtn-'+index+'\',\'/kr-ko/service/view-'+list.sqprdSeqNo+'.do?metaSeqNo='+list.metaSeqNo+'\',\''+list.metaSeqNo+'\');';
					resultText += '</script>';

				});
				if(json.listSize <= 0){
					var noList = '<div class="no-list">검색결과가 없습니다.</div>';
					$("#globalCardList").after(noList);
				}
				$('#popup_product').getInstance().open();
				$("#globalCardList").html(resultText);

			}
			, error : function(xhr) {
				alert("Network Error");
			}
		});

		// 성공시
		/*var inHtml = '';

		*/
	});




	// 문의하기, 백서, 뉴스레터 validation
 	fnValid = function(id, tf, txt) {
		if(tf) {
			$("#"+id).removeClass("error");
			$("#"+id).addClass("success");
			if($("#"+id).parent(".selectWrap").length > 0) {
				$("#"+id).parents(".selectWrap").removeClass("error");
				$("#"+id).parents(".selectWrap").next("div.form-con-info").remove();
			} else {
				if(id === 'shipping-section-start'){
					id = 'shipping-section-end';
				}
				$("#"+id).next("div.form-con-info").remove();
			}
			retTF = true;
		} else {
			$("#"+id).removeClass("success");
			$("#"+id).addClass("error");
			$("#"+id).focus();
			if(window.event){
				var target = window.event.target;
				const targetId = target.getAttribute('id');
				if(!$("#"+id).is('select') && 'btnSend' === targetId){
					elementRollCenter($("#"+id));
				}
			}
			if($("#"+id).parent(".selectWrap").length > 0) {
				$("#"+id).parents(".selectWrap").addClass("error");
				$("#"+id).parent(".selectWrap").next("div.form-con-info").remove();
				$("#"+id).parent(".selectWrap").after('<div class="form-con-info"><p class="error-text error">'+txt+'</p></div>');
			} else {
				if(id === 'shipping-section-start'){
					id = 'shipping-section-end';
				}
				$("#"+id).next("div.form-con-info").remove();
				$("#"+id).after('<div class="form-con-info"><p class="error-text error">'+txt+'</p></div>')

			}
			retTF = false;
   		}
	};

	// select box check
	fnSelect = function(id, langCd) {
		var msg = $("#"+id).attr("data-vmsg");
		if(typeof msg == "undefined") {
			msg = "";
		}
		if(id == 'category'){
			console.log("category:" + $("#"+id).val());
		}
		if(id == 'country'){
			console.log($("#"+id).val());
		}
		if($("#"+id).val() == "") {
			if(langCd == "kr") {
				fnValid(id, false, msg+" 선택해주세요.");
			} else if(langCd == "cn-zh") {
				fnValid(id, false, "选择咨询项目");
			} else if(langCd == "sg-en") {
				if (msg) {
					fnValid(id, false, "Please select your " + msg + ".");
				} else {

				}
			} else if(langCd == "vn") {
				if(msg){
					fnValid(id, false, "Vui lòng chọn " + msg + ".");
				}else {
					fnValid(id, false, "Vui lòng chọn mục cần hỏi.");
				}

			} else if(langCd == "es") {
				if (msg) {
					fnValid(id, false, "Por favor, Seleccione tu " + msg + ".");
				} else {
					fnValid(id, false, "Por favor, seleccione un valor de división.");
				}
			} else {
				if (msg) {
					fnValid(id, false, "Please select your " + msg + ".");
				} else {
					fnValid(id, false, "Please select your a division value.");
				}
			}
			//$('html, body').animate({scrollTop : 0}, 40);
			return false;
		} else {
			fnValid(id, true, "");
			return true;
		}
	};

	// input text check
	fnText = function(id, langCd) {
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
			if(langCd == "kr") {
				fnValid(id, false, msg+" 입력해 주세요.");
			} else if(langCd == "cn-zh") {
				fnValid(id, false, "请输" + msg);
			} else if(langCd == "vn") {
				if(id === 'company-title'){
					fnValid(id, false, msg);
				}else {
					fnValid(id, false, "Vui lòng nhập " + msg + " của bạn.");
				}
			} else if(langCd == "es") {
				fnValid(id, false, "Por favor, introduzca su " + msg + ".");
			} else {
				fnValid(id, false, "Please enter your " + msg + ".");
			}
			$("#"+id+"_Byte").addClass("error");
			return false;
		} else {
			if(fnChkByteChk(id, maxByte) == false) {
				if(langCd == "kr") {
					fnValid(id, false, msg+" "+maxByte+"Byte 내로 입력해주세요.");
				} else if(langCd == "cn-zh") {
					fnValid(id, false, "请在"+maxByte+"字符内输入" + msg + "。");
				} else if(langCd == "vn") {
					fnValid(id, false, "Vui lòng nhập " + msg + " trong vòng "+maxByte+" byte.");
				} else if(langCd == "es") {
					fnValid(id, false, "Introduzca su " + msg + " dentro de "+maxByte+" bytes.");
				} else {
					fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
				}
				$("#"+id+"_Byte").addClass("error");
				return false;
			} else {
				fnValid(id, true, "");
				$("#"+id+"_Byte").removeClass("error");
				return true;
			}
		}
	};

	fnName = function(id, langCd) {
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
			if(langCd == "kr") {
				fnValid(id, false, msg+" 입력해 주세요.");
			} else if(langCd == "cn-zh") {
				fnValid(id, false, "请输" + msg);
			} else if(langCd == "vn") {
				fnValid(id, false, "Vui lòng nhập " + msg + " của bạn.");
			} else if(langCd == "es") {
				fnValid(id, false, "Por favor, Introduzca su " + msg + ".");
			} else {
				fnValid(id, false, "Please enter your " + msg + ".");
			}
			$("#"+id+"_Byte").addClass("error");
			return false;
		} else {
			if (fnNumberSpecialChk(id) == true) {
				if(langCd == "kr") {
    				fnValid(id, false, "형식에 맞게 입력해주세요.");
    			} else if(langCd == "en") {
					fnValid(id, false, "Please enter in the correct format.");
				} else if(langCd == "cn-zh") {
					fnValid(id, false, "请以正确的格式输入");
				} else if(langCd == "vn") {
					fnValid(id, false, "vui lòng nhập vào định dạng tương ứng.");
				}else if(langCd == "es") {
					fnValid(id, false, "Por favor, Introduzca en el formato correcto.");
				} else {
					fnValid(id, false, "Please enter in the correct format.");
				}
				$("#"+id+"_Byte").addClass("error");
    			return false;
    		} else {
    			if(fnChkByteChk(id, maxByte) == false) {
    				if(langCd == "kr") {
							fnValid(id, false, msg+" "+maxByte+"Byte 내로 입력해주세요.");
						} else if(langCd == "cn-zh") {
							fnValid(id, false, "请在"+maxByte+"字符内输入" + msg + "。");
						} else if(langCd == "vn") {
							fnValid(id, false, "Vui lòng nhập " + msg + " trong vòng "+maxByte+" byte.");
						} else if(langCd == "es") {
							fnValid(id, false, "Por favor, Introduzca su " + msg + " dentro de "+maxByte+" bytes.");
						} else {
							fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
						}
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

	// input email check
	fnEmail = function(id, langCd) {
		var maxByte = $("#"+id).attr("data-byte");
		var msg = $("#"+id).attr("data-vmsg");
		if(typeof maxByte == "undefined") {
			maxByte = "0";
		}
		if(typeof msg == "undefined") {
			msg = "";
		}

		if($.trim($("#"+id).val()) == "") {
			if(langCd == "kr") {
				fnValid(id, false, msg+" 입력해 주세요.");
			} else if(langCd == "cn-zh") {
				fnValid(id, false, "请输" + msg);
			} else if(langCd == "vn") {
				fnValid(id, false, "Vui lòng nhập địa chỉ e-mail của bạn.");
			} else if(langCd == "es") {
				fnValid(id, false, "Por favor, Introduzca su " + msg + ".");
			} else {
				fnValid(id, false, "Please enter your " + msg + ".");
			}
			return false;
		} else {
			if (fnEmailChk(id) == false) {
				if(langCd == "kr") {
    				fnValid(id, false, "이메일 형식에 맞게 입력해주세요.");
				} else if(langCd == "cn-zh") {
					fnValid(id, false, "邮箱地址错误。");
				} else if(langCd == "vn") {
					fnValid(id, false, "Định dạng e-mail không chính xác.");
				} else if(langCd == "es") {
					fnValid(id, false, "El formato de correo electrónico es incorrecto.");
				} else {
					fnValid(id, false, "The e-mail format is incorrect.");
				}
				return false;
			} else {
			    // 针对 es 环境特殊页面进行的邮箱校验
//			    if(checkIsSpecialEvent() &&  checkSpecialMailAddress(id)){
//                   fnValid(id, false, "Introduzca su correo electrónico corporativo.");
//                   return false;
//                }
				if(fnChkByteChk(id, maxByte) == false) {
					if(langCd == "kr") {
						fnValid(id, false, msg+" "+maxByte+"Byte 내로 입력해주세요.");
					} else if(langCd == "cn-zh") {
						fnValid(id, false, "请在"+maxByte+"字符内输入" + msg + "。");
					} else if(langCd == "vn") {
						fnValid(id, false, "Vui lòng nhập " + msg + " trong vòng "+maxByte+" byte.");
					} else if(langCd == "es") {
						fnValid(id, false, "Por favor, Introduzca su " + msg + " dentro de "+maxByte+" bytes.");
					} else {
						fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
					}
					return false;
				} else {
					fnValid(id, true, "");
					return true;
				}
			}
		}
	};

	// input number check
	fnNumber = function(id, langCd) {
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
			if(langCd == "kr") {
				fnValid(id, false, msg+" 입력해 주세요.");
			} else if(langCd == "en") {
				fnValid(id, false, "Please enter your " + msg + ".");
			} else if(langCd == "cn-zh") {
				fnValid(id, false, "请输" + msg);
			} else if(langCd == "vn") {
				fnValid(id, false, "Vui lòng nhập số điện thoại của bạn.");
			} else if(langCd == "sg-en") {
				fnValid(id, false, "Please enter your " + msg + ".");
			} else if(langCd == "es") {
				fnValid(id, false, "Por favor, introduzca su " + msg + ".");
			} else {
				fnValid(id, false, "Please enter your " + msg + ".");
			}
			$("#"+id+"_Byte").addClass("error");
			return false;
		} else {
			if(fnNumberChk(id) == false) {
				if(langCd == "kr") {
					fnValid(id, false, "숫자만 입력해주세요.");
				} else if(langCd == "cn-zh") {
					fnValid(id, false, "请只输入数字");
				} else if(langCd == "vn") {
					fnValid(id, false, "Vui lòng nhập số điện thoại của bạn.");
				} else {
					fnValid(id, false, "Please enter only numbers.");
				}
				$("#"+id+"_Byte").addClass("error");
				return false;
			} else {
				if(fnChkByteChk(id, maxByte) == false) {
    				if(langCd == "kr") {
						fnValid(id, false, msg+" "+maxByte+"Byte 내로 입력해주세요.");
					} else if(langCd == "en") {
						fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
					} else if(langCd == "cn-zh") {
						fnValid(id, false, "请在"+maxByte+"字符内输入" + msg + "。");
					} else if(langCd == "vn") {
						fnValid(id, false, "Vui lòng nhập " + msg + " trong vòng "+maxByte+" byte.");
					} else if(langCd == "sg-en") {
						fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
					} else if(langCd == "es") {
						fnValid(id, false, "Introduzca su  " + msg + " dentro de "+maxByte+" bytes.");
					} else {
						fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
					}
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

	fnByte = function(id, langCd) {
		var maxByte = $("#"+id).attr("data-byte");
		var msg = $("#"+id).attr("data-vmsg");
		if(typeof maxByte == "undefined") {
			maxByte = "0";
		}
		if(typeof msg == "undefined") {
			msg = "";
		}

		$("#"+id+"_Byte").find("span").text(fnChkByteChk2(id));

		if(fnChkByteChk(id, maxByte) == false) {
			if(langCd == "kr") {
				fnValid(id, false, msg+" "+maxByte+"Byte 내로 입력해주세요.");
			} else if(langCd == "en") {
				fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
			} else if(langCd == "cn-zh") {
				fnValid(id, false, "请在"+maxByte+"字符内输入" + msg + "。");
			} else if(langCd == "vn") {
				fnValid(id, false, "Vui lòng nhập " + msg + " trong vòng "+maxByte+" byte.");
			} else if(langCd == "es") {
				fnValid(id, false, "Introduzca su " + msg + " dentro de "+maxByte+" bytes.");
			} else {
				fnValid(id, false, "Please enter your " + msg + " within "+maxByte+" bytes.");
			}
			return false;
		} else {
			fnValid(id, true, "");
			return true;
		}
	};


	fnByteFirst = function(id, langCd) {
		var maxByte = $("#"+id).attr("data-byte");
		var msg = $("#"+id).attr("data-vmsg");
		if(typeof maxByte == "undefined") {
			maxByte = "0";
		}
		if(typeof msg == "undefined") {
			msg = "";
		}

		$("#"+id+"_Byte").find("span").text(fnChkByteChk2(id));
	};


});

function kakaoShare(shareid, shareurl, metaSeqNo) {
	var domain = location.protocol+"//"+location.hostname+(location.port ? ':'+location.port: '');
	if(shareid == "") {
		shareid = "kakao-link-btn";
	}
	if(shareurl == "") {
		shareurl = window.location.href;
	} else {
		shareurl = domain + "" + shareurl;
	}
	var ogTitle = "";
	var ogDesc = "";
	var ogImg = "";
	if(metaSeqNo == "") {
		ogTitle = $('meta[property="og:title"]').attr( 'content' );
		ogDesc = $('meta[property="og:description"]').attr( 'content' );
		ogImg = $( 'meta[property="og:image"]' ).attr( 'content' );
	} else {
		ogTitle = $("#metaOgTitle_"+metaSeqNo).val();
		ogDesc = $("#metaOgDesc_"+metaSeqNo).val();
		ogImg = domain + "/seoImgView.do?metaSeqNo="+metaSeqNo;
	}
	//console.log("=======");
	//console.log(shareurl);

	//Kakao.init('1fc53305d84d34dbb4e7b1937910a7c3');  // Javascript Key 입력
	Kakao.Link.createDefaultButton({
      container: '#'+shareid, // 아이디값
      objectType: 'feed',
      content: {
        title: ogTitle,
        description: ogDesc,
        imageUrl: ogImg,
        link: {
        	mobileWebUrl: shareurl, // 모바일에서 눌렀을 시 이동url
            webUrl: shareurl // PC에서 눌렀을 시 이동url
        }
   	  },
   	  buttons: [
   	  	{
	        title: '웹으로 보기',
	        link: {
	          mobileWebUrl: shareurl,
	          webUrl: shareurl,
	    	}
      	}
   	  ]
	});
}

// 트위터 공유
function twiterShare(shareurl) {
	if(shareurl == "") {
		//shareurl = encodeURIComponent($('meta[property="og:url"]').attr('content'));
		shareurl = encodeURIComponent(window.location.href);
	} else {
		var domain = location.protocol+"//"+location.hostname+(location.port ? ':'+location.port: '');
		shareurl = encodeURIComponent(domain + "" + shareurl);
	}
    //var myTitle = encodeURIComponent($('meta[property="og:title"]').attr('content'));

    //window.open("https://twitter.com/intent/tweet?text="+myTitle+"&url="+shareurl);
    window.open("https://twitter.com/intent/tweet?url="+shareurl);
};

// 페이스북 공유
function facebookShare(shareurl) {
	if(shareurl == "") {
		//shareurl = $('meta[property="og:url"]').attr('content');
		shareurl = encodeURIComponent(window.location.href);
	} else {
		var domain = location.protocol+"//"+location.hostname+(location.port ? ':'+location.port: '');
		shareurl = encodeURIComponent(domain + "" + shareurl);
	}
    window.open("http://www.facebook.com/sharer/sharer.php?u="+shareurl);
};

// 링크드인 공유
function linkedinShare(shareurl) {
	if(shareurl == "") {
		//shareurl = encodeURIComponent($('meta[property="og:url"]').attr('content'));
		shareurl = encodeURIComponent(window.location.href);
	} else {
		var domain = location.protocol+"//"+location.hostname+(location.port ? ':'+location.port: '');
		shareurl = encodeURIComponent(domain + "" + shareurl);
	}
	/*var myTitle = $('meta[property="og:title"]').attr('content');
	var myDescription = $('meta[property="og:description"]').attr('content');
	var myImage = $('meta[property="og:image"]').attr('content');*/

 	window.open('https://www.linkedin.com/shareArticle?mini=true'+'&url='+shareurl);
};

// 링크 복사
function urlCopy(shareurl) {

	let langCd = window.location.pathname.split("/")[1];
	if(shareurl == "") {
		//shareurl = $('meta[property="og:url"]').attr('content');
		shareurl = window.location.href;
	} else {
		var domain = location.protocol+"//"+location.hostname+(location.port ? ':'+location.port: '');
		shareurl = domain + "" + shareurl;
	}
	var t = document.createElement("textarea");
	document.body.appendChild(t);
	t.value = shareurl;
	t.select();
	document.execCommand('copy');
	document.body.removeChild(t);
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


//byte check
function fnChkByteChk(obj, maxByte){
	var str = $("#"+obj).val();

	var codeByte = 0;
    for (var idx = 0; idx < str.length; idx++) {
        var oneChar = escape(str.charAt(idx));
        if ( oneChar.length == 1 ) {
            codeByte ++;
        } else if (oneChar.indexOf("%u") != -1) {
            codeByte += 2;
        } else if (oneChar.indexOf("%") != -1) {
            codeByte ++;
        }
    }

	if(codeByte > maxByte){
    	return false;
	} else {
		return true;
	}
}

function fnChkByteChk2(obj){
	var str = $("#"+obj).val();

	var codeByte = 0;
    for (var idx = 0; idx < str.length; idx++) {
        var oneChar = escape(str.charAt(idx));
        if ( oneChar.length == 1 ) {
            codeByte ++;
        } else if (oneChar.indexOf("%u") != -1) {
            codeByte += 2;
        } else if (oneChar.indexOf("%") != -1) {
            codeByte ++;
        }
    }

	return codeByte;
}

//  숫자 체크
function fnNumberChk(obj){
 	var s = ''+ $("#"+obj).val(); // 문자열로 변환
  	s = s.replace(/^\s*|\s*$/g, ''); // 좌우 공백 제거
  	if (s == '' || isNaN(s)) return false;
  	return true;
}

// 2. 特定页面与语言的黑名单校验
function checkIsSpecialEvent() {
    const isSpecialPage = $("#evtSeqNo").val() === '194';
    const isTargetLang = ['es'].includes(getLangCdByUrlSplit());
    return isSpecialPage && isTargetLang;
}

// 特殊处理 https://www.cello-square.com/en/event/view-195.do
function checkIsSpecialEventEurope(){
    const checkSpecialPage = $("#evtSeqNo").val() === '195';
    const isTargetLangCd = ['en'].includes(getLangCdByUrlSplit());
     return checkSpecialPage && isTargetLangCd;
}

// Check the register mail rule.
//function checkSpecialMailAddress(obj){
//     const $input = $("#" + obj);
//        const emailVal = $input.val();
//        const lowerEmail = emailVal.toLowerCase();
//        // 2. 特殊页面校验逻辑，黑名单
//        if (checkIsSpecialEvent()) {
//            const blackList = ["@gmail.com", "@hotmail.com", "@outlook.com"];
//            const isBlacklisted = blackList.some(domain => lowerEmail.endsWith(domain));
//            if (isBlacklisted) {
//                return true;
//            }
//        }
//        return false;
//}

// 이메일 체크  let fullText = $(".con-title2").text();
function fnEmailChk(obj) {
	var regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

	if (!$("#"+obj).val().match(regExp)) {
    	return false;
    } else {
  		return true;
    }
}

// 숫자 특수문자만 입력
function fnNumberSpecialChk(obj) {
	var regExp = /[~!@#$%^&*()-+|<>?:{}=|0-9]/;
	if (!$("#"+obj).val().match(regExp)) {
    	return false;
    } else {
  		return true;
    }
}

function goContact(lang, inSelect, inTxt) {
	location.href = "/"+lang+"/contact.do?celloInSelect="+escape(encodeURIComponent(inSelect))+"&celloInTxt="+escape(encodeURIComponent(inTxt));
}

// 숫자만 입력
function inNumber(){
    var code = event.keyCode;
 	if((code >= 48 && code <= 57) || code == 13 || code == 8) {
 		return true;
	} else {
 		return false;
 	}
}


function deviceCheck() {
    // 디바이스 종류 설정
    var pcDevice = "win16|win32|win64|mac|macintel";

    // 접속한 디바이스 환경
    if ( navigator.platform ) {
        if ( pcDevice.indexOf(navigator.platform.toLowerCase()) < 0 ) {
            return "M";
        } else {
            return "P";
        }
    }
}

function setGlobalData(key, value){
	sessionStorage.setItem(key, JSON.stringify(value));
}

function getGlobalData(key){
	let value = sessionStorage.getItem(key);
	if(!value){
		return null;
	}
	return JSON.parse(value);
}

function clearGlobalData(key){
	sessionStorage.removeItem(key);
}

function getNowFormatDate(){
	let date = new Date();
	let month = date.getMonth() + 1;
	let strDate = date.getDate();
	return date.getFullYear() + '-' + (month>9?month:"0" + month) + '-' + (strDate>9?strDate:"0" + strDate);
}

function addIdentityByKey(key){
	setGlobalData(key, {identityTime:getNowFormatDate()});
}

function isDisplayIdentityByKey(key){
	return getGlobalData(key) == null || getGlobalData(key)['identityTime'] !== getNowFormatDate();
}

function removeIdentityByKey(key){
	clearGlobalData(key)
}

function getContactInformationArray(isQuote){
	let contactInformationArray = [];
	$("input[type=checkbox][name=contactInformation]:checked").each(function (){
		contactInformationArray.push($(this).val());
	})
	if(contactInformationArray.length > 0) {
		if(isQuote){
			$('#contactInformationError').hide();
		}else{
			$('#contactInformationError').addClass("hidden");
		}
		/*setTimeout(()=>{

			$('#agree7').prop('checked', true);
		},0)*/
	}

	if(contactInformationArray.length === 0 && $('#agree7').is(':checked')){
		if(isQuote){
			$('#contactInformationError').show();
		}else {
			$('#contactInformationError').removeClass("hidden")
		}

	}
	if(contactInformationArray.length === 0 && !$('#agree7').is(':checked')){
		if(isQuote){

			$('#contactInformationError').hide();
		}else{

			$('#contactInformationError').addClass("hidden")
		}
	}
	if(contactInformationArray.length === 3){
		$('#agree7').prop('checked', true)
	}else {
		$('#agree7').prop('checked', false)
	}

	return contactInformationArray;
}

function agree7Click(isQuote){
	console.log('agree7Click');
	if(!$('#agree7').is(':checked')){
		$("input[type=checkbox][name=contactInformation]").each(function (){
			$(this).prop('checked', false);
		})
		if(isQuote){
			$('#contactInformationError').hide();
		}else {
			$('#contactInformationError').addClass("hidden");
		}

	}else {
		$("input[type=checkbox][name=contactInformation]").each(function (){
			$(this).prop('checked', true);
		})
		getContactInformationArray();
	}
}

function selectWrapUpd(currentObj){
	let windowWidth = $(window).width();
	let selectedElement = currentObj.find('select');
	let buttonElement = currentObj.find('button');
	let selectedOption = currentObj.find('select option');
	let selectedOption2 = currentObj.find('select option:selected');
	let selectedVal = selectedElement.val();
	let selectedIndex = selectedOption.index(selectedOption2);

	// alert(selectedVal, selectedIndex);

	buttonElement.removeClass('selectedClass');
	selectedElement.removeClass('selectedClass');

	// select box 첫번째 옵션 선택만 아닐 경우
	if (selectedIndex > 0) {
		// PC, 모바일에 따라 select박스가 다르게 적용됨
		if (windowWidth > 767) {
			buttonElement.addClass('selectedClass');
		} else {
			selectedElement.addClass('selectedClass');
		}
	}
}

function selectWrapMobileUpd(currentObj){
	let selectedElement = currentObj;
	let selectedOption = currentObj.find('option');
	let selectedOption2 = currentObj.find('option:selected');
	let selectedVal = selectedElement.val();
	let selectedIndex = selectedOption.index(selectedOption2);

	selectedElement.removeClass('selectedClass');

	// select box 첫번째 옵션 선택만 아닐 경우
	if (selectedIndex > 0) {
		selectedElement.addClass('selectedClass');
	}
}

function elementRollCenter(obj){
	//$('html,body').scrollTop(obj.offset().top - 100);
	$('html,body').animate({scrollTop:  obj.offset().top - (window.screen.height / 2 - 100)}, 0);
}

function getHackleCommonProperties(site){
	//console.log("current_location", window.location.href);
	return {
		current_page: location.pathname,
		site_lang: site
	};
}

async function getClientIp(){
	try {
		const response = await fetch('https://api.ipify.org?format=json');
		const data = await response.json();
		return data.ip;
	}catch (err){
		console.log("get ip error", err);
	}


}
const mobileCheck = /Android|iPhone/i.test(navigator.userAgent); // PC, Mobile
function pageInit(elementId, currentPage, pageSize, totalCount){
	$('#' + elementId).children().remove();
	var pageBean = getPageObj(currentPage, pageSize, totalCount);
	console.log("pageBean", pageBean)
	var pageText = "";
	if(pageBean.prePageListIndex > 0){
		pageText += ' <li><a class="icon-arr-L" href="javascript:fncPage(\''+pageBean.prePageListIndex+'\');"><span class="hidden">이전페이지</span></a></li>';
	}

	for (let i = pageBean.beginPageIndex; i <= pageBean.endPageIndex; i++) {
		if(i === pageBean.currentPage) {
			pageText += ' <li><a class = "active" href="javascript:fncPage(\''+i+'\');">' + i + '</a></li>';
		} else {
			pageText += '  <li><a href="javascript:fncPage(\''+i+'\');">' + i + '</a></li>';
		}
	}

	if(pageBean.nextPageListIndex > 0){
		pageText += ' <li><a class="icon-arr-R" href="javascript:fncPage(\''+pageBean.nextPageListIndex+'\');"><span class="hidden">다음페이지</span></a></li>';
	}

	$('#' + elementId).append(pageText);
}

function getPageObj(currentPage, pageSize, recordCount){
	const type = mobileCheck ? 5 : 10;
	const offset = type - 1;
	const pageBean = {
		currentPage: parseInt(currentPage), // 当前页
		pageSize: parseInt(pageSize), // 每页显示多少条
		recordCount: parseInt(recordCount),  // 总记录数
		pageCount: 0, // 总页数
		beginPageIndex: 0, // 页码列表的开始索引（包含）
		endPageIndex: 0, // 页码列表的结束索引（包含）
		prePage: 0, //上一页码
		nextPage: 0, //下一页码
		prePageListIndex: 0,//起始页-10
		nextPageListIndex: 0//结束页+ 10;
	};
	// 计算总页码
	pageBean.pageCount = pageBean.recordCount % pageBean.pageSize === 0 ? pageBean.recordCount / pageBean.pageSize : Math.trunc(pageBean.recordCount / pageBean.pageSize) + 1;
	pageBean.currentPage = pageBean.currentPage > pageBean.pageCount ? 1 : pageBean.currentPage;
	// 计算 beginPageIndex 和 endPageIndex
	if (pageBean.pageCount <= type) {
		pageBean.beginPageIndex = 1;
		pageBean.endPageIndex = pageBean.pageCount;
	} else {
		let i = pageBean.currentPage % type;
		if(i !== 0){
			pageBean.beginPageIndex = parseInt((pageBean.currentPage / type)) * type + 1;
		}else {
			pageBean.beginPageIndex = pageBean.currentPage - offset;
		}
		if(pageBean.beginPageIndex < 0){
			pageBean.beginPageIndex = 0;
		}
		if(pageBean.beginPageIndex !== 0 ){
			pageBean.endPageIndex = pageBean.beginPageIndex + offset >  pageBean.pageCount ?  pageBean.pageCount :pageBean.beginPageIndex + offset;

		}
	}
	pageBean.prePageListIndex = pageBean.beginPageIndex - type;
	if (pageBean.prePageListIndex <= 0) {
		pageBean.prePageListIndex = 0;
	}
	pageBean.nextPageListIndex = pageBean.endPageIndex + 1;
	if (pageBean.nextPageListIndex > pageBean.pageCount) {
		pageBean.nextPageListIndex = 0;
	}
	return pageBean;
}

function getGlossaryTop5(langCd, elementId){
	$.ajax({
		type: 'GET',
		url  : "/" + langCd + "/getGlossaryTop5.do",
		error: function(xhr, status, error) {
			console.log(error);
		},
		success: function(result) {
			if (typeof result !== 'object') {
				result = JSON.parse(result); //text를 javascript 객체로 변환
			}
			let text = "";
			$.each(result.data, function (index, vo) {
				const url = "/" + langCd + "/glossary/view-" + vo.glossarySeqNo + ".do";
				const title = vo.title;
				text += `<a href="${url}">${title}</a>`
			});
			$('#' + elementId).append(text);
			if(elementId === 'topViewGlossary'){
				$('#topViewGlossary').children().each(function (index, obj) {

					$(obj).addClass("btn-word-tag");
				})
			}
		}
	});
}
function getRecommendKeywordAjax(langCd){
	$.ajax({
		type: 'GET',
		url  : "/" + langCd + "/getRecommendKeywordAjax.do",
		error: function(xhr, status, error) {
			console.log(error);
		},
		success: function(result) {
			console.log(result);
			if (typeof result !== 'object') {
				result = JSON.parse(result); //text를 javascript 객체로 변환
			}
			let text = "";
			$.each(result.data, function (index, word) {
				//const url = "/" + langCd + "/search-result.do?searchValue=" + word;javascript:
				text += `<a href="javascript:recommendKeywordSearch('${word}')" class="search-tag">${word}</a>`
			});
			if('kr' === langCd){
				$('#contentSearchKeyword').before('<strong>추천 검색어</strong>');
			}
			if('en' === langCd){
				$('#contentSearchKeyword').before('<strong>Suggested keywords</strong>');
			}
			if('es' === langCd){
				$('#contentSearchKeyword').before('<strong>Palabras clave sugeridas</strong>');
			}
			if('vn' === langCd){
				$('#contentSearchKeyword').before('<strong>Từ khóa được đề xuất</strong>');
			}
			$('#contentSearchKeyword').append(text);

		}
	});


}

fnAgreeChk = function (target) {
	var tf = true;
	let arrRadioId = ['Ocean', 'AIR', 'Express', 'Road', 'Rail'];
	if(getLangCdByUrlSplit() === 'kr' && target) {
		marketingInfoSelect(target);
	}
	$("input[type='checkbox']").each(function () {
		var chkId = $(this).attr("id");
		if ($.inArray(chkId, arrRadioId) === -1) {
			if ($(this).prop("id") != "all-agree") {
				if ($(this).is(":checked")) {
					tf = true;
				} else {
					tf = false;
					return false;
				}
			}
		}
	});
	if (tf == false) {
		$("#all-agree").prop("checked", false);
	} else {
		$("#all-agree").prop("checked", true);
	}
	let agree2OrAaree3 = false;
	if(getLangCdByUrlSplit() !== 'kr'){
		agree2OrAaree3 = !$("#agree2").is(":checked") || !$("#agree3").is(":checked");
	}
    let fullText = $(".con-title2").text();
    // 针对特殊页面条款必选项校验逻辑 https://www.cello-square.com/kr/event/view-193.do 特殊页面进针对韩语环境
    // 因此主动过滤 vn,es,en
    if($("#evtSeqNo").val() === '193' && !['es', 'vn', 'en'].includes(getLangCdByUrlSplit())){
         if (!$("#agree9").is(":checked") ||!$("#agree5").is(":checked") || !$("#agree1").is(":checked") || !$("#agree6").is(":checked") || agree2OrAaree3 || eventSpeCheckAgree8()) {
                $("#terms-warning-text").show();
                retTF = false;
            } else {
                $("#terms-warning-text").hide();
            }
    }else{
        if (!$("#agree5").is(":checked") || !$("#agree1").is(":checked") || !$("#agree6").is(":checked") || agree2OrAaree3 || eventSpeCheckAgree8()) {
    		$("#terms-warning-text").show();
    		retTF = false;
    	} else {
    		$("#terms-warning-text").hide();
    	}
    }


};

function marketingInfoSelect(target, suffix = '') {
	if(typeof target === "object" && ![`agree7${suffix}`,`agreeSms${suffix}`,`agreeEmail${suffix}`,`agreeKakao${suffix}`].includes($(target).attr("id"))) {
		return;
	}
	let agree7Val = $(`#agree7${suffix}`).is(":checked");
	let agreeSmsVal = $(`#agreeSms${suffix}`).is(":checked");
	let agreeEmailVal = $(`#agreeEmail${suffix}`).is(":checked");
	let agreeKakaoVal = $(`#agreeKakao${suffix}`).is(":checked");
	let whichCheckBox = null;
	if($(target).attr("id") === `agree7${suffix}`){
		whichCheckBox = "AllSelect";
	} else {
		whichCheckBox = "onlySelect";
	}
	if(whichCheckBox === "AllSelect") {
		if(agree7Val) {
			$(`#agreeSms${suffix}`).prop("checked", true);
			$(`#agreeEmail${suffix}`).prop("checked", true);
			$(`#agreeKakao${suffix}`).prop("checked", true);
		} else {
			$(`#agreeSms${suffix}`).prop("checked", false);
			$(`#agreeEmail${suffix}`).prop("checked", false);
			$(`#agreeKakao${suffix}`).prop("checked", false);
		}
	} else {
		if(agreeSmsVal && agreeEmailVal && agreeKakaoVal) {
			$(`#agree7${suffix}`).prop("checked", true);
		} else {
			$(`#agree7${suffix}`).prop("checked", false);
		}
	}
}

fnAgreeChkMultiple = function (target) {
	let tf = true;
	let arrRadioId = ['Ocean', 'AIR', 'Express', 'Road', 'Rail'];
	if(getLangCdByUrlSplit() === 'kr' && target) {
		marketingInfoSelect(target);
	}
	$("input[type='checkbox']").each(function () {
		let chkId = $(this).attr("id");
		if ($.inArray(chkId, arrRadioId) === -1) {
			if ($(this).prop("id") != "all-agree") {
				if ($(this).is(":checked")) {
					tf = true;
				} else {
					tf = false;
					return false;
				}
			}
		}
	});
	if (tf == false) {
		$("#all-agree").prop("checked", false);
	} else {
		$("#all-agree").prop("checked", true);
	}
	let agree2OrAaree3 = false;
	if(getLangCdByUrlSplit() !== 'kr'){
		agree2OrAaree3 = !$("#agree2").is(":checked") || !$("#agree3").is(":checked");
	}

	if (!$("#agree5").is(":checked") || !$("#agree1").is(":checked") || !$("#agree6").is(":checked") || agree2OrAaree3 || eventSpeCheckAgree8()) {
		$("#terms-warning-text").show();
		retTF = false;
	} else {
		$("#terms-warning-text").hide();
	}
};
/*function tooltipClick(obj){
	const nextObj = $(obj).next();
	nextObj.hasClass('active') ? nextObj.removeClass('active') : nextObj.addClass('active');
};

function headCountryListClick(){
	const nextObj = $('.head-country-select');
	nextObj.hasClass('active') ? nextObj.removeClass('active') : nextObj.addClass('active');
}*/

function getTermsNation(){
	$.ajax({
		url : "/gteTermsSiteAjax.do",
		type : "GET",
		dataType : 'json',
		contentType : "application/x-www-form-urlencoded; charset=UTF-8",
		success : function(data) {
			let text = '';
			$.each(data.data, function (index, obj){
				text += ` <option value='${obj.cd}'>${obj.cdNm}</option>`;
			})
			$('#nationSel').append(text);
		},
		error : function() {
		}
	});
}

function selectType(value){
	$('#termsList').children().remove();
	$.ajax({
		url : "/getTermsByNationCdAjax.do?nationCd=" + value,
		type : "GET",
		dataType : 'json',
		contentType : "application/x-www-form-urlencoded; charset=UTF-8",
		success : function(data) {
			let text = '';
			const HOST_MAP = {
				"193": ["www.cello-square.com", "cello-square.com"],
				"90": ["stg.cello-square.com"],
				"163": ["dev.cello-square.com", "localhost:8082"]
		};
			$.each(data.data, function (index, obj){
				if(obj?.detailYn === "Y" && HOST_MAP[obj.termsFileSeqNo]?.includes(window.location.host)) {
					// 特定的条款跳转详情页面添加
					text += ` <li class="viewPage">
														<strong>${obj.frontNm}</strong>
														<span>
																<a href="/en/policy/fmc-rules-tariff.do" class="enBtn detlBtn">View Page</a>
														</span>
												</li>`;
				} else if (!!obj) {
					text += ` <li>
															<strong>${obj.frontNm}</strong>
															<span>
																	<a href="javascript:goPolicyOpen('${obj.termsFileSeqNo}');" class="enBtn">English download</a>
															</span>
													</li>`;
				}
			})
			$('#termsList').append(text);
		},
		error : function() {
		}
	});
}
function jumpAnimate(jumpAnimate,content_id){
	if(jumpAnimate){
		let animateEle = $('#'+content_id);
		$('html,body').animate({scrollTop: animateEle.offset().top - (window.screen.height / 2 - 300)}, 1);
	}

}
/*function buildGlobalNetWorkHeader(){
	let menu1 = 'Introduction';
	let menu2 = 'News & Events';
	let menu3 = 'Quote';

	const path = window.location.pathname;
	const pathArray = path.split('/');
	const langCd = pathArray[1];

	let paramObj = getUrlParameters();
	let currentNationCd = '';
	let currentGlobalNetworkLangCd = '';
	let isQuoteRequest = pathArray[4] === 'quote-request.do';
	if(isQuoteRequest){
		currentNationCd = paramObj.country;
		currentGlobalNetworkLangCd = paramObj.lang;
	}else {
		//let pathVariableArray = pathArray[4].split('-');
		let pathVariableArray = pathArray[4].replace(pathArray[4].split('-')[0], pathArray[4].split('-')[0].toUpperCase()).split("-");
		currentNationCd = pathVariableArray[0];
		currentGlobalNetworkLangCd = pathVariableArray[1].split('.')[0];
	}
	let currentGlobalNetworkLangNm = '';
	let subLangListText = '';
	$.ajax({
		type: 'GET',
		url  : "/" + langCd + "/company/getGlobalNetWorkLangAjax.do?nationCd=" + currentNationCd + "&lang=" + currentGlobalNetworkLangCd,
		success: function (data){
			console.log('data.langList', data.langList)
			menu1 = data.q001;
			menu2 = data.q002;
			menu3 = data.q003;
			$.each(data.langList, function (idx, obj){
				if(obj.cd === currentGlobalNetworkLangCd){
					currentGlobalNetworkLangNm = obj.cdNm;
				}
				if(obj.cd != currentGlobalNetworkLangCd){
					let pathUri = pathArray[4];
					let changePath;
					if(isQuoteRequest){
						changePath = pathUri + '?country=' + currentNationCd + '&lang=' + obj.cd;
					}else {
						let pathUriArray = pathUri.split("-");
						pathUriArray[1] = pathUriArray[1].replace(currentGlobalNetworkLangCd, obj.cd);
						changePath = pathUriArray.join("-")
					}
					let repPath = path.replace(pathUri, changePath)
					console.log('data.repPath', repPath)
					//let repPath = path.replace(currentGlobalNetworkLangCd, obj.cd);
					subLangListText += `<li><a href="${repPath}">${obj.cdNm}</a></li>`;
				}
			});
			let langList = '';
			if(subLangListText !== ''){
				langList = `<div class="lang-list"> <a href="#" role="button">${currentGlobalNetworkLangNm}</a><!-- script : 언어선택시 해당 언어명 변경 -->
								<ul class="lang-sub-list">
								 ${subLangListText}
								</ul>
							</div>`;
			}
			let gn = 'Global Network'
			if(langCd === 'es'){
				gn = 'Red Global';
			}
			if(langCd === 'vn'){
				gn = 'Mạng lưới toàn cầu';
			}
			let microMenuHtml = `
                              <div class="inner">
                                  <div class="micro-wrap">
                                      <ul class="micro-nav">
                                          <li><a href="/${langCd}/company/global-network.do">${gn}</a></li>
                                          <li><a href="#">${data.nationName}</a></li>
                                      </ul>
                                       ${langList}
                                  </div>

                                  <ul class="menu-list">
                                      <li><a class="menu-list-a" href="/${langCd}/company/global-network/${currentNationCd}-${currentGlobalNetworkLangCd}.do">${menu1}</a></li>
                                      <li><a class="menu-list-a" href="/${langCd}/company/global-network/${currentNationCd}-${currentGlobalNetworkLangCd}-notice-list.do">${menu2}</a></li>
                                      <li><a class="menu-list-a" href="/${langCd}/company/global-network/quote-request.do?country=${currentNationCd}&lang=${currentGlobalNetworkLangCd}">${menu3}</a></li>
                                  </ul>
                                  </div>
                              `;
			// $('.search-layer').before(microMenuHtml);
			$('.micro-menu').html(microMenuHtml) ;
			$('.micro-menu').css("display","block")
			$('.menu-list-a').each(function (idx, obj){
				let menuPath = path;
				if(isQuoteRequest){
					menuPath += '?country=' + currentNationCd + '&lang=' + currentGlobalNetworkLangCd;
				}
				if($(obj).attr('href') === menuPath){
					$(obj).parent().addClass('on');
				}
			});
		},
		error: function (error){
			console.log(error);
		},
	});

}*/

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

function getElqFormName(country,module){
	const countryMap = new Map([
		["MY","CSSEA"],
		["SG","CSSEA"],
		["ID","CSSEA"],
		["TH","CSSEA"],
		["PH","CSSEA"],
		["AU","CSSEA"],
		["VN","CSSEA"],
		["US","CSNA"],
		["CA","CSNA"],
		["BR","CSLATAM"],
		["MX","CSLATAM"],
		["CL","CSLATAM"],
		["CO","CSLATAM"],
		["PA","CSLATAM"],
		["PE","CSLATAM"],
		["NL","CSEM"],
		["GB","CSEM"],
		["SK","CSEM"],
		["PL","CSEM"],
		["DE","CSEM"],
		["SE","CSEM"],
		["GR","CSEM"],
		["IT","CSEM"],
		["LV","CSEM"],
		["RO","CSEM"],
		["ES","CSEM"],
		["FR","CSEM"],
		["HU","CSEM"],
		["AT","CSEM"],
		["BE","CSEM"],
		["BG","CSEM"],
		["DK","CSEM"],
		["EE","CSEM"],
		["FI","CSEM"],
		["LT","CSEM"],
		["LU","CSEM"],
		["MD","CSEM"],
		["NO","CSEM"],
		["RS","CSEM"],
		["AE","CSMAS"],
		["EG","CSMAS"],
		["TR","CSMAS"],
		["IN","CSMAS"],
		["ZA","CSMAS"],
		["KR","CSHQ"],
	]);
	const mappingMap = new Map([
		["CSSEA-contact","CS_ContactUsForm_SEA"],
		["CSSEA-newsletter","CS_NewsletterSubscribeForm_SEA"],
		["CSSEA-whitepaper","CS_Whitepaper-SEA"],
		["CSSEA-quote","CS_QuoteRequestForm_SEA"],
		["CSSEA-webinar","CS_WebinarForm-SEA"],
		["CSSEA-event","CS_EventForm-SEA"],
		["CSEM-contact","CS_ContactUsForm_EM"],
		["CSEM-newsletter","CS_NewsletterSubscribeForm_EM"],
		["CSEM-whitepaper","CS_Whitepaper-EM"],
		["CSEM-quote","CS_QuoteRequestForm_EM"],
		["CSEM-webinar","CS_WebinarForm-EM"],
		["CSEM-event","CS_EventForm-EM"],
		["CSLATAM-contact","CS_ContactUsForm_LATAM"],
		["CSLATAM-newsletter","CS_NewsletterSubscribeForm_LATAM"],
		["CSLATAM-whitepaper","CS_Whitepaper-LATAM"],
		["CSLATAM-quote","CS_QuoteRequestForm_LATAM"],
		["CSLATAM-webinar","CS_WebinarForm-LATAM"],
		["CSLATAM-event","CS_EventForm-LATAM"],
		["CSMAS-contact","CS_ContactUsForm_MAS"],
		["CSMAS-newsletter","CS_NewsletterSubscribeForm_MAS"],
		["CSMAS-whitepaper","CS_Whitepaper-MAS"],
		["CSMAS-quote","CS_QuoteRequestForm_MAS"],
		["CSMAS-webinar","CS_WebinarForm-MAS"],
		["CSMAS-event","CS_EventForm-MAS"],
		["CSNA-contact","CS_ContactUsForm_NA"],
		["CSNA-newsletter","CS_NewsletterSubscribeForm_NA"],
		["CSNA-whitepaper","CS_Whitepaper-NA"],
		["CSNA-quote","CS_QuoteRequestForm_NA"],
		["CSNA-webinar","CS_WebinarForm-NA"],
		["CSNA-event","CS_EventForm-NA"],
		["CSHQ-contact","CS_ContactUsForm_Kr-Ko"],
		["CSHQ-newsletter","CS_NewsletterSubscribeForm_Kr-Ko"],
		["CSHQ-whitepaper","CS_Whitepaper-Kr-Ko"],
		["CSHQ-quote","CS_QuoteRequestForm_Kr-Ko"],
		["CSHQ-webinar","CS_WebinarForm-HQ"],
		["CSHQ-event","CS_EventForm-HQ"],
	]);
	var countryCd = countryMap.get(country);
	const langCd = window.location.pathname.split('/')[1];
	if(langCd === 'vn' && country !== 'KR'){
		countryCd = countryMap.get('VN');
	}
	return mappingMap.get(countryCd + "-" + module)
}
function aggree_check_box(){
	function radioChecked(id){
		console.log("id:" + id);
		var arrRadioId = ['sea', 'airline', 'special'];
		arrRadioId.forEach(function (item) {
			if(id === item){
				$('#' + id).prop("checked", true);
			}else {
				$('#' + item).prop("checked", false);
			}
		})
	}
	$(document).ready(function () {

		var quoteTransMode = "";
		// input check
		$('#industry').change(function (e){
			fnSelect("industry", 'kr');
		})

		$('#title').change(function (e){
			fnSelect("title", 'kr');
		})

		var transMOde = 'sea';
		$("input:checkbox[id='sea']").click(function (e) {
			$("#airline").prop("checked", false);
			$("#special").prop("checked", false);
			transMOde = 'sea';
			e.stopImmediatePropagation();
		});
		$("input:checkbox[id='airline']").click(function (e) {
			$("#sea").prop("checked", false);
			$("#special").prop("checked", false);
			transMOde = 'airline';
			e.stopImmediatePropagation();
		});
		$("input:checkbox[id='special']").click(function (e) {
			$("#sea").prop("checked", false);
			$("#airline").prop("checked", false);
			transMOde = 'special';
			e.stopImmediatePropagation();
		});

		// 견적문의
		$("#shipping-section-start").keyup(function (e) {

			fnText("shipping-section-start", "kr");
			quoteStartAndEndErrorCssChk();
			e.stopImmediatePropagation();
		});
		$("#shipping-section-end").keyup(function (e) {

			fnText("shipping-section-end", 'kr');
			quoteStartAndEndErrorCssChk();
			e.stopImmediatePropagation();
		});
		$("#shippingTime").keyup(function (e) {

			fnText("shippingTime", 'kr');
			e.stopImmediatePropagation();
		});
		$("#itemInfo").keyup(function (e) {

			fnText("itemInfo", 'kr');
			e.stopImmediatePropagation();
		});
		$("#sqprdUrl").keyup(function (e) {

			e.stopImmediatePropagation();
		});

		$("input[type=radio][name=ecommerce]").change(function (e) {
			$('#eCommerceId').next("div.form-con-info").remove();

		})

		// 쿠키 셋팅

		// fnByteFirst("comment", 'kr');

				// 모두 동의
		$("#all-agree").click(function () {

			if ($(this).is(":checked")) {
				$("input[type='checkbox']").each(function () {
					var chkId = $(this).attr("id");
					if (chkId != "sea" && chkId != "airline" && chkId != "special") {
						$(this).prop("checked", true);
					}
				});
			} else {
				$("input[type='checkbox']").each(function () {
					var chkId = $(this).attr("id");
					if (chkId != "sea" && chkId != "airline" && chkId != "special") {
						$(this).prop("checked", false);
					}
				});
			}
		});

		//하나라도 동의 안되어있으면 모두 동의 체크 해제
		$("input[type='checkbox']").click(function () {
			fnAgreeChk($(this));
		});
		$(".quote-check-box").click(function (e){
			$('#shipping-section-start').val("");
			$('#shipping-section-end').val("");

			$('#itemInfo').val("");
		})


		function quoteStartAndEndErrorCssChk(){

			if($('#shipping-section-start').hasClass('error') || $('#shipping-section-end').hasClass('error')){
				const msg = $("#shipping-section-end").attr('data-vmsg') + " 입력해 주세요.";
				$("#shipping-section-end").next("div.form-con-info").remove();
				$("#shipping-section-end").after('<div class="form-con-info"><p class="error-text error">'+ msg + '</p></div>')
			}
		}

		/* 230817 start */
		$('.selectWrap').click(function(e) {

			// e.preventDefault();
			selectWrapUpd($(this));
		});

		// 실제 모바일 Device에서는 select 클릭으로 작동함
		if (/Android|iPhone/i.test(navigator.userAgent)) {

			$('.selectWrap select').change(function(e) {
				selectWrapMobileUpd($(this))
			});
		}


	});
}

function panduan_view_from(){
	const langCd = window.location.pathname.split('/')[1];
	$("#country").change(function (e) {
		fnSelect("country", langCd);
	});
	$("#first-name").keyup(function (e) {
		fnName("first-name", langCd);
	});
	$("#last-name").keyup(function (e) {
		fnName("last-name", langCd);
	});
	$("#e-mail").keyup(function (e) {
		fnEmail("e-mail", langCd);
	});
	$("#company-name").keyup(function (e) {
		fnText("company-name", langCd);
	});
	$("#call-number").keyup(function (e) {
		fnNumber("call-number", langCd);
	});
	$("#cs-division").keyup(function (e) {
		fnText("cs-division", langCd);
	});


	if ($.trim($("#last-name").val()) != "") {
		fnName("last-name", langCd);
	}
	if ($.trim($("#e-mail").val()) != "") {
		fnEmail("e-mail", langCd);
	}
	if ($.trim($("#call-number").val()) != "") {
		fnNumber("call-number", langCd);
	}
	if ($.trim($("#company-name").val()) != "") {
		fnText("company-name", langCd);
	}
	if ($.trim($("#cs-division").val()) != "") {
		fnText("cs-division", langCd);
	}
}

function eventWebinarFormDataChange() {
	panduan_view_from();
	let langCd = window.location.pathname.split('/')[1];
	$('#selectLevel').change(function (e){
		fnSelect("selectLevel", langCd);
	})
	$('#selectSector').change(function (e){
		fnSelect("selectSector", langCd);
	})
	$("#company-title").keyup(function (e) {
		fnText("company-title", langCd);
	});
	$('#selectScale').change(function (e){
		fnSelect("selectScale", langCd);
	})
}


function  eventWebinarFormDataSubmitCheck(){
	const webinarSeqNoVal = $("#webinarSeqNo").val();
	// landing page 页面直接返回 true ，上一个页面已经通过校验并存储在了session Storage。 此处更新的时跳转目标页面的 ID
	// 后续如果新增的目标页面，需要在此添加新的 seqNoId
	const isTargetSeq = ['195', '197', '199', window.SEQ_NO_TARGET].includes(webinarSeqNoVal);
	const isWebinarType = $("#webinarType").val() === 'webinar';
	if (isTargetSeq && isWebinarType) {
		return true;
	}
	let langCd = window.location.pathname.split('/')[1];
	let levelCheck = fnSelect("selectLevel", langCd);
	let sectorCheck = fnSelect("selectSector", langCd)
	let scaleCheck = fnSelect("selectScale", langCd)
	let companyTitleCheck = fnText("company-title", langCd)
	if(!levelCheck){
		elementRollCenter($('#selectLevelDivId'))
	}else if(!sectorCheck || !scaleCheck){
		elementRollCenter($('#selectSectorDivId'))
	}
	return levelCheck && sectorCheck && companyTitleCheck && scaleCheck;
}

function marketUpdatesSubmitCheck(langCd){
	let levelCheck = fnSelect("selectLevel", langCd);
	let sectorCheck = fnSelect("selectSector", langCd);
	let scaleCheck = fnSelect("selectScale", langCd);
	let companyTitleCheck = fnText("company-title", langCd);
	if(!levelCheck){
		elementRollCenter($('#selectLevelDivId'));
	}else if(!sectorCheck || !scaleCheck){
		elementRollCenter($('#selectSectorDivId'));
	}
	const isVaild = whiterPaperPersonInfoCheck(langCd);
	return levelCheck && sectorCheck && companyTitleCheck && scaleCheck && isVaild;
}

// 针对特殊页面的校验逻辑 （职级，职位，规模）
function eventForSpecialSubmitCheck(){
	let langCd = window.location.pathname.split('/')[1];
	let levelCheck = fnSelect("selectLevel", langCd);
	let csDivisionCheck = fnText("cs-division", langCd)
	let scaleCheck = fnSelect("selectScale", langCd)
	if(!levelCheck){
		elementRollCenter($('#selectLevelDivId'))
	}
	return levelCheck && csDivisionCheck && scaleCheck;
}

function person_send_ew(landCd,pageType,bdtype, videoUrl,formName,title,obj,statDtm,webUrl){
	// 防止重复提交
	if(window._personSendEwSubmitting){
		return;
	}
	let retTFEventWebinar = true;
	let isActiveStart =  false;
	if(statDtm && pageType === 'webinar'){
		isActiveStart = this.isActiveStart(statDtm);
	}
	// 针对特殊页面条款必选项校验逻辑 https://www.cello-square.com/kr/event/view-193.do 特殊页面进针对韩语环境
    // 因此主动过滤 vn,es,en
	if (['event', 'webinar'].includes(pageType) && !['193', '194'].includes($("#evtSeqNo").val())){
    		retTFEventWebinar = eventWebinarFormDataSubmitCheck();
    }else{
        if (!['es', 'vn', 'en'].includes(landCd)){
            retTFEventWebinar = eventForSpecialSubmitCheck()
        } else {
            retTFEventWebinar = eventWebinarFormDataSubmitCheck();
        }
	}
	let retTF = whiterPaperPersonInfoCheck(landCd) && retTFEventWebinar;
	$('#sendButton').prop("disabled", true)
	title = removeHtmlTags(title);
	let formData;
	if (retTF) {
		// 校验通过后锁定，防止重复提交
		window._personSendEwSubmitting = true;
		// 清除按钮 onclick（处理 window.onload 重新绑定的情况）
		obj.onclick = null;
		const webinarSeqNo = $("#webinarSeqNo").val();
	    // 处理特殊页面 landing page 逻辑， 需要同时满足 pageType 和 seqNo
	    if((webinarSeqNo === '195' || webinarSeqNo === '197' || webinarSeqNo === '199' || webinarSeqNo === window.SEQ_NO_TARGET) && pageType === 'webinar'){

            const detailsOneVal = $('#textDetailsOne').val();
            const detailsTwoVal = $('#textDetailsTwo').val();
            const $sendButton = $('#sendButton');

            // SessionStorage 读取，使用空对象作为兜底
            const sessionData = sessionStorage.getItem("specialFormData");
            formData = sessionData ? JSON.parse(sessionData) : {};
            // 如果sessionStorage为空则代表用户通过url直接进入（不合法）
            if (Object.keys(formData).length === 0) {
				if(landCd === "kr"){
					alert('정상적인 접근 경로가 아닙니다. 이전 단계부터 다시 진행해 주세요.'); // "Form data is empty."
				} else if(landCd === "en") {
					alert('Invalid access. Please try again.'); // "Form data is empty."
				}
                $sendButton.prop("disabled", false);
				const redirectMap = {
					'197': '/kr/webinar/view-196.do',
					'195': '/kr/webinar/view-194.do',
					'199': '/kr/webinar/view-198.do',
					[window.SEQ_NO_TARGET]: `/${landCd}/webinar/view-${window.SEQ_NO_SOURCE}.do`
				};
				if (redirectMap[webinarSeqNo]) {
					window.location.href = redirectMap[webinarSeqNo];
					return; // Stops executing the rest of the function immediately after redirecting
				}
            }

            formData.assetNo = title;
            formData.elqFormName = formName;

            // 利用 $.trim() 过滤掉纯空格，如果两个输入框去除空格后都是空的
            if ($.trim(detailsOneVal) === "" && $.trim(detailsTwoVal) === "" && landCd === "kr") {
                alert('문의 내용을 입력해주세요.'); // 韩语提示：请输入咨询内容。
                return;
            } else if ($.trim(detailsOneVal) === "" && $.trim(detailsTwoVal) === "" && landCd === "en") {
				alert('Enter your inquiry.'); // 韩语提示：请输入咨询内容。
                return;
			}

			if (landCd === "kr") {
				// 只有校验通过后，才将数据写入对象并且拼接固定显示内容
            	formData.comment = "[웨비나 문의하기]\n" + detailsOneVal;
            	formData.comment2 ="[물류사업 문의하기]\n" + detailsTwoVal;
			} else if (landCd === "en") {
				// 只有校验通过后，才将数据写入对象并且拼接固定显示内容
            	formData.comment = "[Webinar Inquiry]\n" + detailsOneVal;
            	formData.comment2 ="[Logistics Inquiry]\n" + detailsTwoVal;
			}
	    }else{
	        // 加保险，移除不必要的session Storage.ialFormData"); 其他页面均不需要
	        sessionStorage.removeItem("specialFormData");
	        formData = commit_from_toeloqu_getfrom(landCd,formName,title);
            if(pageType === 'event' || pageType === 'webinar'){
                formData.cSIndustry1 = $('#selectSector').val();
                formData.title = $('#selectLevel').val();
                formData.title2 = $('#company-title').val();
                formData.companySize1 = $('#selectScale').val();
            }
	    }
		console.log(formData)
		// 获取营销条款同意状态（用于 alert 提示）
		var hasMarketingAgree = $('#agree4').is(":checked")
			&& ($('#agreeEmail').is(":checked")
			|| $('#agreeKakao').is(":checked")
			|| $('#agreeSms').is(":checked"));
		var consentText = hasMarketingAgree ? '수신동의' : '수신거부';
		var nowDate = new Date();
		var consentDate = nowDate.getFullYear() + '.'
			+ String(nowDate.getMonth()+1).padStart(2,'0') + '.'
			+ String(nowDate.getDate()).padStart(2,'0');
		// 构建同意信息 alert 内容
		var consentAlertMsg = '전송자: 삼성SDS\n수신 의사: ' + consentText + '\n의사 표시 일시: ' + consentDate + '\n처리 결과: 처리가 정상적으로 완료되었습니다.';

		showLoading(() => {
		$.ajax({
			url: "https://s73756918.t.eloqua.com/e/f2"
			, dataType: 'json'
			, data: formData
			, type: "POST"
			, contentType: "application/x-www-form-urlencoded; charset=UTF-8"
			, success: function (json) {
				offLoading();
				console.log("success json",json)
				//video
				if ('EVENT_BD_02' == bdtype || 'WEBINAR_BD_02' == bdtype) {
					// KR Webinar: 弹窗确认后打开 YouTube
					if("kr" == landCd){
						openMarketingPopup(function(){
							$("#popup_video5_button").click();
						}, consentText);
					}else{
						$("#popup_video5_button").click();
					}
				}else if('WEBINAR_BD_01' === bdtype && isActiveStart && webUrl){
					// KR Webinar: 弹窗确认后打开 webinar 链接
					if("kr" == landCd){
						openMarketingPopup(function(){
							document.getElementById('webinar_button').click();
						}, consentText);
					}else{
						document.getElementById('webinar_button').click();
					}
				}else{
					if("kr" == landCd){
						const webinarSeq = $("#webinarSeqNo").val();
						const webinarType = $("#webinarType").val();
					    // 处理特殊页面，将页面的收集信息暂存并进行跳转
						if (['194', '196', '198', window.SEQ_NO_SOURCE].includes(webinarSeq) && webinarType === 'webinar'){
							// 1. Save eloqua data to sessionStorage
							sessionStorage.setItem('specialFormData', JSON.stringify(formData));
							// 2. Pure page redirection using a map lookup
							const redirectMap = {
								'194': '/kr/webinar/view-195.do?special=true',
								'196': '/kr/webinar/view-197.do?special=true',
								'198': '/kr/webinar/view-199.do?special=true',
								[window.SEQ_NO_SOURCE]: `/kr/webinar/view-${window.SEQ_NO_TARGET}.do?special=true`  //生产环境需要更新 198 199
							};
							if (redirectMap[webinarSeq]) {
								openMarketingPopup(function(){
									window.location.href = redirectMap[webinarSeq];
								}, consentText);
							}
						}else{
						    if(['195', '197', '199',window.SEQ_NO_TARGET].includes(webinarSeq) && webinarType === 'webinar'){
						        alert('문의해 주셔서 감사합니다.\n웨비나 종료 후 담당자가 확인하여 안내드리겠습니다.\n');
                        		sessionStorage.removeItem("specialFormData");
						    }else{
						        alert('신청이 되었습니다.\n' + consentAlertMsg);
						    }
						}
					}else if(pageType === 'webinar' && 'en' === landCd){
						const webinarSeq = $("#webinarSeqNo").val();
						const webinarType = $("#webinarType").val();
						if ([window.SEQ_NO_SOURCE].includes(webinarSeq) && webinarType === 'webinar') {
							// 跳转隐藏页面
							// 1. Save eloqua data to sessionStorage
							sessionStorage.setItem('specialFormData', JSON.stringify(formData));
							// 2. Pure page redirection using a map lookup
							const redirectMap = {
								[window.SEQ_NO_SOURCE]: `/en/webinar/view-${window.SEQ_NO_TARGET}.do?special=true`  //生产环境需要更新 198 199
							};
							if (redirectMap[webinarSeq]) {
								window.location.href = redirectMap[webinarSeq];
							}
						} else if ([window.SEQ_NO_TARGET].includes(webinarSeq) && webinarType === 'webinar') {
							// 隐藏页面逻辑
							sessionStorage.removeItem("specialFormData");
							alert('Thank you. We\'ll get back to you after the webinar.');
						} else {
							alert('Sign up completed.\nWe will send you separate announcement by registered email before the webinar takes place.');
						}
					}else if(checkIsSpecialEvent()){
                    alert('Nuestro equipo revisará la información proporcionada y posteriormente le enviará un correo electrónico confirmando el estado de su participación. Muchas gracias.')
                }else if(checkIsSpecialEventEurope()){
                    alert('Thank you for your registration. We will send a final confirmation email upon verification of your information.')
                }else{
							alert('Sign up completed.')
					}
				}

			},
			 error: function (json) {
				offLoading();
				 if(json.status === 200 && json.statusText === 'OK'){
					 console.log("error",json)
				 }
				 console.log("error json",json)
				if ('EVENT_BD_02' == bdtype || 'WEBINAR_BD_02' == bdtype) {
					// KR Webinar: 弹窗确认后打开 YouTube
					if("kr" == landCd){
						openMarketingPopup(function(){
							$("#popup_video5_button").click();
						}, consentText);
					}else{
						$("#popup_video5_button").click();
					}
				}else if('WEBINAR_BD_01' === bdtype && isActiveStart && webUrl){
					// KR Webinar: 弹窗确认后打开 webinar 链接
					if("kr" == landCd){
						openMarketingPopup(function(){
							document.getElementById('webinar_button').click();
						}, consentText);
					}else{
						document.getElementById('webinar_button').click();
					}
				}else{
					if("kr" == landCd){
						const webinarSeq = $("#webinarSeqNo").val();
						const webinarType = $("#webinarType").val();
						// 处理特殊页面，将页面的收集信息暂存并进行跳转
						if (['194', '196', '198', window.SEQ_NO_SOURCE].includes(webinarSeq) && webinarType === 'webinar'){
							// 1. Save eloqua data to sessionStorage
							sessionStorage.setItem('specialFormData', JSON.stringify(formData));
							// 2. Pure page redirection using a map lookup
							const redirectMap = {
								'194': '/kr/webinar/view-195.do?special=true',
								'196': '/kr/webinar/view-197.do?special=true',
								'198': '/kr/webinar/view-199.do?special=true',
								[window.SEQ_NO_SOURCE]: `/kr/webinar/view-${window.SEQ_NO_TARGET}.do?special=true`  //生产环境需要更新 198 199
							};
							if (redirectMap[webinarSeq]) {
								openMarketingPopup(function(){
									window.location.href = redirectMap[webinarSeq];
								}, consentText);
							}
						}else{
							if(['195', '197', '199', window.SEQ_NO_TARGET].includes(webinarSeq) && webinarType === 'webinar'){
								alert('문의해 주셔서 감사합니다.\n웨비나 종료 후 담당자가 확인하여 안내드리겠습니다.');
								sessionStorage.removeItem("specialFormData");
							}else{
								alert('신청이 되었습니다.\n' + consentAlertMsg);
							}
						}
					}else if(pageType === 'webinar' && 'en' === landCd){
						const webinarSeq = $("#webinarSeqNo").val();
						const webinarType = $("#webinarType").val();
						if ([window.SEQ_NO_SOURCE].includes(webinarSeq) && webinarType === 'webinar') {
							// 跳转隐藏页面
							// 1. Save eloqua data to sessionStorage
							sessionStorage.setItem('specialFormData', JSON.stringify(formData));
							// 2. Pure page redirection using a map lookup
							const redirectMap = {
								[window.SEQ_NO_SOURCE]: `/en/webinar/view-${window.SEQ_NO_TARGET}.do?special=true`  //生产环境需要更新 198 199
							};
							if (redirectMap[webinarSeq]) {
								window.location.href = redirectMap[webinarSeq];
							}
						} else if ([window.SEQ_NO_TARGET].includes(webinarSeq) && webinarType === 'webinar') {
							// 隐藏页面逻辑
							sessionStorage.removeItem("specialFormData");
							alert('Thank you. We\'ll get back to you after the webinar.');
						} else {
							alert('Sign up completed.\nWe will send you separate announcement by registered email before the webinar takes place.');
						}
					}else if(checkIsSpecialEvent()){
	                    alert('Nuestro equipo revisará la información proporcionada y posteriormente le enviará un correo electrónico confirmando el estado de su participación. Muchas gracias.')
	                }else if(checkIsSpecialEventEurope()){
	                    alert('Thank you for your registration. We will send a final confirmation email upon verification of your information.')
	                }else{
							alert('Sign up completed.')
					}
				}

			}
		});
		});
	}
}
function Boolean_from_panduan(landCd,retTF){
	var companyName = $("input[name='companyName']").val();
	var lastName = $("input[name='lastName']").val();
	var email = $("input[name='email']").val();
	if (!lastName) {
		$("#lastName_err_div").show()
		$("input[name='lastName']").attr("class", "error")
		retTF = false;
	} else {
		$("#lastName_err_div").hide()
		$("input[name='lastName']").attr("class", "")
	}
	if (!email) {
		$("#email_err_div").attr("style", "display:block")
		$("input[name='email']").attr("class", "error")
		retTF = false;
	} else {
		$("#email_err_div").hide()
		$("input[name='email']").attr("class", "")
	}
	if (!companyName) {
		$("input[name='companyName']").attr("class", "error")
		$("#companyName_err_div").show()
		retTF = false;
	} else {
		$("input[name='companyName']").attr("class", "")
		$("#companyName_err_div").hide()
	}

	if("kr" == landCd){
		var callNumber = $("input[name='callNumber']").val();
		if (!callNumber) {
			$("input[name='callNumber']").attr("class", "error")
			$("#callNumber_err_div").show()
			retTF = false;
		} else {
			$("input[name='callNumber']").attr("class", "")
			$("#callNumber_err_div").hide()
		}

	}else if("en" == landCd || "es" === landCd || "vn" === langCd){
		var areaCode = $("select[name='areaCode']").val();
		var firstName = $("input[name='firstName']").val();
		console.log("firstName",firstName);
		if (!firstName) {
			$("#firstName_err_div").show()
			$("input[name='firstName']").attr("class", "error")
			retTF = false;
		} else {
			$("#firstName_err_div").hide()
			$("input[name='firstName']").attr("class", "")
		}
		if (!areaCode) {
			$("select[name='areaCode']").attr("class", "error")
			$("#country_err_div").show()
			retTF = false;
		} else {
			$("select[name='areaCode']").attr("class", "")
			$("#country_err_div").hide()
		}
	}
	return retTF;
}
function commit_from_toeloqu_getfrom(landCd,formName,title){
	if("kr" === landCd){
		var companyName = $('#company-name').val();
		var lastName = $("input[name='lastName']").val();
		var email = $("#e-mail").val();
		var callNumber = $("#call-number").val();
		var HQ_Optin_Terms = $("#agree5").is(":checked") ? "Yes" : "No";
		var HQ_Optin_Privacy = $("#agree1").is(":checked") ? "Yes" : "No";
		/*var HQ_Optin_Transfer_Overseas = $("#agree2").is(":checked") ? "Yes" : "No";
		var HQ_Optin_Share_GlobalOffices = $("#agree3").is(":checked") ? "Yes" : "No";*/
		var HQ_Optin_Age = $("#agree6").is(":checked") ? "Yes" : "No";
		var hqEmailOptIn = $("#agree4").is(":checked") ? "Yes" : "No";
		let isContact = $("#agree7").is(":checked") ? "Yes" : "No";
		var hqMktEmail = isContact;
		var hqMktPhone = isContact;
		var hqMktSms =  isContact;
		var csDivision = "";
		if(landCd === "kr") {
			hqMktEmail = $("#agreeEmail").is(":checked") ? "Yes" : "No";
			hqMktKakao = $("#agreeKakao").is(":checked") ? "Yes" : "No";
			hqMktSms =  $("#agreeSms").is(":checked") ? "Yes" : "No";
		}
		var resolvedElqCustomerGUID = elqCustomerGUID && elqCustomerGUID.trim() !== "" ? elqCustomerGUID : elqGetCookieSubValue('ELOQUA', 'GUID');
		var formData = {
			"elqFormName": formName
			,"elqSiteID": "73756918"
			,"elqCustomerGUID": resolvedElqCustomerGUID
			,"elqCookieWrite":"0",
			"assetNo":title,
			"mobilePhone": callNumber,
			"company": companyName,
			"lastName": lastName,
			"emailAddress": email
			, "agree5": HQ_Optin_Terms
			, "agree1": HQ_Optin_Privacy
			/*, "agree2": HQ_Optin_Transfer_Overseas
			, "agree3": HQ_Optin_Share_GlobalOffices*/
			, "agree7": HQ_Optin_Age
			, "agree4": hqEmailOptIn
			, "hQMKTinfoEmail": hqMktEmail
			, "hQMKTinfoPhone": landCd === "kr" ? undefined : hqMktPhone
			, "hQMKTinfoSMS": hqMktSms
			, "hQMKTinfoKakao": landCd === "kr" ? hqMktKakao : undefined
			, "language": landCd
		};
		// 针对特殊页面条款必选项校验逻辑 https://www.cello-square.com/kr/event/view-193.do 特殊页面进针对韩语环境
        // 因此主动过滤 vn,es,en
        if( $("#evtSeqNo").val() === '193' && !['es', 'vn', 'en'].includes(landCd)){
			formData.csDivision = $("#cs-division").val()
		};
		return formData;
	}else if ('es' === landCd || "vn" === landCd || 'en' === landCd){

		var companyName = $('#company-name').val();
		var lastName = $("input[name='lastName']").val();
		var email = $("#e-mail").val();
		var areaCode = $("#country").val();
		var firstName = $("input[name='firstName']").val();
		var HQ_Optin_Terms = $("#agree5").is(":checked") ? "Yes" : "No";
		var HQ_Optin_Privacy = $("#agree1").is(":checked") ? "Yes" : "No";
		var HQ_Optin_Transfer_Overseas = $("#agree2").is(":checked") ? "Yes" : "No";
		var HQ_Optin_Share_GlobalOffices = $("#agree3").is(":checked") ? "Yes" : "No";
		var HQ_Optin_Age = $("#agree6").is(":checked") ? "Yes" : "No";
		var hqEmailOptIn = $("#agree4").is(":checked") ? "Yes" : "No";
		let isContact = $("#agree7").is(":checked") ? "Yes" : "No";
		var hqMktEmail = isContact;
		var hqMktPhone = isContact;
		var hqMktSms =  isContact;
		// 因去除国家组件，但还需要保留国家的 areaCode 值 $("#evtSeqNo").val()
		if($("#evtSeqNo").val() === '194' && 'es' === landCd){
            areaCode = 'MX'
        };
		var resolvedElqCustomerGUID = elqCustomerGUID && elqCustomerGUID.trim() !== "" ? elqCustomerGUID : elqGetCookieSubValue('ELOQUA', 'GUID');
		var formData = {
			"elqFormName": formName
			,"elqSiteID": "73756918"
			,"elqCustomerGUID": resolvedElqCustomerGUID
			,"elqCookieWrite":"0",
			"assetNo":title,
			"company": companyName,
			"lastName": lastName,
			"firstName": firstName,
			"Country": areaCode,
			"emailAddress": email
			, "agree5": HQ_Optin_Terms
			, "agree1": HQ_Optin_Privacy
			, "agree2": HQ_Optin_Transfer_Overseas
			, "agree3": HQ_Optin_Share_GlobalOffices
			, "agree7": HQ_Optin_Age
			, "agree4": hqEmailOptIn
			, "hQMKTinfoEmail": hqMktEmail
			, "hQMKTinfoPhone": hqMktPhone
			, "hQMKTinfoSMS": hqMktSms
			, "language": landCd
		};
		return formData;
	}
}


function whiterPaperPersonInfoCheck(langCd){
    // landing page 页面直接返回 true ，上一个页面已经通过校验并存储在了session Storage
	const webinarSeqNo = $("#webinarSeqNo").val();
    if((webinarSeqNo === '195' || webinarSeqNo === '197' || webinarSeqNo === '199' || webinarSeqNo === window.SEQ_NO_TARGET) && $("#webinarType").val() === 'webinar'){
        return true;
    }
	let firstNameCheck = true;
	let countryCheck = true;
	let mobilePhoneCheck = true;
	if('en' === langCd || 'es' === langCd || 'vn' === langCd) {
		countryCheck = fnSelect("country", langCd);
		if(!countryCheck){
			elementRollCenter($('#countryDivId'));
		}
		firstNameCheck = fnName("first-name", langCd);

	}
	if('kr' === langCd){
		mobilePhoneCheck = fnNumber("call-number", langCd);
	}
	let companyCheck = fnText("company-name", langCd);
	let emailAddressCheck = fnEmail("e-mail", langCd);
	let lastNameCheck = fnName("last-name", langCd);
	var retTF = lastNameCheck && emailAddressCheck && mobilePhoneCheck && companyCheck && firstNameCheck && countryCheck;
	let agree2OrAaree3 = false;
	if(getLangCdByUrlSplit() !== 'kr'){
		agree2OrAaree3 = !$("#agree2").is(":checked") || !$("#agree3").is(":checked");
	}
	let fullText = $(".con-title2").text();
	// 针对特殊页面条款必选项校验逻辑 https://www.cello-square.com/kr/event/view-193.do 特殊页面进针对韩语环境
    // 因此主动过滤 vn,es,en
    if($("#evtSeqNo").val() === '193' && !['es', 'vn', 'en'].includes(getLangCdByUrlSplit())){
        if (!$("#agree9").is(":checked") || !$("#agree5").is(":checked") || !$("#agree1").is(":checked")|| !$("#agree6").is(":checked") || agree2OrAaree3 || eventSpeCheckAgree8()) {
            $("#terms-warning-text").show();
            retTF = false;
        } else {
            $("#terms-warning-text").hide();
        }
        if($('#terms-warning-text').is(':visible')){
            retTF = false;
        }
    }else {
    //agree6 agree3
    	if (!$("#agree5").is(":checked") || !$("#agree1").is(":checked")|| !$("#agree6").is(":checked") || agree2OrAaree3 || eventSpeCheckAgree8()) {
    		$("#terms-warning-text").show();
    		retTF = false;
    	} else {
    		$("#terms-warning-text").hide();
    	}
    	if($('#terms-warning-text').is(':visible')){
    		retTF = false;
    	}
    }

	console.log('retTF', retTF);
	return retTF;
}

function alertDateErrMsg(start,end,lanCd){
	console.log("start",start)
	console.log("end",end)

	if("kr" == lanCd){
		alert("시작일과 종료일을 확인해주세요.");
	} else {
		alert("Please check the start and end dates.");
	}

}
function isSelectDate(lanCd){
	if($("#previoustime").val() && !$("#currenttime").val()){
		if("kr" == lanCd){
			alert("시작일 및 종료일을 선택해주세요.");
		}else{
			alert("Please select a start and end date.");
		}
		return false;
	}
	if(!$("#previoustime").val() && $("#currenttime").val()){
		if("kr" == lanCd){
			alert("시작일 및 종료일을 선택해주세요.");
		}else{
			alert("Please select a start and end date.");
		}
		return false;
	}
	return true;
}
function periodAllClick(){
	$("#periodAll").click(function () {
		$("#previoustime").val("");
		$("#currenttime").val("");
	});
}

function updateSrchCnt(seqNo, type, isTracking){
	if(isTracking){
		tracking.sign()
	}
	let vo = {"seqNo": seqNo, "type": type};
	$.ajax({
		url : "/updateSrchCuntAjax.do"
		, type : "POST"
		, dataType : 'json'
		, data: vo
		, contentType: "application/x-www-form-urlencoded; charset=UTF-8"
		, success : function(msg) {

		}
		, error : function(err) {
			console.log(err)
		}
	});
}

function fn_goHashTag(hashTagId){
	let currentUrl = window.location.pathname;
	let urlArray = currentUrl.split("/");
	let jumpUrl = "/" + urlArray[1] + "/" + urlArray[2] + "/" + urlArray[2] + "-list.do";
	window.location.href =  jumpUrl + "?hashTagId=" + hashTagId;
}

function fnReportHashtag(hashTagId){
	window.location.href = "/" + getLangCdByUrlSplit() + "/report/report-list.do?hashTagId=" + hashTagId;
}

function removeHtmlTags(str) {
	return str.replace(/<[^>]*>/g, '');
}

function replaceSearchParam(str) {
	/*let spcial = = /\//g; */
	/* /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/ */
	/*let spcial = /[!@#$%^&*_+\-=\[\]{};':"\\|,.<>\/?]+/;*/
	let spcial = /[!#$%^&*_+\-=\[\]{};\\|<>\/?]+/;
	return str.replace(/\//g, ' ');
}
document.addEventListener('DOMContentLoaded', () => {
	let inputs = document.querySelectorAll('input[type="text"]');
	inputs.forEach((input)=>{
		input.addEventListener('input', function (e) {
			let value = e.target.value;
			e.target.value = replaceSearchParam(value);
		})
	})
})

function linkNewsletter(){
	let param = '';
	if($('#emailAddress').val()){
		param = '?emailAddress=' + $('#emailAddress').val();
	}
	window.location.href = "/" + getLangCdByUrlSplit() + "/newsletter.do" + param;
}

function goNewsletter(){
	let param = '';
	if($('#newletter-emaill').val()){
		param = '?emailAddress=' + $('#newletter-emaill').val();
	}
	window.location.href = "/" + getLangCdByUrlSplit() + "/newsletter.do" + param;
}

function eventSpeCheckAgree8(){
	let agree8 = false;
	if(seqEvtNo){
		agree8 = !$("#agree8").is(":checked")
	}
	return agree8;
}

function isActiveStart(targetTimeStr) {
	// 替换空格为 T
	const formattedTimeStr = targetTimeStr.replace(/^(\d{4})(\d{2})(\d{2}) (\d{2}:\d{2})$/, '$1-$2-$3T$4:00');
	// 解析目标时间为 UTC 时间戳
	const targetUTC = new Date(formattedTimeStr).getTime();

	if (isNaN(targetUTC)) {
		console.error("Invalid date string:", targetTimeStr);
		return false;
	}
	// 当前 UTC 时间
	const nowUTC = Date.now();
	// 获取当前时间的韩国时间
	const nowKST = new Date(nowUTC).toLocaleString('en-US', { timeZone: 'Asia/Seoul' });
	// 将 nowKST 转回韩国时区的时间戳
	const nowKSTTimestamp = new Date(nowKST).getTime();
	// 判断当前韩国时间是否在目标韩国时间前一小时以内
	const diff = targetUTC - nowKSTTimestamp;

	return diff <= 0; // 1小时 = 3600000 ms
}

/**
 * 마케팅 정보 수신 동의 확인 팝업 (고지형)
 * agree4 또는 agreeEmail/Kakao/Sms 중 하나라도 체크된 경우 팝업 표시 후 callback 실행
 * @param {string} langCd - 언어 코드
 * @param {Function} callback - 팝업 확인 후 실행할 콜백
 * @returns {boolean} true=팝업으로 차단됨, false=차단 안됨(직접 callback 실행 필요)
 */
var marketingPopupCallback = null;

function openMarketingPopup(callback, consent){
  marketingPopupCallback = callback;
  var now = new Date();
  var dateStr = now.getFullYear() + '.'
    + String(now.getMonth()+1).padStart(2,'0') + '.'
    + String(now.getDate()).padStart(2,'0');
  $('#marketing-agree-date').text(dateStr);
  $('#marketing-agree-consent').text(consent || '수신동의');
  $('#popup_marketing_agree').addClass('open');
}

function closeMarketingPopup(){
  $('#popup_marketing_agree').removeClass('open');
  if(marketingPopupCallback){
    marketingPopupCallback();
    marketingPopupCallback = null;
  }
}

function checkMarketingAgreeAndProceed(langCd, callback, suffix){
  suffix = suffix || '';
  if(langCd === 'kr'){
    var hasOptionalAgree = $(`#agree4${suffix}`).is(":checked")
        && ($(`#agreeEmail${suffix}`).is(":checked")
        || $(`#agreeKakao${suffix}`).is(":checked")
        || $(`#agreeSms${suffix}`).is(":checked"));
    var consent = hasOptionalAgree ? '수신동의' : '수신거부';
    openMarketingPopup(function(){
      callback();
    }, consent);
    return true;
  }
  return false;
}

/**
 * 初始化滚动文本域组件（带固定标题跟随滚动效果）
 * @param {string} textareaSelector - textarea 选择器
 * @param {string} warnSelector - 警告信息选择器
 * @param {number} baseTop - 标题初始 top 偏移，默认 12
 */
function initScrollingTextarea(textareaSelector, warnSelector, baseTop) {
	baseTop = (baseTop !== undefined) ? baseTop : 12; // 对应 CSS 中定义的初始 top 像素值

	const $textarea = $(textareaSelector);
	const $container = $textarea.closest('.rich-inquiry-editor');
	const $header = $container.find('.fixed-header-line');

	const rawHeaderText = $header.text().trim();

	// 初始化强制隐藏警告
	$(warnSelector).hide();

	// 点击卡片聚焦
	$container.on('click', function(e) {
		if (!$(e.target).hasClass('user-real-textarea')) {
			$textarea.focus();
		}
	});

	// 监听原生滚动条，让第一行标题同步"因换行而向上隐藏"
	$textarea.on('scroll', function() {
		const scrollTop = $textarea.scrollTop();
		// 动态计算负向位移：随着滚动条往下滚，标题自然往上移，隐藏在边框之外
		$header.css('top', (baseTop - scrollTop) + 'px');
	});

	// 聚焦事件
	$textarea.on('focus', function() {
		$container.addClass('focused');
		$header.text("[" + rawHeaderText + "]");
	});

	// 输入事件 (含空格满1000字浏览器原生卡死防护)
	$textarea.on('input propertychange', function() {
		const currentLength = $textarea.val().length;

		// 锁定黑色逻辑
		if ($.trim($textarea.val()) !== '') {
			$header.addClass('locked-black');
		} else {
			$header.removeClass('locked-black');
		}

		// 1000字字数警告判定
		if (currentLength >= 1000) {
			$(warnSelector).fadeIn(150);
		} else {
			$(warnSelector).fadeOut(150);
		}
	});

	// 失焦事件
	$textarea.on('blur', function() {
		$container.removeClass('focused');

		const hasNoRealText = $.trim($textarea.val()) === '';

		if (hasNoRealText) {
			// 回退：标题摘括号，变回浅灰色，位置强制恢复初始置顶
			$textarea.val('');
			$(warnSelector).hide();
			$header.text(rawHeaderText);
			$header.removeClass('locked-black');
			$header.css('top', baseTop + 'px'); // 归位
		} else {
			// 带字失焦：维持黑色锁定
			$header.addClass('locked-black');
		}
	});
}
