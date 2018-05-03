//code migratated from DTM

var preview = 0;
//added global variable AABeacon
var AABeacon = "";
var beaconTries = 0;
var language;
var localeCookie;
var surveyBlock;


var docDOMAIN = document.domain;
var vocLink = document.location.href.toLowerCase();
var vocReferrer = document.referrer.toLowerCase();
var deviceType = (_satellite.browserInfo.deviceType);

//Check device Type. Survey currently only runs on Desktop
var checkDevice = function() {
        if (deviceType == "Desktop") {
            return true;
        } else {
            return false;
        }

    }
    //Check for IE8
var ieTest = function(testURL) {
    if (testURL.indexOf("relyingPartyId") > -1) return false;

    if (testURL.indexOf("ni.com/comprefs/preferences") > -1) return false;
    if (navigator.appName == "Microsoft Internet Explorer" && document.documentMode == "8") return false;
    else {
        return true;
    }
}

//Filter delta (JS, false = don�t show, true = show):
//var url = location.href;
var checkDelta = function(testURL) {
    if (testURL.indexOf("?") > -1) {
        testURL = testURL.split("?")[0];
    }
    if (testURL.replace(/(-test2|-test|-dev2|-dev)/, "").search(/delta.ni.com\/nipr/i) > -1) {
        return false;
    } else {
        return true;
    }
}


var checkMisc = function(domain, url, referrer) {
    if (domain.indexOf("landing") > -1) return false;
    if (domain.indexOf("lumen") > -1 && vocLink.indexOf("prodevaluation") > -1) return false;
    if (domain.indexOf("lumen") > -1 && vocLink.indexOf("prodactivation") > -1) return false;
    if (domain.indexOf("delta") > -1 && vocLink.indexOf("customer_activate_details") > -1) return false;
    if (domain.indexOf("delta") > -1 && vocLink.indexOf("extendedevaluation") > -1) return false;
    if (vocLink.indexOf("nipartslist") > -1) return false;
    if (vocLink.indexOf("labview/product-questionnaire") > -1) return false;
    if (vocLink.indexOf("?prodref=") > -1 || vocLink.indexOf("&prodref=") > -1) return false;
    if (vocReferrer.indexOf("multisim") > -1 && vocReferrer.indexOf("softonic.com") > -1) return false;
    if (vocReferrer.indexOf("beta.multisim.com") > -1) return false;
    if (vocLink.indexOf("/shop/labview/labview-nxg.html") > -1) return false;
    else { return true };
}


var surveyRegex = /(aem\-author|investor|courseware|ohm|research|joule|webcasts\.de|venus|niweek|www-preview)(-dev|-dev2|-test|-test2)?\.ni\.com/i;
var subDomainBlock = surveyRegex.test(vocLink);
var ieBlock = ieTest(vocLink);
var deltaBlock = checkDelta(vocLink);
var miscBlock = checkMisc(docDOMAIN, vocLink, vocReferrer);
var deviceBlock = checkDevice();
// console.log(vocLink);
// console.log("deviceType: " + deviceType + " so, " + deviceBlock);
// console.log("Browser OK: " + ieBlock);
// console.log("subDomainBlock: " + subDomainBlock);
// console.log("Delta OK: " + deltaBlock);
// console.log("Misc OK: " + miscBlock);
// console.log("********************");

function surveyFilter() {
    if ((!ieBlock) || (!deltaBlock) || (!miscBlock) || (!deviceBlock) || (subDomainBlock)) {
        surveyBlock = true;

    } else {
        surveyBlock = false;
        surveyInvite();
    }
}

surveyFilter();

function updateLanguage(localeCookie) {
    switch (localeCookie) {
        case "fr":
            language = "French";
            break;
        case "de":
            language = "German";
            break;
        case "ko":
            language = "Korean";
            break;
        case "en":
            language = "English";
            break;
        case "it":
            language = "Italian";
            break;
        case "ja":
            language = "Japanese";
            break;
        case "pt":
            language = "Portuguese";
            break;
        case "es":
            language = "Spanish (Latin America)";
            break;
        case "zh-CN":
            language = "Chinese (Simplified)";
            break;
        case "zh-TW":
            language = "Chinese (Traditional)";
            break;
        default:
            language = "English";
    }

}

