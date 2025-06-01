//==============================================================
//儲存 框架底層 共用js Method
//嚴禁修改
//Mvoed by ted 2017/08/28

//修改歷程
//2017/08/28 Moved by ted
//2017/09/05 修改gotoNext 允許component-{Name}-{Name}-mainPage Naming Rule 的 Component載入，by ted
//==============================================================

"use strict";
var testFlag = {
  isHTMLVerision: false,
  isOffLine: true,
  offScanner: false,
  viewDebugger: false,
  devicebypass:false ///首頁不檢查 (測試用)
};
var kiosk = kiosk || {};

(function () {
  kiosk.API = kiosk.API || {};
  kiosk.culture = kiosk.culture || kiosk.enum.culture.ENUS;
  kiosk.currentCulture = returnCulture[kiosk.culture]; //當前語系
  kiosk.enum = kiosk.enum || {};
  kiosk.keepProcessTime = 3;
  kiosk.status = {};
  kiosk.status.error = {};
  kiosk.API.eventBus = {};
  kiosk.API.transferEnum = function (enumType) {
    var wt = {};
    $.each(enumType, function (key, val) {
      wt[(wt[key] = val)] = key;
    });
    return wt;
  };
  kiosk.API.events = {
    endSession: {},
  };
  $.each(kiosk.enum, function (key, obj) {
    obj = kiosk.API.transferEnum(obj);
  });
  //kiosk.API.loadError = function(el) {
  //    //console.log($(el.target).attr('src'));
  //    $(el.target).attr("src", "img/MOLWALLET.png");
  //}
  var printFail = function (res) {
    if (!res.IsSuccess) {
      kiosk.status.error.message = "印表機發生異常，請通知服務人員處理!";
      kiosk.API.goToNext("error");
    }
  };
  var defaultModelKey = location.hash
    ? location.hash.replace("#", "")
    : "mainMenu";
  kiosk.errorProcess = true;
  kiosk.API.goToNext = function (nextModelKey, keepSession) {
    WriteLog(
      "kiosk.currentModelKey: " +
        kiosk.currentModelKey +
        ", nextModelKey: " +
        nextModelKey
    );
    if (kiosk.errorProcess) {
      // alert(defaultModelKey);
      //alert("keepSession:" + keepSession);
      if (testFlag.viewDebugger == false) {
        kiosk.API.resetTimmer();
      }

      kiosk.currentModelKey = kiosk.currentModelKey || defaultModelKey;

      if (nextModelKey === "mainMenu" && kiosk.session && !keepSession)
        kiosk.session.endSession();
      if (nextModelKey !== "mainMenu" && nextModelKey !== "error") {
      }
      if (kiosk.session == undefined) kiosk.API.createSession();

      var behaviorData = {
        fronPageName: kiosk.currentModelKey,
        destination: nextModelKey,
        occurrenceTime: new Date(),
      };

      $.extend(behaviorData, kiosk.status.currentModel);
      kiosk.session.addBehavior(behaviorData);

      if (nextModelKey) {
        if (kiosk.currentModelKey != nextModelKey)
          kiosk.lastModelKey = kiosk.currentModelKey;
        kiosk.currentModelKey = nextModelKey;
        var nextModel = viewModel[kiosk.culture][kiosk.currentModelKey];

        // 修改gotoNext 允許component-{Name}-{Name}-mainPage Naming Rule 的 Component載入，by ted
        var template;
        var templateArr = kiosk.currentModelKey.split("-");
        var templateArrlen = Number(templateArr.length);
        if (templateArrlen > 1) {
          if (
            templateArr[templateArrlen] === "main" ||
            templateArr[templateArrlen] === "foot" ||
            templateArr[templateArrlen] === "navBar"
          ) {
            templateArr.splice(Number(templateArrlen - 1), 1);
          }

          if (templateArr[0] === "component") {
            templateArr.splice(0, 1);
          }

          template = templateArr.join("-");
        } else {
          template = kiosk.currentModelKey.split("-")[0];
        }

        kiosk.app.currentPage = "component-" + template + "-main";

        kiosk.app.currentModel = nextModel;
        if (nextModel && nextModel.bottom) {
          kiosk.app.currentFoot = "component-" + template + "-foot";
        } else {
          kiosk.app.currentFoot = undefined;
        }
        if (nextModel && nextModel.navBar) {
          kiosk.app.currentNavBar = "component-" + template + "-navBar";
        } else {
          kiosk.app.currentNavBar = undefined;
        }
      } else {
        kiosk.app.currentModel =
          viewModel[kiosk.culture][kiosk.currentModelKey];
      }
      Vue.nextTick(function () {
        $("a").attr("draggable", false);
        $("img").attr("draggable", false);
        kiosk.app.updateLoading(false);
      });
    }
  };
  kiosk.API.goToError = function (nextModelKey, keepSession) {
    // alert(defaultModelKey);
    //alert("keepSession:" + keepSession);
    if (testFlag.viewDebugger == false) {
      kiosk.API.resetTimmer();
    }

    kiosk.currentModelKey = kiosk.currentModelKey || defaultModelKey;

    if (nextModelKey === "mainMenu" && kiosk.session && !keepSession)
      kiosk.session.endSession();
    if (nextModelKey !== "mainMenu" && nextModelKey !== "error") {
    }
    if (kiosk.session == undefined) kiosk.API.createSession();

    var behaviorData = {
      fronPageName: kiosk.currentModelKey,
      destination: nextModelKey,
      occurrenceTime: new Date(),
    };

    $.extend(behaviorData, kiosk.status.currentModel);
    kiosk.session.addBehavior(behaviorData);

    if (nextModelKey) {
      if (kiosk.currentModelKey != nextModelKey)
        kiosk.lastModelKey = kiosk.currentModelKey;
      kiosk.currentModelKey = nextModelKey;
      var nextModel = viewModel[kiosk.culture][kiosk.currentModelKey];

      // 修改gotoNext 允許component-{Name}-{Name}-mainPage Naming Rule 的 Component載入，by ted
      var template;
      var templateArr = kiosk.currentModelKey.split("-");
      var templateArrlen = Number(templateArr.length);
      if (templateArrlen > 1) {
        if (
          templateArr[templateArrlen] === "main" ||
          templateArr[templateArrlen] === "foot" ||
          templateArr[templateArrlen] === "navBar"
        ) {
          templateArr.splice(Number(templateArrlen - 1), 1);
        }

        if (templateArr[0] === "component") {
          templateArr.splice(0, 1);
        }

        template = templateArr.join("-");
      } else {
        template = kiosk.currentModelKey.split("-")[0];
      }

      kiosk.app.currentPage = "component-" + template + "-main";

      kiosk.app.currentModel = nextModel;
      if (nextModel && nextModel.bottom) {
        kiosk.app.currentFoot = "component-" + template + "-foot";
      } else {
        kiosk.app.currentFoot = undefined;
      }
      if (nextModel && nextModel.navBar) {
        kiosk.app.currentNavBar = "component-" + template + "-navBar";
      } else {
        kiosk.app.currentNavBar = undefined;
      }
    } else {
      kiosk.app.currentModel = viewModel[kiosk.culture][kiosk.currentModelKey];
    }
    Vue.nextTick(function () {
      $("a").attr("draggable", false);
      $("img").attr("draggable", false);
      kiosk.app.updateLoading(false);
    });
  };
  kiosk.API.changeCulture = function (culture) {
    kiosk.culture = culture;
    kiosk.API.goToNext();
  };
  kiosk.API.initStatus = function () {
    kiosk.status = {};
    //MOL.currentStatus.transaction = {};
  };
  kiosk.API.defautClick = function (e) {
    //console.log({
    //    html: e.target.outerHTML,
    //    currentViewModel: kiosk.currentModelKey
    //});
  };
  kiosk.API.goHome = function (e) {
    if (kiosk.session) kiosk.session.endSession();
    //location.reload();
    //$(e.target).prop("disabled", true);
  };
  //移除並建立新的Session
  kiosk.API.createSession = function () {
    var session = {};
    session.track = [];
    session.startTime = new Date();
    session.addBehavior = function (behaviorData) {
      this.track.push(behaviorData);
    };
    session.endSession = function () {
      var behaviors = this.track,
        startDate = this.startTime,
        endDate = new Date();
      if (behaviors.length == 0) return;
      $.each(behaviors, function (index, bev) {
        var behaviorData = $.extend(bev, {
          seqNo: index,
          startDate: startDate,
          endDate: endDate,
        });
        try {
          kiosk.API.log.logUserBehavior(behaviorData);
        } catch (e) {}
      });
      kiosk.session = undefined;
      kiosk.status = {};
      kiosk.status.error = {};
      $.each(kiosk.API.events.endSession, function (key, fn) {
        fn();
      });
    };
    if (kiosk.session) kiosk.session.endSession();
    kiosk.session = session;
  };
  //重新設定計時器
  kiosk.API.resetTimmer = function () {
    kiosk.gobackToMainMenu = false;
    kiosk.secondIdleGoBack = false;
    kiosk.API.idle.ResetTimmer();
  };

  //idle超過時間後要執行的動作
  kiosk.API.Timmer = function () {
    kiosk.API.log.logInfo(
      "kiosk.app.currentPage=" +
        kiosk.app.currentPage +
        ";kiosk.gobackToMainMenu=" +
        kiosk.gobackToMainMenu
    );
    if (
      kiosk.currentModelKey === "mainMenu" ||
      kiosk.currentModelKey === "deviceOpen" ||
      kiosk.currentModelKey === "register" ||
      kiosk.app.isLoading ||
      kiosk.app.currentPage === "component-common-process" ||
      kiosk.currentModelKey === "error" ||
      kiosk.currentModelKey === "Payment" ||
      kiosk.currentModelKey === "PrintFail" ||
      kiosk.currentModelKey === "PaySuccess" // 避免印多張票時超過idle時間
    )
      return;
    if (kiosk.gobackToMainMenu && !testFlag.viewDebugger) {
      //vieShow.StepManager.goToHome();
      kiosk.API.idle.GoHome();
      // kiosk.API.goToNext('mainMenu');
    } else kiosk.gobackToMainMenu = true;
  };
  kiosk.gobackToMainMenu = false;

  var templateContainer = $("<div></div>"),
    $body = $("body"),
    max = kioskTemplates.length,
    templateComplite = {};

  var loadTemplate = function (index) {
    var templateName = kioskTemplates[index],
      currentContainer = {},
      templateUrl = "templates/" + templateName + ".html",
      componentUrl = "scripts/components/" + templateName + ".js";

    templateComplite[templateName] = currentContainer;
    //  console.log(templateUrl + ':start');
    templateContainer.load(templateUrl, function (res) {
      try {
        $(res).appendTo($body);
        currentContainer.template = true;
        $.getScript(componentUrl)
          .done(function (res) {
            currentContainer.component = true;
            currentContainer.templateName = templateName;
            startMain();
          })
          .fail(function (e) {
            console.log("load File Fail,path[" + componentUrl + "]");
            console.log(e);
            kiosk.API.log.logError(e, componentUrl);
          });

        index++;
        if (index < max) {
          loadTemplate(index);
        } else {
          startMain();
        }
      } catch (e) {
        console.log("load File Fail,path[" + templateUrl + "]");
        console.log(e);
      }
    });
  };
  var loadCulture = function () {
    var $body = $("body");
    temp = [];
  };

  var StartMainApp = function () {
    console.log("StartMainApp");
    var mainApp = new Vue({
      el: "#vpp",
      data: {
        currentCulture: kiosk.culture,
       currentPage: "component.deviceOpen",  // 預設起始頁
currentModel: viewModel[kiosk.culture]["deviceOpen"], // 預設的資料模型
currentNavBar: "component-TVMcommon-navBar",
        currentFoot: undefined,
        dailogbox: undefined,
        clock: {
          clockDate: "",
          clockTime: "",
          clockDateOfWeek: "",
        },
        footbtns: [],
        isLoading: false,
        showImg: false,
        deviceStatus: {
          TSCSTATUS: false,
        },
      },
      methods: {
        updateNav: function (componentName, conponentModel) {
          this.currentNavBar = componentName;
          $.extend(this.currentModel, conponentModel);
        },
        updateFoot: function (componentName, conponentModel, events) {
          this.currentFoot = componentName;
          $.extend(this.currentModel, conponentModel);
          this.footbtns = events;
        },
        /*
         *   dailogboxModel 有兩個屬性，做為控制pop視窗用
         *   type=>字串 請放入 dailogboxType，可參考 vieShow.dailogboxType 的key
         *   btns=>按鈕陣列，按鈕物件內含兩個屬性，顯示名稱 title 跟 執行事件 delegate，
         *   各type所支援的按鈕數量與位置都不一樣，使用前請先參考component-common.js
         *   目前已有下列popupbox元件
         *   component-common-seatmap
         *   component-common-messagebox
         *   component-common-promotion
         */
        updateDailogBox: function (dailogboxModel) {
          this.dailogbox = dailogboxModel;
        },
        clearDailogBox: function () {
          var self = this;
          $("#popup-component").fadeOut("slow", function () {
            self.dailogbox = undefined;
          });
        },
        closeImg: function () {
          var self = this;
          $("#zooninImg").fadeOut("slow", function () {
            self.showImg = false;
          });
        },
        zooninImg: function (src) {
          kiosk.status.showImg = src;
          this.showImg = true;
          this.$nextTick(function () {
            $("#zooninImg").fadeIn("slow");
          });
        },
        updateLoading: function (isShow) {
          this.isLoading = isShow;
        },
        // 更新時鐘的日期
        updateClock: function () {
          var nowDate = moment();

          // 日期
          this.clock.clockDate = nowDate.format("YYYY/MM/DD");

          // 時間
          this.clock.clockTime = nowDate.format("HH:mm");

          // 星期幾
          var culture = this.culture || 1;
          //this.clock.clockDayOfWeek = kiosk.wording[kiosk.culture].weekWord + kiosk.wording[kiosk.culture].dayOfWeek[nowDate.weekday()];
        },
        proccessTask: function (task) {
          kiosk.status.processTask = task;
          this.currentFoot = undefined;
          this.currentPage = "component-common-process";
        },
        ErrorPage: function (msg) {},
      },
      mounted: function () {
        //先檢查是否已有kiosk.currentModelKey
        //沒有則 檢查是否有Hash
        //有hash 且 有 含有currentModelKey
        //則將currentModelKey 的值帶入kiosk.currentModelKey
        if (!kiosk.currentModelKey) {
          var search = location.search.slice(1);
          if (search) {
            $.each(search.split("&"), function (key, val) {
              var hasobj = val.split("=");
              if (hasobj[0] === "currentModelKey") {
                kiosk.currentModelKey = hasobj[1];
              }
            });
          }
        }
        kiosk.currentModelKey = kiosk.currentModelKey || defaultModelKey;
        this.$nextTick(function () {
          kiosk.API.goToNext(kiosk.currentModelKey);
        });
      },
    });

    window.onhashchange = function (e) {
      /// TODO:等MOL 提供API的profile後再繼續
      // var targetDm = viewModel[location.hash.substring(1)];
      // if (targetDm) {
      //     mainApp.currentPage = targetDm.template;
      //     mainApp.currentModel = targetDm.data;
      // }
    };
    mainApp.$on("updateBtn", function (componentName, conponentModel, events) {
      this.currentFoot = componentName;
      $.extend(this.currentModel, conponentModel);
      this.footbtns = events;
    });
    mainApp.$on("updateNav", function (componentName, conponentModel) {
      this.currentNavBar = componentName;
      $.extend(this.currentModel, conponentModel);
    });
    kiosk.app = mainApp;

    // 呼叫時鐘
    kiosk.app.updateClock();
    //vieShow.startClock();

    $("a").attr("draggable", false);
    $("img").attr("draggable", false);

    //關閉"基盤自動IDLE"功能
    kiosk.API.idle.EnableIdle(false);

    var idlesecond = parseInt(kiosk.API.idle.getIdleSeconds());
    // alert(idlesecond);
    if (idlesecond != NaN && idlesecond != 0)
      setInterval(kiosk.API.Timmer, idlesecond * 1000);
  };

  var startMain = function () {
    var Complites = $.map(templateComplite, function (value, index) {
      if (value.template && value.component) {
        return value;
      }
    });
    if (Complites.length == max) {
      StartMainApp();
    }
  };
  var waitExtReady = setInterval(function () {
    if (typeof External === "undefined" && !testFlag.viewDebugger) return;
    loadTemplate(0);
    startMain();
    clearInterval(waitExtReady);
    $(document).on("click", kiosk.API.resetTimmer);
  }, 500);
})();
Object.size = function (obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};
String.prototype.insertAt = function (index, fword, word) {
  index = this.length < index ? this.length : index;
  word = word || " ";
  var prefix = this.substring(0, index),
    suffix = this.substring(index),
    result = "";
  if (!fword) {
    result = prefix.substring(0, index - 1) + suffix;
  } else {
    result = prefix + word + suffix;
  }
  return result;
};
