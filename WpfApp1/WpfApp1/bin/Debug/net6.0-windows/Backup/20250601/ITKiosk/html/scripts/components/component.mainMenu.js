// MainPage
Vue.component("component-mainMenu-main", {
  props: ["model"],
  template: "#template-mainMenu-main",
  data: function () {
    return {
      count: 0,
      clockT: "",
      clockD: "",
      overWorkTime: undefined,
      ReveivePrinter: undefined,
      TicketPrinter: undefined,
      Details: undefined,
      Invoice: undefined,
      Ticket: undefined,
      Network: undefined,
      NetworkErrorCount: 0,
      startGoNext: false,
      showOriginalScreen: true, 
      showBlackScreen: false,  
      lastInteractionTime: new Date().getTime(), 
      inactiveTimeout: 10000, 
      isScreenBlack: false,  
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.goToNext("mainMenu");
      },
      handleTouch: function () {
          
        this.lastInteractionTime = new Date().getTime(); 
          this.isScreenBlack = false; 
        this.showOriginalScreen = true; 
      },
    goNext: function () {
      var vm = this;

      setTimeout(function () {
        kiosk.app.updateLoading(true);
        // 進入商品選擇頁前，檢查網路與印表機
        if (kiosk.BESync && kiosk.BESync.APIURL) {
          startCheck();
        } else {
          commonExt.getJson("BESync").then(function () {
            startCheck();
          });
        }
      }, 0);

        function startCheck() {
            if (testFlag.devicebypass) {
                goNextOrShowAlert();
            } else {
                vm.CheckConn()
                    .then(function (res) {
                        return vm.checkPrinter();
                    })
                    .catch(function (err) {
                        return vm.checkPrinter();
                    })
                    .then(function (res) {
                        goNextOrShowAlert();
                    });
            }
        //vm.CheckConn()
        //  .then(function (res) {
        //    return vm.checkPrinter();
        //  })
        //  .catch(function (err) {
        //    return vm.checkPrinter();
        //  })
        //  .then(function (res) {
        //    goNextOrShowAlert();           
        //  });
      }

      function goNextOrShowAlert() {
        if (vm.Network) {
          var html =
            "<div>" +
            (vm.ReveivePrinter ? vm.ReveivePrinter + "<br>" : "") +
            (vm.TicketPrinter ? vm.TicketPrinter + "<br>" : "") +
            (vm.Network ? vm.Network + "<br>" : "") +
            "</div>";
          showAlert({
            title: "暫停服務<br>Out of Service",
            html: html,
            type: "error",
            confirm: "確認",
            timer: 3000,
          });
          kiosk.app.updateLoading(false);
          vm.startGoNext = false;
        } else if (vm.ReveivePrinter || vm.TicketPrinter) {
          vm.checkIfGoMaintenance();
          kiosk.app.updateLoading(false);
          return;
        }
        // 是否蒐集國籍
        if (kiosk.status.recvCustomerInfo || testFlag.viewDebugger) {
          var count = 0;
          var lastObj = {};
          for (var i = 0; i < Country[kiosk.systemSetting.lang].length; i++) {
            count += Country[kiosk.systemSetting.lang][i].countrys.length;
            lastObj = Country[kiosk.systemSetting.lang][i].countrys[0];
          }
          if (count === 1) {
            kiosk.status.SelectInfo = lastObj;
            kiosk.API.goToNext("ProductChoice");
            return;
          }
          kiosk.API.goToNext("Country");
        } else {
          kiosk.status.SelectInfo = null;
          kiosk.API.goToNext("ProductChoice");
        }
      }
    },
    goAdmin: function () {
      var vm = this;
      vm.count++;
      if (vm.count >= 5) {
        kiosk.API.goToNext("adminVerify");
      }
    },
    changeLanguage: function (culture) {
      var vm = this;
      kiosk.API.changeCulture(culture);
      switch (culture) {
        case 1:
          kiosk.systemSetting.lang = "zh_TW";
          break;
        case 2:
          kiosk.systemSetting.lang = "en_US";
          break;
        case 3:
          kiosk.systemSetting.lang = "ja_JP";
          break;
        case 4:
          kiosk.systemSetting.lang = "ko_KR";
          break;
        case 5:
          kiosk.systemSetting.lang = "zh_CN";
          break;
      }
      vm.goNext();
    },
    clockFn: function () {
      var vm = this;
      var clock = moment();
      this.overWorkTime = false;
      var week = ["日", "一", "二", "三", "四", "五", "六"];
      this.clockT = clock.format("HH:mm");
      kiosk.status.clockT = clock.format("HH:mm");
      this.clockD =
        clock.format("YYYY-MM-DD") + " (" + week[clock.weekday()] + ")";
      kiosk.status.clockD =
        clock.format("YYYY-MM-DD") + " (" + week[clock.weekday()] + ")";

      // 判斷是否休息時間
      if (
        kiosk.systemSetting &&
        kiosk.systemSetting.openTime &&
        kiosk.systemSetting.closeTime
      ) {
        var openTime = moment(kiosk.systemSetting.openTime, "HH:mm");
        var closeTime = moment(kiosk.systemSetting.closeTime, "HH:mm");
        if (openTime.isValid() && closeTime.isValid()) {
          var result = !moment().isBetween(openTime, closeTime);
          this.overWorkTime = result;
          this.$forceUpdate();
        }
      }
    },
    checkPrinter: function () {
      var vm = this;
      return new Promise(function (resolve, reject) {
        checkPrinterStatus().then(function (res) {
          updateText();
          resolve();
        });

        function updateText() {
          if (!testFlag.viewDebugger) {
            switch (kiosk.app.deviceStatus.TICKETPRINTER) {
              case 0:
                vm.TicketPrinter =
                  kiosk.BESync.TicketPrinterName +
                  " 票券印表機-" +
                  kiosk.app.deviceStatus.TicketPrinter_errorType;
                break;

              case 1:
                vm.TicketPrinter = undefined;
                break;
            }

            switch (kiosk.app.deviceStatus.REVEIVEPRINTER) {
              case 0:
                vm.ReveivePrinter =
                  kiosk.BESync.ReveivePrinterName +
                  " 明細印表機-" +
                  kiosk.app.deviceStatus.ReveivePrinter_errorType;
                break;

              case 1:
                vm.ReveivePrinter = undefined;
                break;
            }
          } else {
            vm.TicketPrinter = undefined;
            vm.ReveivePrinter = undefined;
            // vm.TicketPrinter =
            //   kiosk.BESync.TicketPrinterName + " 票券印表機-連接異常";
            // vm.ReveivePrinter =
            //   kiosk.BESync.ReveivePrinterName + " 明細印表機-連接異常";
          }
        }
      });
    },
    checkSettle: function () {
      if (
        !kiosk.systemSetting.settleNext ||
        moment() > moment(kiosk.systemSetting.settleNext, "YYYY/MM/DD HH:mm:ss")
      ) {
        getNextOpeningHours();

        if (
          kiosk.status.weekDaySet &&
          kiosk.status.weekDaySet.WorkStatus &&
          kiosk.status.weekTimeSet.WorkTimeEnd
        ) {
          // Do not merge this conditional statement with the one above.
          if (kiosk.status.isWaitingSettle == false) {
            WriteLog(
              "自動結帳開始, kiosk.systemSetting.settleNext: " +
                kiosk.systemSetting.settleNext
            );
            kiosk.status.isWaitingSettle = true;
            kiosk.status.isSettleSuccess = true;
            TVMSettle()
              .catch(function (settleFailHostIdArr) {
                kiosk.status.isWaitingSettle = false;
                kiosk.status.isSettleSuccess = false;
                if (kiosk.systemSetting.settleFailTiming == "") {
                  kiosk.systemSetting.settleFailTiming = moment().format(
                    "YYYY/MM/DD HH:mm:ss"
                  );
                }

                WriteLog(
                  "自動結帳失敗, settleFailHostIdArr: " +
                    JSON.stringify(settleFailHostIdArr) +
                    ", 預計發通知時間: " +
                    moment(
                      kiosk.systemSetting.settleFailTiming,
                      "YYYY/MM/DD HH:mm:ss"
                    )
                      .add(15, "minutes")
                      .format("HH:mm:ss")
                );

                // 若結帳失敗且持續超過15分鐘，就發line通知，並更新下次結帳時間
                // (只更新settleNext，不更新settle)
                if (
                  kiosk.systemSetting.settleFailTiming != "" &&
                  moment() >
                    moment(
                      kiosk.systemSetting.settleFailTiming,
                      "YYYY/MM/DD HH:mm:ss"
                    ).add(15, "minutes")
                ) {
                  handleSettleNext();
                  var PayTypeNameArr = [];
                  var PayTypes = kiosk.BESync.PayTypes;

                  // 取得每個結帳失敗的金流名稱
                  settleFailHostIdArr.forEach(function (HostId) {
                    for (var i = 0; i < PayTypes.length; i++) {
                      var PayType = PayTypes[i];
                      var PayMachineParameter =
                        PayType.PayMachineParameter.split("@");

                      if (
                        PayMachineParameter.length == 2 &&
                        PayMachineParameter[1] === HostId
                      ) {
                        PayTypeNameArr.push(PayType.CorporationPayTypeName);
                        break;
                      }
                    }
                  });

                  function sendLineNotify(PayTypeName) {
                    return new Promise(function (resolve, reject) {
                      var NotifyText = PayTypeName + "-結帳失敗";
                      BackEnd.KioskNotify(NotifyText)
                        .then(function (res) {
                          resolve();
                        })
                        .catch(function (err) {
                          resolve();
                        });
                    });
                  }
                  function processArray(array) {
                    return array.reduce(function (promise, PayTypeName) {
                      return promise.then(function (res) {
                        return sendLineNotify(PayTypeName);
                      });
                    }, Promise.resolve());
                  }

                  // 照順序發LINE通知
                  if (PayTypeNameArr.length > 0) {
                    processArray(PayTypeNameArr).then(function (res) {
                      WriteLog(
                        "結帳異常line通知發送完畢, PayTypeNameArr: " +
                          JSON.stringify(PayTypeNameArr) +
                          ", kiosk.BESync.PayTypes: " +
                          JSON.stringify(kiosk.BESync.PayTypes)
                      );
                      kiosk.systemSetting.settleFailTiming = "";
                    });
                  }
                }
              })
              .then(function (res) {
                if (kiosk.status.isSettleSuccess) {
                  kiosk.status.isWaitingSettle = false;
                  kiosk.systemSetting.settleFailTiming = "";
                  kiosk.systemSetting.settle =
                    moment().format("YYYY/MM/DD HH:mm");
                  handleSettleNext();
                  vm.$forceUpdate();
                  return PalaceAPI.posCheckDevice("自動結帳完成");
                }
              })
              .then(function (res) {
                if (kiosk.status.isSettleSuccess) {
                  return updateSystemSettingDeviceInfo(res);
                }
              })
              .then(function (res) {
                if (kiosk.status.isSettleSuccess) {
                  WriteLog("自動結帳完成");
                  kiosk.app.updateLoading(false);
                }
              })
              .catch(function (err) {
                if (kiosk.status.isSettleSuccess) {
                  kiosk.app.updateLoading(false);
                  WriteLog("settle catch: " + JSON.stringify(err));
                }
              });
          }
        } else {
          handleSettleNext();
        }

        function handleSettleNext() {
          // 判斷結帳當下是否跟settleNext日期為同一天
          if (
            moment().format("YYYY/MM/DD") ===
            moment(kiosk.systemSetting.settleNext).format("YYYY/MM/DD")
          ) {
            // 若為同一天，則將下次結帳時間設為隔天結束營業後10分鐘
            var WorkTimeEnd = moment(
              kiosk.status.nextWeekTimeSet.WorkTimeEnd,
              "HH:mm"
            )
              .add(10, "minutes")
              .format("HH:mm");
            var nextTime = moment()
              .add(1, "day")
              .format("YYYY/MM/DD " + WorkTimeEnd + ":00");
          } else {
            // 若非同一天，則將下次結帳時間設為當天結束營業後10分鐘
            // (可能是很久沒開機，因此當天營業時間結束後要再結帳一次)
            var WorkTimeEnd = moment(
              kiosk.status.weekTimeSet.WorkTimeEnd,
              "HH:mm"
            )
              .add(10, "minutes")
              .format("HH:mm");
            var nextTime = moment().format("YYYY/MM/DD " + WorkTimeEnd + ":00");
          }
          kiosk.systemSetting.settleNext = nextTime;
          WriteLog(
            "kiosk.systemSetting: " + JSON.stringify(kiosk.systemSetting)
          );
          commonExt.setJson("systemSetting", kiosk.systemSetting);
        }
      }
    },
    CheckConn: function () {
      var vm = this;
      return new Promise(function (resolve, reject) {
        var isResExist = false;
        setTimeout(function () {
          if (isResExist) return;
          isResExist = true;
          handleError();
          reject();
        }, 10000);

        axios
          .get(kiosk.BESync.APIURL)
          .then(function (response) {
            if (isResExist) return;
            isResExist = true;
            if (response.status == "200") {
              vm.Network = undefined;
              vm.NetworkErrorCount = 0;
              // 若其他畫面需判斷時可用此全域變數控制
              // kiosk.app.deviceStatus.CONNECTSTATUS = true;
              resolve();
            } else {
              if (isError) return;
              isError = true;
              handleError();
              reject();
            }
          })
          .catch(function (error) {
            if (isResExist) return;
            isResExist = true;
            handleError();
            reject();
          });

        function handleError(error) {
          // 若其他畫面需判斷時可用此全域變數控制
          // kiosk.app.deviceStatus.CONNECTSTATUS = false;
          vm.Network = "網路異常";
          WriteLog("Network test Error");
          BackEnd.AddActionLog(
            "5",
            "Network test Error",
            JSON.stringify({
              member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
              app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
              action: "request_print",
              version: kiosk.BESync ? kiosk.BESync.Version : "",
            })
          );
        }
      });
    },
    CheckIfPrintFail: function () {
      var vm = this;
      // 先宣告異常提示文字的變數，若有異常則用kiosk.app.deviceStatus.InvoicefailText接住提示文字
      var DetailsfailText = "明細印製失敗";
      var InvoicefailText = "發票印製失敗";
      var TicketfailText = "票券印製失敗";

      // 根據全域變數kiosk.app.deviceStatus.InvoicefailText判斷是否曾進入首頁
      // 若從維護畫面離開再回首頁，就刪除異常提示文字

      // 明細-刪除異常提示文字
      if (
        kiosk.app.deviceStatus.DetailsfailText &&
        kiosk.app.deviceStatus.PRINTDETAILS === "0"
      ) {
        kiosk.app.deviceStatus.PRINTDETAILS = "1";
        kiosk.app.deviceStatus.DetailsfailText = undefined;
      }
      // 明細-印製失敗
      else if (
        !kiosk.app.deviceStatus.DetailsfailText &&
        kiosk.app.deviceStatus.PRINTDETAILS === "0"
      ) {
        kiosk.app.deviceStatus.DetailsfailText = DetailsfailText;
        BackEnd.AddActionLog(
          "4",
          "DetailsPrinting Error",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            action: "request_print",
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
      }
      // 明細-印製狀況正常
      else {
        kiosk.app.deviceStatus.PRINTDETAILS = "1";
        kiosk.app.deviceStatus.DetailsfailText = undefined;
      }
      // 更新畫面異常提示文字
      vm.Details = kiosk.app.deviceStatus.DetailsfailText;

      // 發票-刪除異常提示文字
      if (
        kiosk.app.deviceStatus.InvoicefailText &&
        kiosk.app.deviceStatus.PRINTINVOICE === "0"
      ) {
        kiosk.app.deviceStatus.PRINTINVOICE = "1";
        kiosk.app.deviceStatus.InvoicefailText = undefined;
      }
      // 發票-印製失敗
      else if (
        !kiosk.app.deviceStatus.InvoicefailText &&
        kiosk.app.deviceStatus.PRINTINVOICE === "0"
      ) {
        kiosk.app.deviceStatus.InvoicefailText = InvoicefailText;
        BackEnd.AddActionLog(
          "4",
          "InvoicePrinting Error",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            action: "request_print",
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
      }
      // 發票-印製狀況正常
      else {
        kiosk.app.deviceStatus.PRINTINVOICE = "1";
        kiosk.app.deviceStatus.InvoicefailText = undefined;
      }
      // 更新畫面異常提示文字
      vm.Invoice = kiosk.app.deviceStatus.InvoicefailText;

      // 票券-刪除異常提示文字
      if (
        kiosk.app.deviceStatus.TicketfailText &&
        kiosk.app.deviceStatus.PRINTTICKET === "0"
      ) {
        kiosk.app.deviceStatus.PRINTTICKET = "1";
        kiosk.app.deviceStatus.TicketfailText = undefined;
      }
      // 票券-印製失敗
      else if (
        !kiosk.app.deviceStatus.TicketfailText &&
        kiosk.app.deviceStatus.PRINTTICKET === "0"
      ) {
        kiosk.app.deviceStatus.TicketfailText = TicketfailText;
        BackEnd.AddActionLog(
          "4",
          "TicketPrinting Error",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            action: "request_print",
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
      }
      // 票券-印製狀況正常
      else {
        kiosk.app.deviceStatus.PRINTTICKET = "1";
        kiosk.app.deviceStatus.TicketfailText = undefined;
      }
      vm.Ticket = kiosk.app.deviceStatus.TicketfailText;
    },
    checkIfGoMaintenance: function () {
      var vm = this;
      if (
        vm.ReveivePrinter ||
        vm.TicketPrinter ||
        // vm.Network ||
        vm.Details ||
        vm.Invoice ||
        vm.Ticket ||
        kiosk.app.ManualMaintenance
      ) {
        vm.goMaintenance();
      } else {
        kiosk.systemSetting.Maintenance = false;
        commonExt.setJson("systemSetting", kiosk.systemSetting);
      }
      vm.$forceUpdate();
      return;
    },
    goMaintenance: function () {
      var vm = this;
      if (!testFlag.viewDebugger) {
        kiosk.systemSetting.Maintenance = true;
        commonExt.setJson("systemSetting", kiosk.systemSetting);
      } else {
        kiosk.systemSetting = {};
       kiosk.systemSetting.Maintenance = true;
      kiosk.systemSetting.IDle = true;
      }
      vm.$forceUpdate();
    },
  },
    created: function () {
     var vm = this;
      this.clockFn();
      //document.addEventListener("click", this.handleTouch);
      //document.addEventListener("keydown", this.handleTouch);

     
      //setInterval(function () {
      //    var currentTime = new Date().getTime();          
      //    var timeSinceLastInteraction = currentTime - vm.lastInteractionTime;
          
      //    if (timeSinceLastInteraction > vm.inactiveTimeout && !vm.isScreenBlack) {
      //        vm.isScreenBlack = true;
             
      //    }
      //}, 1000);
  },
  beforeDestroy: function () {
    clearInterval(this.clockTimer);
      clearInterval(this.checkSettleTimer);
      //document.removeEventListener("click", this.handleTouch);
      //document.removeEventListener("keydown", this.handleTouch);
  },
  mounted: function () {
      var vm = this;
    kiosk.posSaleProductListCategory = [];
    //debugger;
    kiosk.status.isSeatReservation = null;
    kiosk.status.seatAllocatedMode = null;
    if (kiosk.status.isWaitingSettle == null) {
      kiosk.status.isWaitingSettle = false;
    }

    if (!kiosk.CashBox) {
      kiosk.CashBox = {};
    }

    testFlag.viewDebugger = false;

    kiosk.status.beforeFirstTimeCheck = true;
    kiosk.app.ManualMaintenance
      ? (kiosk.app.ManualMaintenance = true)
      : (kiosk.app.ManualMaintenance = false);

    // 檢查是否進入首頁時就已經有連線問題
    if (kiosk.BESync && kiosk.BESync.APIURL) {
      axios
        .get(kiosk.BESync.APIURL)
        .then(function (response) {
          if (response.status == "200") {
            vm.Network = undefined;
            vm.NetworkErrorCount = 0;
          } else {
            vm.NetworkErrorCount = 3;
          }
        })
        .catch(function (error) {
          vm.NetworkErrorCount = 3;
        });
    }

    this.clockTimer = setInterval(this.clockFn, 1000);
    this.checkSettleTimer = setInterval(this.checkSettle, 60000);

    this.$nextTick(function () {
      if (!testFlag.viewDebugger) {
        kiosk.app.updateLoading(true);
        commonExt
          .getJson("KMSSetting")
          .then(function (res) {
            return commonExt.getJson("BESync");
          })
          .then(function (res) {
            kiosk.status.recvCustomerInfo = res.IsCollectNationalInfo == 1;
            kiosk.status.TicketTemplates = res.TicketTemplates;
            WriteLog(
              "取得票種:" + JSON.stringify(kiosk.status.TicketTemplates)
            );
            return commonExt.getJson("systemSetting");
          })
          .then(function (res) {
            return PalaceAPI.posCheckDevice();
          })
          .then(function (res) {
            getOpeningHours();
            return updateSystemSettingDeviceInfo(res);
          })
          .then(function (res) {
            if (kiosk.systemSetting.useICTCash) {
              if (
                !kiosk.CashBox.cc1_stock_now ||
                !kiosk.CashBox.cc5_stock_now ||
                !kiosk.CashBox.cc10_stock_now ||
                !kiosk.CashBox.cc50_stock_now
                // || !kiosk.CashBox.nd_stock_now
              ) {
                kiosk.CashBox.cc1_stock_now = "載入中";
                kiosk.CashBox.cc5_stock_now = "載入中";
                kiosk.CashBox.cc10_stock_now = "載入中";
                kiosk.CashBox.cc50_stock_now = "載入中";
                // kiosk.CashBox.nd_stock_now = "載入中";
              }
              checkCashBox();
            } else {
              // 若此機台沒裝ICTCash現金模組則阻擋現金付款
              kiosk.app.deviceStatus.CASHBOX = 0;
              }
              if (testFlag.devicebypass) {
                  kiosk.app.updateLoading(false);
                  return;
              }
            vm.checkSettle();
            vm.CheckIfPrintFail();
            vm.checkPrinter()
              .then(function (res) {
                kiosk.app.updateLoading(false);
                vm.checkIfGoMaintenance();
              })
              .catch(function (err) {
                kiosk.app.updateLoading(false);
                vm.checkIfGoMaintenance();
              });
                
          })
          .catch(function (errMsg) {
            kiosk.app.updateLoading(false);
            switch (errMsg) {
              case "網路連線異常":
                showAlert({
                  title: "暫停服務<br>Out of Service",
                  type: "error",
                  text: errMsg,
                  confirm: "確認",
                  timer: 3000,
                });
                break;

              default:
                showAlert({
                  title: errMsg,
                  type: "error",
                  timer: 3000,
                  timerFn: function () {
                    kiosk.API.idle.GoHome();
                  },
                });
                break;
            }
          });
      } else {
        kiosk.systemSetting = {
          MainSerialNo: "000265",
          useFakeData: false,
          account: "bonjay",
          password: "bonjay123",
          apiPath: "test-admin.fonticket.com",
          apiBackEnd: "http://218.32.44.153/FontripTicketingWeb/api/",
          SHA256Key: "987458963215",
          ThermalPrintName: "TM-T70IIMU",
          ThermalPrintTemplate: "ticket",
          TicketPrint: "TSC247",
          Maintenance: false,
          MaintenanceMessage1: "系統維護中",
          MaintenanceMessage2: "暫停提供服務",
          StoreId: "A12345678901234567",
          KioskNo: "T01",
          appVersion: "1.0",
          os: "WINDOWS",
          appName: "FLYTECH_TVM",
          latitude: 24.25,
          clientIp: "25.102350",
          lang: "en_US",
          deviceCode: "MD60995076",
          longitude: 121.548432,
          accessToken: "02cAgrqvuTp0b3OG7Bae9bCA7Rn9xS",
          deviceName: "邦捷TVM測試機1",
        };
        BackEnd.GetBasicData("as")
          .then(function (res) {
            kiosk.status.recvCustomerInfo = res.IsCollectNationalInfo == 1;
            res.LastTime = moment();
            kiosk.BESync = res;
          })
          .catch(function (err) {});
      }
    });
  },
});