function surveyInvite() {
    if (_satellite.getVar("VOC:URL_PARAM") == "nowyouseeme") preview = 1;
    if (_satellite.getVar("VOC:URL_PARAM") == "nowyoudont") preview = 2;
    if (_satellite.getVar("VOC:URL_PARAM") == "nopenope") preview = -1;

    /* Get new cookie type - Start */
    if (_satellite.getVar("VOC:COOKIE") == "mcxSurveyQuarantine") {
        var d = new Date();
        NIAnalytics.setCookie("mcxSurveyQuarantine", "PTW4N4:" + d.getTime(), "/");
        NIAnalytics.setCookie("mcxSurveyQuarantine", "PTW4N4:" + d.getTime(), "/", ".ni.com");
    }
    /* Get new cookie type - End */

    // console.log(preview + " and " + (_satellite.getVar("VOC:COOKIE")));
    if (preview != -1 && (preview > 0 || Math.floor((Math.random() * 100) + 1) <= 10)) {


        if (_satellite.getVar("VOC:COOKIE") == "") {

            /* Get language from metatag - Start */

            localeCookie = _satellite.getVar("LOCALE:COOKIE");
            if (localeCookie.substring(0, 2) != "zh") {
                localeCookie = localeCookie.substring(0, 2);
            }

            /* Get language from metatag - End */

            /* Generate AABeacon - Start */

            function getAABeacon() {
                beaconTries++;
                // console.log(beaconTries);
                var whitelist = ['AQB', 'mid', 'aid', 'vid', 'fid', 'AQE'];
                var foundSrc = '';
                for (var p in window) {
                    if ((p.substring(0, 4) == 's_i_') && (window[p].src)) {
                        var src = window[p].src;
                        if (src.indexOf('/b/ss/') >= 0) {
                            foundSrc = src;
                            break;
                        }
                    }
                }

                if (!foundSrc && window.document.images) {
                    for (var image_num = 0; image_num < window.document.images.length; image_num++) {
                        var src = window.document.images[image_num].src;
                        if (src.indexOf('/b/ss/') >= 0) {
                            foundSrc = src;
                            break;
                        }
                    }
                }

                if (!foundSrc) {
                    if (beaconTries < 3) {
                        getAABeacon();
                    } else if (beaconTries > 3) {
                        return '';
                    }
                }

                var mainURL = foundSrc.substring(0, foundSrc.indexOf('?'));
                var query = foundSrc.substring(foundSrc.indexOf('?') + 1);
                var filteredQuery = '';

                for (var i = 0; i < whitelist.length; i++) {
                    var v = NIAnalytics.getQueryValue(whitelist[i], query);
                    if (v) filteredQuery += (filteredQuery ? '&' : '') + whitelist[i] + '=' + v;
                }

                AABeacon = mainURL + '?' + filteredQuery;


                // console.log(AABeacon);

            }



            /* Generate AABeacon - End */

            /* Generate CustomerID - Start */

            var profileIDCookie = _satellite.getVar("PROFILE_ID:COOKIE");
            profileIDCookie = profileIDCookie != "anon" ? profileIDCookie : "Not logged in";

            /* Generate CustomerID - End */

            /* Put URL together - Start */


            function getNiSurveyURL() {
                updateLanguage(localeCookie);
                niVOCSurveyURL = "https://survey.ni.com/cgi-bin/qwebcorporate.dll?idx=PTW4N4";
                if (preview == 2) {
                    niVOCSurveyURL = niVOCSurveyURL + "&preview=1";
                }
                niVOCSurveyURL = niVOCSurveyURL + "&l=" + language;
                niVOCSurveyURL = niVOCSurveyURL + "&AABeacon=" + encodeURIComponent(AABeacon);
                niVOCSurveyURL = niVOCSurveyURL + "&CustomerID=" + profileIDCookie;
                niVOCSurveyURL = niVOCSurveyURL + "&URL=" + window.location.href;
                console.log(niVOCSurveyURL + " and language is " + language);

                return niVOCSurveyURL;

            }




            /* Put URL together - End */

            /* Calling the modal - Start */
            window.setTimeout(function() {
                getAABeacon()
                siteWideModal(_satellite.getVar("DELIVEREDBY:METATAG").search(/CMS|Commerce|Configurator/) == -1);
                var d = new Date();
                NIAnalytics.setCookie("mcxSurveyQuarantine", "PTW4N4:" + d.getTime(), "/");
                NIAnalytics.setCookie("mcxSurveyQuarantine", "PTW4N4:" + d.getTime(), "/", ".ni.com");
            }, 5000);

            /* Calling the modal - End */
        }
    }







    //VOC Surveys
    var surveyPopup;
    //var language = 'en';
    var surveyCss = "//www.ni.com/niassets/css/ni-survey.css"

    function siteWideModal(isOldPage) {
        $('<link rel="stylesheet" type="text/css" href="' + surveyCss + '" >').appendTo("head");
        getExtraKeysAndLaunch(isOldPage);
    }

    function launchSurveyModal(extraKeys, isOldPage) {
        isOldPage = (typeof(isOldPage) !== 'undefined') ? isOldPage : true;
        var newHTMLContainer = '';



        newHTMLContainer += '<div id="overlay"><div id = "analytics-ni-survey-invite"><div class = "surveyInvitation" style="display:none;">';
        newHTMLContainer += '<div class="modal-header"><div class="clearfix pnx-block-2x"><h3 class="modal-title">' + extraKeys['MODAL_TITLE'] + '</h3><svg id="analytics-close-modal" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 600 600" width="30px" height="30px" enable-background="new 0 0 600 600" xml:space="preserve""><polygon points="600,-0.24 562.513,-0.24 300.104,279.038 37.695,-0.24 0.208,-0.24 281.361,299.656 0.208,599.552 37.695,599.552 300.104,320.274 562.513,599.552 600,599.552 318.848,299.656 "></polygon><rect width="100%" height="100%" style="stroke:#fff;fill:#fff;fill-opacity:0;stroke-opacity:0;"/></svg></div></div>';
        newHTMLContainer += '<div class="pnx-block-1x">' + extraKeys['MODAL_GREETING'] + '</div>';
        newHTMLContainer += '<div class="pnx-block-1x"><strong>' + extraKeys['MODAL_EXPERIENCE'] + '</strong></div>';
        newHTMLContainer += '<div class="pnx-block-2x font-size-s">' + extraKeys['POPUP_DIRECTIONS'] + '</div>';
        newHTMLContainer += '<div class="center-block clearfix">';
        newHTMLContainer += '<span class="ni-btn ni-btn-tertiary analytics-survey-no"">' + extraKeys['MODAL_LEFT_BUTTON'] + '</span>';
        newHTMLContainer += '<span class="ni-btn ni-btn-tertiary analytics-survey-yes">' + extraKeys['MODAL_RIGHT_BUTTON'] + '</span>';
        newHTMLContainer += '</div>';
        newHTMLContainer += '</div></div></div>';
        $(newHTMLContainer).appendTo('body');
        $("div.surveyInvitation").slideDown(500);
        //$('#close-modal').css({height:titleHeight,width:titleHeight});
        $('#close-modal rect').click(function() { sayNoToSurvey('analytics-ni-survey-invite'); });
        $('.analytics-survey-yes').click(function() { sayYesToSurvey(); });
        $('.analytics-survey-no').click(function() { sayNoToSurvey('analytics-ni-survey-invite'); })
        $("#overlay").click(function() {
            //$$survey.hide();
            sayNoToSurvey('#analytics-ni-survey-invite')
        });

    }


    function sayNoToSurvey(modalClass) {
        //close modal
        $('#analytics-ni-survey-invite').hide();
        $("#overlay").hide();
    }

    function sayYesToSurvey() {
        //launch popup
        //var niVOCSurveyURL = "https://survey.ni.com/cgi-bin/qwebcorporate.dll?&idx=8TV7E6";
        var queryString = encodeURIComponent(getNiSurveyURL());
        surveyPopup = window.open('//www.ni.com/apps/surveys/vocsurvey2015.html?lang=' + language + '&surl=' + queryString, 'SurveyModal', 'width=800,height=450,location=no,resizable=yes,titlebar=no,menubar=no');
        sayNoToSurvey('#survey-launch-modal');
    };

    function getSurveyLanguage() {
        language = (($.cookie("locale") !== null) && (typeof($.cookie("locale")) !== 'undefined')) ? $.cookie("locale") : 'en';
        if (language.substring(0, 2) == "zh") {
            if (language == "zh-CN") language = "zhs";
            if (language == "zh-TW" || language == "zh-HK") language = "zht";
        }
        language = language.replace(/\-.*/, "");

        return language;
    }

    function getExtraKeysAndLaunch(isOldPage) {
        var lang = getSurveyLanguage();
        //TODO: Use the below line with the '/' when going back to proxy.
        //	var lang = getSurveyLanguage() + '/';
        //	var x = location.hostname;
        //	console.log(x);

        //TODO:  Swap the following with the commented out code, after proxy can work cross domain
        launchSurveyModal(hardTranslation(lang), isOldPage);
        //var hardEngData = hardTranslation(lang);
        //
        //$.ajax({
        //	url: "//www.ni.com/extra-delivery-proxy/translation/Set/1.0/"+lang+"VOC-SURVEYS.json",
        //	context: document.body,
        //	timeout: 10000,
        //	success: function(data) {
        //		if ((typeof(data['MODAL_EXPERIENCE']) == 'undefined') || (data['MODAL_EXPERIENCE'] == 'undefined'))
        //		{
        //			launchSurveyModal(hardEngData, isOldPage);
        //		}
        //		else
        //		{
        //			launchSurveyModal(data, isOldPage);
        //		}
        //	},
        //	error: function() {
        //		launchSurveyModal(hardEngData, isOldPage);
        //	}
        //});
    }

    function hardTranslation(lang) {
        var translation = {
            "MODAL_TITLE": "We welcome your feedback!",
            "MODAL_EXPERIENCE": "This survey is designed to measure your entire ni.com experience and so will appear at the end of your visit.",
            "MODAL_POPUP_INFO": "This survey is conducted by an independent company, on behalf of National Instruments.",
            "MODAL_LEFT_BUTTON": "No, thanks",
            "MODAL_RIGHT_BUTTON": "Yes, I'll help",
            "POPUP_LEAVE_OPEN": "Please leave this window open.",
            "POPUP_DIRECTIONS": "When you have finished using ni.com, please switch back to this window to complete the survey.  For now, please click in the ni.com window to continue your session.",
            "POPUP_THANK_YOU": "Thank you for sharing your feedback.",
            "MODAL_GREETING": "Thank you for visiting ni.com today.  In order to ensure we provide you with the best experience, we would like your feedback regarding this visit, so we can continuously improve."
        };
        var langMap = {
            zh: { //using Chinese Simplified when Traditional and Simplified aren't deliniated between.
                "MODAL_TITLE": "欢迎提供您的反馈！",
                "MODAL_EXPERIENCE": "本调查旨在了解您的整体ni.com体验，因此调查会在您结束访问之后出现。",
                "MODAL_POPUP_INFO": "本调查由一个独立的公司代表NI执行。",
                "MODAL_LEFT_BUTTON": "不, 谢谢",
                "MODAL_RIGHT_BUTTON": "参与调查",
                "POPUP_LEAVE_OPEN": "请保持本窗口处于打开状态。",
                "POPUP_DIRECTIONS": "当您访问ni.com结束后，请返回到本窗口填写调查。 现在，您可以点击ni.com窗口继续您的访问。",
                "POPUP_THANK_YOU": "非常感谢您的反馈。",
                "MODAL_GREETING": "感谢您今天访问ni.com。 为了确保为您提供最佳的体验，我们希望了解您对本次访问的反馈以便我们持续改进。"
            },
            zhs: {
                "MODAL_TITLE": "欢迎提供您的反馈！",
                "MODAL_EXPERIENCE": "本调查旨在了解您的整体ni.com体验，因此调查会在您结束访问之后出现。",
                "MODAL_POPUP_INFO": "本调查由一个独立的公司代表NI执行。",
                "MODAL_LEFT_BUTTON": "不, 谢谢",
                "MODAL_RIGHT_BUTTON": "参与调查",
                "POPUP_LEAVE_OPEN": "请保持本窗口处于打开状态。",
                "POPUP_DIRECTIONS": "当您访问ni.com结束后，请返回到本窗口填写调查。 现在，您可以点击ni.com窗口继续您的访问。",
                "POPUP_THANK_YOU": "非常感谢您的反馈。",
                "MODAL_GREETING": "感谢您今天访问ni.com。 为了确保为您提供最佳的体验，我们希望了解您对本次访问的反馈以便我们持续改进。"
            },
            zht: {
                "MODAL_TITLE": "歡迎您提供想法與建議！",
                "MODAL_EXPERIENCE": "這份問卷調查是為了評估您使用 ni.com 的整體狀況而設計的，會在您離開網站的時候出現。",
                "MODAL_POPUP_INFO": "這份問卷調查由一家獨立公司代表 NI 國家儀器而執行。",
                "MODAL_LEFT_BUTTON": "不用了，謝謝	",
                "MODAL_RIGHT_BUTTON": "我願意協助填寫",
                "POPUP_LEAVE_OPEN": "請勿關閉此視窗。",
                "POPUP_DIRECTIONS": "當您離開 ni.com 的時候，請切換至此視窗以便完成問卷。現在請點選 ni.com 視窗，繼續尋找您所需的資訊。",
                "POPUP_THANK_YOU": "感謝您分享寶貴的意見。",
                "MODAL_GREETING": "感謝您今天造訪 ni.com。為了提供最好的服務給您，希望您可以針對這次的經驗提供意見或想法，幫助我們持續改進。"
            },
            fr: {
                "MODAL_TITLE": "Nous accordons beaucoup d'importance à votre opinion!",
                "MODAL_EXPERIENCE": "Cette enquête est destinée à mesurer votre degré de satisfaction sur notre site ni.com et s'affichera au terme de votre visite.",
                "MODAL_POPUP_INFO": "Cette enquête est organisée par une société indépendante, au nom de National Instruments.",
                "MODAL_LEFT_BUTTON": "Non, merci.",
                "MODAL_RIGHT_BUTTON": "Oui, j'accepte",
                "POPUP_LEAVE_OPEN": "Veuillez laisser cette fenêtre ouverte.",
                "POPUP_DIRECTIONS": "À la fin de votre visite sur ni.com, veuillez revenir sur cette page pour renseigner l'enquête. Pour l'instant, cliquez sur la fenêtre ni.com pour continuer votre visite.",
                "POPUP_THANK_YOU": "Merci de nous faire part de vos remarques.",
                "MODAL_GREETING": "Nous vous remercions de votre visite sur ni.com. Afin de vous assurer les meilleurs services et améliorer la qualité de notre site, nous aimerions connaître vos commentaires sur la qualité de votre visite."
            },
            es: {
                "MODAL_TITLE": "¡Agradecemos sus comentarios!",
                "MODAL_EXPERIENCE": "Esta encuesta está diseñada para valorar su experiencia en ni.com y aparecerá al finalizar su visita.",
                "MODAL_POPUP_INFO": "Esta encuesta es realizada por una compañía independiente, en nombre de National Instruments.",
                "MODAL_LEFT_BUTTON": "No, gracias",
                "MODAL_RIGHT_BUTTON": "Sí, quiero participar",
                "POPUP_LEAVE_OPEN": "Por favor deje esta ventana abierta.",
                "POPUP_DIRECTIONS": "Al terminar de navegar en ni.com, por favor regrese a esta ventana para responder la encuesta. Por ahora haga clic en la ventana de ni.com para continuar con su sesión.",
                "POPUP_THANK_YOU": "Gracias por compartir su opinión.",
                "MODAL_GREETING": "Gracias por su visita de hoy a ni.com. Con el fin de garantizar que le brindamos la mejor experiencia, nos gustaría conocer sus comentarios sobre esta visita, y así poder mejorar continuamente."
            },
            de: {
                "MODAL_TITLE": "Wir freuen uns auf Ihre Meinung!",
                "MODAL_EXPERIENCE": "Wir möchten erfahren, wie zufrieden Sie mit unserer Website sind. Daher laden wir Sie zu einer Umfrage ein, an der Sie bei Verlassen der Website teilnehmen können.",
                "MODAL_POPUP_INFO": "Die Umfrage wird durch ein unabhängiges Unternehmen im Namen von National Instruments durchgeführt.",
                "MODAL_LEFT_BUTTON": "Nein danke",
                "MODAL_RIGHT_BUTTON": "Ja, ich nehme teil",
                "POPUP_LEAVE_OPEN": "Bitte lassen Sie dieses Fenster geöffnet.",
                "POPUP_DIRECTIONS": "Wenn Sie ni.com verlassen, wechseln Sie bitte zu diesem Fenster zurück, um an der Umfrage teilzunehmen. Klicken Sie nun zunächst auf das ni.com-Fenster, um Ihre Sitzung fortzusetzen.",
                "POPUP_THANK_YOU": "Vielen Dank für Ihr Feedback!",
                "MODAL_GREETING": "Wir bedanken uns für Ihren Besuch auf ni.com. Damit wir Sie jederzeit optimal mit Informationen versorgen und unseren Internetauftritt weiter optimieren können, bitten wir Sie um Ihre Erfahrungen bei diesem Besuch."
            },
            it: {
                "MODAL_TITLE": "La tua opinione è importante!",
                "MODAL_EXPERIENCE": "Questo sondaggio ha lo scopo di valutare il tuo livello di soddisfazione relativo al sito ni.com e potrai compilarlo al termine della consultazione.",
                "MODAL_POPUP_INFO": "Questo sondaggio è condotto da una società esterna per conto di National Instruments.",
                "MODAL_LEFT_BUTTON": "No, grazie",
                "MODAL_RIGHT_BUTTON": "Sì, desidero partecipare",
                "POPUP_LEAVE_OPEN": "Si prega di lasciare questa finestra aperta.",
                "POPUP_DIRECTIONS": "Quando hai terminato la tua visita su ni.com, ritorna su questa finestra per partecipare al sondaggio. Per il momento, fai clic sulla finestra ni.com per continuare la consultazione.",
                "POPUP_THANK_YOU": "Ti ringraziamo per averci inviato i tuoi commenti.",
                "MODAL_GREETING": "Grazie per aver visitato ni.com Per assicurarci di poterti fornire la migliore esperienza su ni.com, vorremmo conoscere la tua opinione a riguardo."
            },
            ko: {
                "MODAL_TITLE": "NI는 귀하의 의견을 존중합니다.",
                "MODAL_EXPERIENCE": "본 설문조사는 ni.com 웹사이트 사용에 대한 귀하의 의견을 듣고자 마련되었으며 웹사이트 방문 마지막에 설문조사에 참여할 수 있습니다.",
                "MODAL_POPUP_INFO": "본 설문조사는 NI를 대신하여 독립 업체에서 실시합니다.",
                "MODAL_LEFT_BUTTON": "아니오.",
                "MODAL_RIGHT_BUTTON": "네, 참여하겠습니다.",
                "POPUP_LEAVE_OPEN": "본 창을 계속 열어두십시오.",
                "POPUP_DIRECTIONS": "ni.com 웹사이트를 사용하신 후에 본 창으로 돌아와 설문조사에 응해주십시오. 지금은 ni.com 창을 클릭하여 계속 진행하십시오.",
                "POPUP_THANK_YOU": "피드백을 주셔서 감사합니다.",
                "MODAL_GREETING": "ni.com을 방문해 주셔서 감사합니다. 오늘 방문과 관련된 피드백을 주시면 저희가 여러분들께 지속적으로 최상의 서비스를 제공하는데 도움이 됩니다."
            },
            ja: {
                "MODAL_TITLE": "ご意見をお聞かせください	",
                "MODAL_EXPERIENCE": "このアンケートはNIサイトの使いやすさを把握することを目的としているため、お客様が実際に当サイトをご覧になった後に再度表示してください。",
                "MODAL_POPUP_INFO": "このアンケートはナショナルインスツルメンツより委託された調査会社が代わりに実施しております。",
                "MODAL_LEFT_BUTTON": "参加しない	",
                "MODAL_RIGHT_BUTTON": "参加する",
                "POPUP_LEAVE_OPEN": "このウィンドウは閉じないでください。",
                "POPUP_DIRECTIONS": "NIサイトをご覧になった後、このウィンドウに切り替えてアンケートにご回答ください。では、NIサイト内をクリックして、セッションを再開してください。",
                "POPUP_THANK_YOU": "ご意見をお聞かせいただき、ありがとうございます。",
                "MODAL_GREETING": "ナショナルインスツルメンツ（NI）サイトをご覧いただきましてありがとうございます。皆様により便利に当サイトをご利用いただくため、今後の品質向上に向けて、今回のご利用に関してご意見をいただきたく存じます。"
            },
            pt: {
                "MODAL_TITLE": "Sua opinião é muito importante para nós!",
                "MODAL_EXPERIENCE": "Como essa pesquisa tem como objetivo medir sua experiência completa no site ni.com, ela será apresentada ao final de sua visita.",
                "MODAL_POPUP_INFO": "Essa pesquisa de satisfação é realizada por uma empresa independente, em nome da National Instruments",
                "MODAL_LEFT_BUTTON": "Não, obrigado",
                "MODAL_RIGHT_BUTTON": "Sim, quero participar",
                "POPUP_LEAVE_OPEN": "Para participar, mantenha esta janela aberta.",
                "POPUP_DIRECTIONS": "Após ter utilizado o site ni.com, pedimos que você volte a esta janela, para responder à pesquisa. Para continuar sua visita, clique na janela do site ni.com.",
                "POPUP_THANK_YOU": "Obrigado por enviar a sua opinião.",
                "MODAL_GREETING": "Obrigado por sua visita ao site ni.com. Gostaríamos de receber sua opinião sobre esta visita, para podermos melhorar cada vez mais a sua experiência de usuário."
            }
        };

        var translationsValues = langMap[lang];
        translation = (typeof(translationsValues) !== 'undefined') ? translationsValues : translation;


        return translation;
    }
}

///* For hand-testing the survey modal */
//$(document).ready(function(){
//	prepareSurveyModal();
//});
//
//












//#######################################################################################//
// The NI survey displays an invitation inline on a website to take a survey. If the respondent agrees, the survey is displayed. In both cases, a cookie is placed on the respondents machine, so that they are not over surveyed. 
//The first set of parameters allows one to customize the invitation and the survey.
//displayAlways: Set to yes for demo purposes. In this case, a cookie is not placed and the invitation will be displayed on each visit.
//surveyURL: The URL to the survey. IMPORTANT: Confirm the survey is published and active before referring to it
//css: This is the location to the CSS file that displays the look and feel of the survey invitation
//invitationDiv: This has various properties for the invitation that is displayed
//showCookie: Add a cookie if the respondent agrees to take the survey (clicks Yes on the invitation)
//noShowCookie: Add a cookie if the respondent does not agree to take the survey (clicks No on the invitation
//invitationText: The text of the invitation. 
//#######################################################################################//


//TOP TEN SURVEY
//function niSurveyModal()
//{
//     var d = new Date();
//     //$.cookie("topTasksSurvey", "TOPTASKS", "/");
//	$$survey.init();
//}	
//
//
//var surveyPreview = "";
//if (_satellite.getVar("TT_VOC:URL_PARAM") == "practice")  surveyPreview = "&preview=1";
//if (_satellite.getVar("TT_VOC:URL_PARAM") == null)  surveyPreview = "";
//
//    /* Calling the modal - Start */
////
////window.setTimeout(function() {
////      
////      niSurveyModal()
//          //var d = new Date();
//          //$.cookie("topTasksSurvey", "TOPTASKS:" + d.getTime(), "/");
////      NIAnalytics.setCookie("topTasksSurvey", "TOPTASKS:" + d.getTime(), "/");
////      NIAnalytics.setCookie("topTasksSurvey", "TOPTASKS:" + d.getTime(), "/", ".ni.com");
////    }, 5000);
////    
// 
//
//var $$handle;
//var $$survey = {
//    displayAlways: "no",
//     surveyURL:"https://survey.ni.com/cgi-bin/qwebcorporate.dll?&idx=8TV7E6" + surveyPreview,
//    css: {	
//	location:"//www.ni.com/niassets/css/ni-survey.css",
//    },
//    showCookie: {
//	name:"showCookie",
//	value:"show",
//	expires:"60",
//    },
//    noShowCookie: {
//	name:"noShowCookie",
//	value:"hide",
//	expires:"60",
//    },
//    
//     invitationText: "<span class = 'invite'><h3>Tell Us What's Important To You</h3>NI would like to know more about our customers' most important tasks, so we can improve your web experience. This survey will take about three to five minutes to complete.<br><br><span class='ni-btn ni-btn-tertiary survey-yes'  onclick = '$$survey.show();'>YES, I'LL HELP</span><span class='ni-btn ni-btn-tertiary survey-no' onclick = '$$survey.hide();'>NO, THANKS</span></span>",
//    
//    invite: function(){
//	if (!this.readCookie(this.noShowCookie.name))
//	{
//	    strInvitation = "<div id = 'ni-survey-invite' class = 'surveyInvitation' style = 'display:none'>" + this.invitationText + "</div>";
//	    $(strInvitation).appendTo('body');
//	    //Add other details about how the invitation will appear here. 
//	    $("div.surveyInvitation").delay(1200).slideDown(500);
//	}
//    },
//    
//    show: function(event) {
//	if(!this.displayAlways){this.setCookie(this.showCookie);}
//     
//    //var strURL = this.surveyURL;
//      $("#ni-survey-invite").slideUp(500);
//     window.open(this.surveyURL);
//},
//
//
//    hide: function() {
//	if(!this.displayAlways){this.setCookie(this.noShowCookie);}
//	$("#ni-survey-invite").slideUp(500);
//
//    },
//
//    setCookie: function(cookie) {
//	name=cookie.name;
//	value=cookie.value;
//	days=cookie.expires;
//	if (days) {
//	    var date = new Date();
//	    date.setTime(date.getTime()+(days*24*60*60*1000));
//	    var expires = "; expires="+date.toGMTString();
//	}
//	else var expires = "";
//	document.cookie = name+"="+value+expires+"; path=/";
//    },
//
//    readCookie: function(name) {
//	var nameEQ = name + "=";
//	var ca = document.cookie.split(';');
//	for(var i=0;i < ca.length;i++) {
//	    var c = ca[i];
//	    while (c.charAt(0)==' ') c = c.substring(1,c.length);
//	    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
//	}
//	return null;
//    },
//
//    eraseCookie: function(name) {
//	this.setCookie(name,"",-1);
//    },
//    
//    //All initialization for survey goes in here
//    init: function() {
//		$('<link rel="stylesheet" type="text/css" href="'+this.css.location+'" >').appendTo("head");
//		this.invite();
//    }
//    
//}; 
//