// MainPage
Vue.component("component-Payment-main", {
  props: ["model"],
  template: "#template-Payment-main",
  data: function () {
    return {
      printmodeMsg: "",
      orderList: kiosk.status.orderList,
      orderListSerial: kiosk.status.posCreatePayment.payment.paymentNumber,
      payName: kiosk.status.posPayType.CorporationPayTypeName,
      subTotalCash: kiosk.status.ticketTotalAmt,
      readerResJSON: undefined, // LINE PAY交易時， posEnablePayment不能有transactionData欄位，因此readerResJSON初始值必須為undefined，不能為null
      // N -> 信用卡機
      // E -> 悠遊卡機
      showImgType: "E",
      createTime: moment(),
      timer: null,
      timer2: null,
      showTime: "",
      limit: 300000,
      readerUITimeoutSec: 70000,
      fontPayProc: false,
      keyBoardValue: "",
      viewType: "C",
      cancelTime: "00:03",
      hideCancelSec: 0,
      IsShowCancelBtn: true,
      IsShowConfirmAlert: false,
      IsPaymentCanceled: false,
      IsGoNext: false,
      IsWaitingPayment: false,
      payTypeAction: kiosk.status.posPayType.PayTypeAction,
      payType: "",
      idleSecond: 75,
      IsCTBCECCfail: false,
    };
  },
  methods: {
    goHome: function () {
      kiosk.API.initStatus();
      kiosk.API.goToNext("mainMenu");
    },
    //取代idleTimmer
    idleGoHome: function () {
      var vm = this;
      kiosk.app.updateLoading(true);
      PalaceAPI.posCancelPayment(
        kiosk.status.posCreatePayment.payment.paymentId
      );
      setTimeout(function () {
        kiosk.API.idle.GoHome();
      }, 2000);
    },
    //取代kiosk.API.idle.ResetTimmer()
    resetIdle: function () {
      var vm = this;
      if (vm.idleTimmer != null) clearInterval(vm.idleTimmer);
      // var idlesecond = parseInt(kiosk.API.idle.getIdleSeconds());
      // if (idlesecond == NaN || idlesecond == 0) {
      //   idlesecond = 60;
      // }
      vm.idleTimmer = setInterval(vm.idleGoHome, vm.idleSecond * 1000);
    },
    posCancelPayment: function () {
      var vm = this;
      vm.resetIdle();
      PalaceAPI.posCancelPayment(
        kiosk.status.posCreatePayment.payment.paymentId
      );
    },
    goNext: function () {
      var vm = this;
      if (vm.IsGoNext) return;
      vm.IsGoNext = true;
      vm.resetIdle();

      kiosk.app.updateLoading(true);
      PalaceAPI.posEnablePayment(
        kiosk.status.posCreatePayment.payment.paymentId,
        vm.readerResJSON,
        kiosk.status.posPayTypeCode
      )
        .then(function (res) {
          kiosk.status.posEnablePayment = res.payment;

          // Sqlite 更新交易資料 START -----------
          if (!testFlag.viewDebugger) {
            _localTrans = {
              orderNo: res.payment.paymentNumber,
              orderPrice: res.payment.subtotal,
              orderPaymentType: res.payment.paymentSettingList[0].name,
              payTime: moment().format("YYYY-MM-DD HH:mm:ss"),
              isPay: true,
              username: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            };
            External.TicketingServiceBizExt.TicketingService.updateLocalTrans(
              JSON.stringify(_localTrans),
              function (res) {}
            );
          }
          // Sqlite 更新交易資料 E N D -----------
          kiosk.app.updateLoading(false);
          kiosk.API.goToNext("PaySuccess");
        })
        .catch(function (errMsg) {
          kiosk.app.updateLoading(false);
          // 3047 行動支付付款失敗
          if (
            kiosk.status.APIresponse.posEnablePayment &&
            kiosk.status.APIresponse.posEnablePayment.errorCode &&
            kiosk.status.APIresponse.posEnablePayment.errorCode == 3047
          ) {
            vm.showRetryAlert(
              errMsg,
              function () {
                vm.IsGoNext = false;
              },
              function () {}
            );
          } else {
            vm.posCancelPayment();
            showAlert({
              title: errMsg,
              type: "error",
              confirm: "確認",
              confirmFn: function () {
                vm.goHome();
              },
            });
          }
        });
    },
    updatePaymentUI: function () {
      var vm = this;
      var PayTypeAction = vm.payTypeAction,
        PayType = vm.payType,
        isGoPayment = true,
        isUpdateUITime = false;

      switch (PayType) {
        case "Cash":
          vm.viewType = "A";
          vm.showImgType = "C";
          // -----保留POS現金收款的開錢櫃function-----
          // try {
          //   if (parseInt(vm.PettyCash) != 0) {
          //     OpenDrawer(kiosk.BESync.ReveivePrinterName);
          //   }
          // } catch (e) {}
          // -----保留POS現金收款的開錢櫃function-----
          break;

        case "Offline":
          vm.viewType = "A";
          vm.showImgType = "C";
          break;

        case "Free":
          vm.viewType = "A";
          break;

        case "Fonpay":
          vm.viewType = "C";
          vm.fontPayProc = false;
          vm.limit = 30000;
          isUpdateUITime = true;
          kiosk.status.scanData = "";
          this.$nextTick(function () {
            function autofocus() {
              if (kiosk.currentModelKey === "Payment") {
                $("#scanner").focus();
                setTimeout(autofocus, 3000);
              }
            }
            autofocus();
          });
          isGoPayment = false;
          break;

        case "ICTCash":
          vm.viewType = "D";
          vm.limit = 40000;
          isUpdateUITime = true;
          vm.hideCancelSec = 10000;
          // 歸零找錢金額
          kiosk.status.changeAmt = 0;
          // 歸零已付金額
          kiosk.status.cashPaid = 0;
          // 歸零待繳金額
          kiosk.status.expectedCash = kiosk.status.ticketTotalAmt;
          break;

        case "CreditCard":
          vm.viewType = "B";
          vm.showImgType =
            kiosk.status.posPayType.PayMachineParameter.split("@")[0];

          switch (PayTypeAction) {
            case "CTBC":
              switch (vm.showImgType) {
                case "01":
                  // 01 -> 信用卡機
                  vm.limit = 25000;
                  vm.showImgType = "N";
                  break;

                case "21":
                  // 21 -> 悠遊卡機
                  vm.limit = 25000;
                  vm.showImgType = "E";
                  break;

                default:
                  vm.limit = 25000;
                  break;
              }
              break;

            default:
              switch (vm.showImgType) {
                case "N":
                  // N -> 信用卡機
                  vm.limit = 25000;
                  break;

                case "E":
                  // E -> 悠遊卡機
                  vm.limit = 25000;
                  break;

                default:
                  vm.limit = 25000;
                  break;
              }
              break;
          }
          isUpdateUITime = true;
          break;

        default:
          isGoPayment = false;
          break;
      }
      if (isUpdateUITime) {
        vm.showTime = moment(vm.limit).format("mm:ss");
      }
      if (isGoPayment) {
        vm.goPayment();
      }
    },
    goPayment: function () {
      var vm = this;
      if (vm.IsWaitingPayment) {
        return;
      }
      vm.IsWaitingPayment = true;

      var PayTypeAction = vm.payTypeAction;
      var PayType = vm.payType;

      var handlePayment = {
        Offline: function (PayType) {
          try {
            var vm2 = vm;
            if (PayType !== "Offline") {
              kiosk.app.updateLoading(true);
              vm2.disabled = false;
              vm2.readerResJSON = {};
              vm2.goNext();
            } else {
              var money = parseInt(vm2.keyBoardValue);
              if (money >= vm2.subTotalCash) {
                kiosk.app.updateLoading(true);
                vm2.disabled = false;
                vm2.readerResJSON = {};
                vm2.goNext();
              } else {
                showAlert({
                  title: "請確認金額!",
                  type: "info",
                  confirm: "確認",
                });
              }
            }
          } catch (e) {
            var vm2 = vm;
            WriteLog("goPayment error : " + JSON.stringify(e));
            vm2.disabled = false;
            showAlert({
              title: e,
              type: "error",
              confirm: "確認",
              confirmFn: function () {
                vm2.goHome();
              },
            });
          }
        },
        ICTCash: function () {
          try {
            var vm2 = vm;
            if (
              kiosk.app.deviceStatus.CASHBOX === 1 &&
              !kiosk.app.deviceStatus.CASHBOXERROR
            ) {
              if (vm2.IsPaymentCanceled) return vm2.PaymentError();
              customLibDevice.CashBox.begPayment(kiosk.status.ticketTotalAmt)
                .then(function (res) {
                  // 確保回傳資料格式正確，也避免產生JS錯誤
                  // 曾出現paymentStatus().then後，某些key存取不到的狀況(如：transactionStep)
                  var IfSuccess = false;
                  try {
                    if (typeof JSON.parse(res.resultJson) === "object") {
                      IfSuccess = true;
                    }
                  } catch (error) {
                    IfSuccess = false;
                    return;
                  }

                  if (IfSuccess && res.IsSuccess) {
                    // 持續檢查投幣狀況
                    vm2.startCheckCash();
                    return;
                  } else {
                    WriteLog(
                      "goPayment - begPayment error：" + JSON.stringify(res)
                    );
                    vm2.PaymentCancel("PaymentError");
                    return;
                  }
                })
                .catch(function (err) {
                  WriteLog(
                    "goPayment - begPayment error：" + JSON.stringify(err)
                  );
                  vm2.PaymentError();
                });
            }
            // 若任一裝置 連線/機器狀態異常
            else {
              WriteLog("goPaymentCASHBOX deviceError");
              showAlert({
                title: vm.model.PaymentMaintenanceText,
                type: "error",
                confirm: "確認",
                confirmFn: function (res) {
                  vm.goHome();
                },
              });
            }
          } catch (e) {
            var vm2 = vm;
            WriteLog("goPayment error : " + JSON.stringify(e));
            vm2.disabled = false;
            showAlert({
              title: e,
              type: "error",
              confirm: "確認",
              confirmFn: function () {
                vm2.goHome();
              },
            });
          }
        },
        CreditCardSuccess: function (res, PayTypeAction, IfPrintReceipt) {
          vm.readerResJSON = convertReaderRes(res, PayTypeAction);
          if (IfPrintReceipt) {
            vm.printReceipt(res);
          }
          vm.goNext();
        },
        CreditCardFail: function () {
          vm.IsShowConfirmAlert = false;
          vm.PaymentError();
        },
      };

      switch (PayType) {
        case "Offline":
          handlePayment.Offline(PayType);
          break;

        case "Free":
          handlePayment.Offline(PayType);
          break;

        case "ICTCash":
          handlePayment.ICTCash();
          break;

        case "CreditCard":
          var PayMachineParameter =
            kiosk.status.posPayType.PayMachineParameter.split("@");

          switch (PayTypeAction) {
            case "NCCC":
              vm.readerStr = "刷卡中請稍候";

              customLibDevice.FIN.NCCCPayment(
                PayMachineParameter[0],
                this.subTotalCash,
                moment().format("YYMMDD"),
                moment().format("HHmmss")
              )
                .then(function (res) {
                  handlePayment.CreditCardSuccess(
                    JSON.parse(res.resultJson),
                    PayTypeAction,
                    false
                  );
                })
                .catch(function (err) {
                  handlePayment.CreditCardFail();
                });
              break;

            case "CTBC":
              customLibDevice.FIN.CTBCPayment(
                PayMachineParameter[0],
                PayMachineParameter[1],
                this.subTotalCash
              )
                .then(function (res) {
                  handlePayment.CreditCardSuccess(
                    JSON.parse(res.resultJson),
                    PayTypeAction,
                    true
                  );
                })
                .catch(function (err) {
                  if (
                    PayMachineParameter[0] === "21" &&
                    PayMachineParameter[1] === "21"
                  ) {
                    vm.IsCTBCECCfail = true;
                    vm.ShowReaderConfirmAlert(
                      vm.IsCTBCECCfail,
                      handlePayment.CreditCardFail
                    );
                  } else {
                    handlePayment.CreditCardFail();
                  }
                });
              break;

            case "SINOPAC":
              customLibDevice.FIN.SINOPACPayment(
                PayMachineParameter[0],
                this.subTotalCash
              )
                .then(function (res) {
                  handlePayment.CreditCardSuccess(res, PayTypeAction, true);
                })
                .catch(function (err) {
                  handlePayment.CreditCardFail();
                });
              break;

            case "TAISHIN":
              customLibDevice.FIN.TAISHINPayment(
                PayMachineParameter[0],
                PayMachineParameter[1],
                this.subTotalCash,
                kiosk.status.posCreatePayment.payment.paymentNumber
              )
                .then(function (res) {
                  handlePayment.CreditCardSuccess(res, PayTypeAction, true);
                })
                .catch(function (err) {
                  handlePayment.CreditCardFail();
                });
              break;
		     case "TCB":
				WriteLog("call customLibDevice.FIN.TCBPayment:"+JSON.stringify({PayMachineParameter:PayMachineParameter,totalPrice:vm.totalPrice}));
				 customLibDevice.FIN.TCBPayment(
					 PayMachineParameter[0],
					 PayMachineParameter[1],
					 this.subTotalCash
				 )
					 .then(function (res) {
						  handlePayment.CreditCardSuccess(res, PayTypeAction, true);
					 })
					 .catch(function (err) {
						  handlePayment.CreditCardFail();
					 });
				 break;
			default:
				WriteLog("不支援的信用卡機["+PayTypeAction+"]");
				alert("不支援的信用卡機["+PayTypeAction+"]")
				 vm.PaymentError();
				 break;
          }
          break;

        default:
          vm.PaymentError();
          break;
      }
    },
    startCheckCash: function () {
      var vm = this;
      var StatusRetry = 0;

      checkCash();

      function checkCash() {
        // 開始檢查付款狀況
        kiosk.status.checkingCash = true;

        if (kiosk.currentModelKey !== "Payment" || vm.IsPaymentCanceled) {
          kiosk.status.checkingCash = false;
          return;
        }

        function handleStatusRetry(res) {
          setTimeout(function () {
            StatusRetry++;
            kiosk.status.checkingCash = false;

            if (StatusRetry < 5) {
              WriteLog("handleStatusRetry:" + StatusRetry);
              setTimeout(function () {
                checkCash();
              }, 200);
            } else {
              WriteLog(
                "startCheckCash - checkCash - paymentStatus error:" + res
              );
              vm.PaymentCancel("PaymentError");
            }
            return;
          }, 200);
        }

        function keepChecking() {
          kiosk.status.checkingCash = false;
          setTimeout(function () {
            checkCash();
          }, 200);
        }

        customLibDevice.CashBox.paymentStatus()
          .then(function (res) {
            // WriteLog("startCheckCash - checkCash - paymentStatus then:" + JSON.stringify(res));

            // 檢查paymentStatus回傳資料格式
            // 確保回傳資料格式正確，也避免產生JS錯誤
            var IfSuccess = false;
            try {
              if (typeof JSON.parse(res.resultJson) === "object") {
                IfSuccess = true;
              }
            } catch (err) {
              // 回傳資料格式錯誤
              IfSuccess = false;
              handleStatusRetry(JSON.stringify(res));
              return;
            }

            // 此宣告要寫在try catch之後，避免回傳資料非物件時產生JS錯誤
            var CashData = JSON.parse(res.resultJson);

            // 回傳資料格式正確 且 IsSuccess true
            if (
              IfSuccess &&
              res.IsSuccess &&
              CashData.returnValue !== 3 &&
              kiosk.currentModelKey === "Payment"
            ) {
              // 投入新的現金
              if (
                // (仍在交易中 或 此次投幣後剛好完成交易)
                (CashData.transactionStep === 2 ||
                  CashData.transactionStep === 5) &&
                CashData.changeTotal !== 0 &&
                CashData.changeTotal !== kiosk.status.cashPaid
              ) {
                // 更新已繳金額
                kiosk.status.cashPaid = CashData.changeTotal;

                // 更新待繳金額
                if (
                  !isNaN(kiosk.status.ticketTotalAmt - CashData.changeTotal)
                ) {
                  var newExpectedCash =
                    kiosk.status.ticketTotalAmt - CashData.changeTotal;
                  // 若需找錢，則待繳金額歸零
                  if (newExpectedCash < 0) {
                    kiosk.status.expectedCash = 0;
                  } else {
                    kiosk.status.expectedCash = newExpectedCash;
                  }
                }
                // 待繳金額是NaN，不更新待繳金額
                else {
                  handleStatusRetry(JSON.stringify(res));
                  return;
                }

                // 更新付款倒數(根據已繳金額判斷是否完成付款，因此要先更新已繳金額)
                vm.resetTimer(40000);

                // 收款後已完成交易
                // (收款後會先進入 0-自我偵測 狀態)
                // 交易狀態：5-交易完成, returnValue：0-作業正常結束, issueCode：1-不須找零, issueCode：2-找零正確
                // 不確定以下狀態是否為金額異常(待確認)
                // (CashData.transactionStep === 5 && CashData.returnValue === 3 && CashData.issueCode === 24)
                if (
                  CashData.transactionStep === 5 &&
                  CashData.returnValue === 0
                ) {
                  if (CashData.issueCode !== 1 && CashData.issueCode !== 2) {
                    WriteLog(
                      "startCheckCash - checkCash - paymentStatus error:" +
                        JSON.stringify(res)
                    );
                  }

                  // 若沒有JSON.stringify，vue的v-if會抓不到
                  kiosk.status.changeAmt = JSON.stringify(CashData.changeAmt);

                  BackEnd.AddActionLog(
                    "3",
                    "現金付款-完成交易",
                    JSON.stringify({
                      member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
                      app: kiosk.systemSetting
                        ? kiosk.systemSetting.appName
                        : "",
                      version: kiosk.BESync ? kiosk.BESync.Version : "",
                      payable: kiosk.status.ticketTotalAmt
                        ? kiosk.status.ticketTotalAmt
                        : "",
                      paid: kiosk.status.cashPaid ? kiosk.status.cashPaid : "",
                      isSuccess: "Y",
                    })
                  );

                  kiosk.status.checkingCash = false;
                  setTimeout(function () {
                    vm.goNext();
                  }, 1000);
                  return;
                }
                // 收款後尚未完成交易，繼續檢查
                else {
                  keepChecking();
                  return;
                }
              }
              // // 交易中硬體異常(如 rejectStatus_obj:2-卡鈔)
              // 尚未投幣
              else {
                keepChecking();
                return;
              }
            }
            // 回傳資料格式正確 但已不在付款頁面
            else if (kiosk.currentModelKey !== "Payment") {
              kiosk.status.checkingCash = false;
              return;
            }
            // 回傳資料格式正確 但 IsSuccess false
            else {
              handleStatusRetry(JSON.stringify(res));
              return;
            }
          })
          .catch(function (err) {
            handleStatusRetry(JSON.stringify(err));
            return;
          });
      }
    },
    scanKeyDown: function (event) {
      var vm = this;
      var e = event;
      if (
        !kiosk.status.posPayType.PayTypeAction.startsWith("Fonpay") ||
        kiosk.currentModelKey !== "Payment" ||
        vm.fontPayProc === true
      ) {
        return;
      }
      // WriteLog(e.keyCode);
      switch (e.keyCode) {
        case 13:
          vm.fontPayProc = true;
          setTimeout(function () {
            kiosk.status.mobilePayToken = vm.keyBoardValue;
            vm.goNext();
          }, 100);
          break;
        default:
          console.log(e.keyCode);
          // if ((e.keyCode >= 48 && e.keyCode <= 57) ||
          //     (e.keyCode >= 65 && e.keyCode <= 90)
          // ) {
          vm.keyBoardValue += e.char;
          // console.log('OK' + e.keyCode)
          // }
          break;
      }
    },
    printReceipt: function (obj) {
      var printObj = {
        CorporationName:
          kiosk.BESync && kiosk.BESync.CorporationName
            ? kiosk.BESync.CorporationName
            : "",
      };
      if (kiosk.status.posPayType.PayTypeAction == "CTBC") {
        switch (obj.host_id) {
          case "01":
            printObj.card_type = "信用卡";
            printObj.ref_no = obj.ref_no;
            if (!isNaN(parseInt(obj.amount1))) {
              printObj.trans_amt = (parseInt(obj.amount1) / 100).toString();
            }
            break;
          case "21":
            printObj.card_type = "悠遊卡";
            printObj.ref_no = obj.esvc_rrn_sn;
            if (!isNaN(parseInt(obj.amount1))) {
              printObj.balance_before = (
                parseInt(obj.amount1) / 100
              ).toString();
            }
            if (!isNaN(parseInt(obj.trans_amt))) {
              printObj.trans_amt = (parseInt(obj.trans_amt) / 100).toString();
            }
            if (!isNaN(parseInt(obj.esvc_autoLoad_amt))) {
              printObj.autoload_amt = (
                parseInt(obj.esvc_autoLoad_amt) / 100
              ).toString();
            }
            if (!isNaN(parseInt(obj.amount2))) {
              printObj.balance_after = (parseInt(obj.amount2) / 100).toString();
            }
            break;
        }
        printObj.store_type = obj.store_id;
        printObj.terminal = obj.terminal_id;
        printObj.card_no = obj.card_no;
        if (obj.approval_code.trim().length !== 0) {
          printObj.approval_code = obj.approval_code;
        }
        printObj.trans_date = moment("20" + obj.trans_date, "YYYYMMDD").format(
          "YYYY/MM/DD"
        );
        printObj.trans_time = moment(obj.trans_time, "HHmmSS").format(
          "HH:mm:SS"
        );
        printObj.invoice_no = obj.invoice_no;
        printObj.print_time = moment().format("YYYY/MM/DD HH:mm:SS");
      } else {
        if (kiosk.status.posPayType.PayTypeAction == "TAISHIN") {
          switch (obj.Trans_Type) {
            // Card_Type
            case "01":
              switch (obj.Card_Type) {
                case "VS": // VISA
                  printObj.card_type = "VISA";
                  break;
                case "MC": // MASTER
                  printObj.card_type = "MASTER";
                  break;
                case "JB": // JCB
                  printObj.card_type = "JCB";
                  break;
                case "UC": // U_CARD
                  printObj.card_type = "U_CARD";
                  break;
                case "DN": // DINER
                  printObj.card_type = "DINER";
                  break;
                case "UP": // CUP
                  printObj.card_type = "CUP";
                  break;
              }
              printObj.merchant_id = obj.TerminalID;
              printObj.terminal = obj.TerminalID;
              printObj.card_no = obj.Card_No;
              printObj.approval_code = obj.Approval_No;
              printObj.trans_date = moment(
                "20" + obj.Trans_Date,
                "YYYYMMDD"
              ).format("YYYY/MM/DD");
              printObj.trans_time = moment(obj.Trans_Time, "HHmmSS").format(
                "HH:mm:SS"
              );
              printObj.ref_no = obj.Reference_No;
              printObj.invoice_no = obj.Receipt_No;
              printObj.trans_amt = (
                parseInt(obj.Trans_Amount) / 100
              ).toString();
              break;
            case "71":
              // 悠遊卡
              switch (obj.Card_Type) {
                case "10": // EasyCard
                  printObj.card_type = "悠遊卡";
                  break;
                case "11": // iPASS
                  printObj.card_type = "一卡通";
                  break;
              }
              printObj.terminal = obj.New_Device_ID;
              printObj.card_no = obj.Card_No;
              // printObj.approval_code = obj.ApprovalNo
              printObj.trans_date = moment(
                "20" + obj.Trans_Date,
                "YYYYMMDD"
              ).format("YYYY/MM/DD");
              printObj.trans_time = moment(obj.Trans_Time, "HHmmSS").format(
                "HH:mm:SS"
              );
              printObj.ref_no = obj.Reference_No;
              // printObj.invoice_no = obj.InvoiceNo; // 台新電子票證無此欄位
              printObj.balance_before = (
                parseInt(obj.Before_Trans_Amount) / 100
              ).toString();
              printObj.autoload_amt = (
                parseInt(obj.AutoLoad_Amount) / 100
              ).toString();
              printObj.trans_amt = (
                parseInt(obj.Trans_Amount) / 100
              ).toString();
              printObj.balance_after = (
                parseInt(obj.After_Trans_Amount) / 100
              ).toString();
              break;
          }
        } else {
          switch (obj.TransType) {
            case "01":
              // 信用卡
              switch (obj.CardType) {
                case "1": // VISA
                  printObj.card_type = "VISA";
                  break;
                case "2": // MASTER
                  printObj.card_type = "MASTER";
                  break;
                case "3": // JCB
                  printObj.card_type = "JCB";
                  break;
                case "4": // U_CARD
                  printObj.card_type = "U_CARD";
                  break;
                case "5": // DINER
                  printObj.card_type = "DINER";
                  break;
                case "6": // AE
                  printObj.card_type = "AR";
                  break;
                case "7": // SMART CARD
                  printObj.card_type = "SMART CARD";
                  break;
                case "8": // CUP
                  printObj.card_type = "CUP";
                  break;
              }
              printObj.merchant_id = obj.TerminalID;
              printObj.terminal = obj.TerminalID;
              printObj.card_no = obj.CardNo;
              printObj.approval_code = obj.ApprovalNo;
              printObj.trans_date = moment(
                "20" + obj.TransDate,
                "YYYYMMDD"
              ).format("YYYY/MM/DD");
              printObj.trans_time = moment(obj.TransTime, "HHmmSS").format(
                "HH:mm:SS"
              );
              printObj.ref_no = obj.ReferenceNo;
              printObj.invoice_no = obj.InvoiceNo;
              printObj.trans_amt = (parseInt(obj.TransAmount) / 100).toString();
              break;
            case "71":
              // 悠遊卡
              switch (obj.TicketType) {
                case "1": // EasyCard
                  printObj.card_type = "悠遊卡";
                  break;
                case "2": // iCash
                  printObj.card_type = "愛金卡";
                  break;
                case "3": // iPASS
                  printObj.card_type = "一卡通";
                  break;
              }
              printObj.terminal = obj.EasyCardNewDeviceID;
              printObj.card_no = obj.EasyCardNo;
              // printObj.approval_code = obj.ApprovalNo
              printObj.trans_date = moment(
                "20" + obj.TransDate,
                "YYYYMMDD"
              ).format("YYYY/MM/DD");
              printObj.trans_time = moment(obj.TransTime, "HHmmSS").format(
                "HH:mm:SS"
              );
              printObj.ref_no = obj.Reference_No;
              printObj.invoice_no = obj.InvoiceNo;
              printObj.balance_before = (
                parseInt(obj.Balance_Amount_Before) / 100
              ).toString();
              printObj.autoload_amt = (
                parseInt(obj.Autoload_Amount) / 100
              ).toString();
              printObj.trans_amt = (parseInt(obj.TransAmount) / 100).toString();
              printObj.balance_after = (
                parseInt(obj.Balance_Amount) / 100
              ).toString();
              break;
          }
        }
        printObj.print_time = moment().format("YYYY/MM/DD HH:mm:SS");
      }
      printObj.bank_name = kiosk.status.posPayType.PayBankName;

      customLibDevice.Thermal.Print(
        kiosk.BESync.ReveivePrinterName,
        "CreditCardReceipt-Fossil",
        printObj
      )
        .then(function (res) {
          // 若印製失敗仍會回傳true，待更新二次檢查
          return res;
        })
        .catch(function (res) {
          WriteLog("printReceipt FAIL:" + JSON.stringify(res));
          return "列印失敗";
        });
    },
    byPass: function () {
      if (testFlag.viewDebugger) {
        this.goNext();
        return;
      }
    },
    timerFn: function () {
      var vm = this;
      var PayType = vm.payType;
      var countDownSec = vm.limit - (moment() - vm.createTime) + 1000;
      var readerUITimeout = vm.readerUITimeoutSec - (moment() - vm.createTime);
      if (kiosk.currentModelKey != "Payment") return;
      if (vm.IsGoNext) return;

      var idleSeconds = parseInt(kiosk.API.idle.getIdleSeconds()) * 1000;
      if (
        (vm.limit > idleSeconds - 10000 ||
          (PayType === "CreditCard" &&
            vm.readerUITimeoutSec > idleSeconds - 10000)) &&
        countDownSec > idleSeconds - 10000
      ) {
        vm.resetIdle();
      }

      if (
        PayType === "ICTCash" &&
        countDownSec < vm.hideCancelSec + 1000 &&
        vm.IsShowCancelBtn
      ) {
        vm.IsShowCancelBtn = false;
      }

      if (vm.IsPaymentCanceled) {
        if (!vm.showTime) vm.showTime = "00:00";
        if (vm.timer != null) clearInterval(vm.timer);
        return;
      }

      if ((countDownSec <= 0 && !vm.IsPaymentCanceled) || vm.IsCTBCECCfail) {
        if (!vm.IsCTBCECCfail) {
          vm.showTime = "00:00";
        }

        switch (PayType) {
          case "CreditCard":
            if (!vm.IsCTBCECCfail) {
              vm.ShowReaderConfirmAlert();
            }
            if (readerUITimeout <= 0) {
              if (vm.IsGoNext) return;
              swal.close();
              vm.IsShowConfirmAlert = false;
              vm.showRetryAlert(
                vm.model.OverTime,
                function () {},
                function () {}
              );
            }
            break;

          case "ICTCash":
            vm.checkCashCancel(function () {
              swal.close();
              if (vm.IsGoNext) return;
              kiosk.CashBox.cancelType = "autocancel";
              showAlert({
                // title: '已超出時間',
                title: vm.model.OverTime,
                type: "error",
              });
              vm.ICTCashCancel()
                .then(function (res) {
                  vm.posCancelPayment();
                  vm.goHome();
                })
                .catch(function (err) {
                  swal.close();
                  vm.PaymentError();
                });
            });
            break;

          default:
            if (!swal.isVisible()) {
              if (!vm.fontPayProc) {
                if (vm.IsGoNext) return;
                vm.showRetryAlert(
                  vm.model.OverTime,
                  function () {},
                  function () {}
                );
              }
            }
            break;
        }
        return;
      } else {
        vm.showTime = moment(countDownSec).format("mm:ss");
      }
    },
    ShowReaderConfirmAlert: function (IsCTBCECCfail, fail) {
      var vm = this;
      if (!vm.IsShowConfirmAlert) {
        vm.IsShowConfirmAlert = true;
        var createTime = moment();
        var limit = 15000;
        var timeRemaining = null,
          timeDiff = null;

        var sp_config = {
          spTitleText: vm.model.Hint,
          spContentTitle:
            "<div><div class='d-flex flex-column justify-content-around align-items-center p-4' style='height: 290px;'>" +
            "<div class='d-flex justify-content-center align-items-center w-100'>" +
            vm.model.CheckReaderProcess +
            "</div>" +
            '<div><img src="./img/loading.gif" alt=""></div>' +
            "</div></div>",
          spTimerText:
            '<div id="timerContent" class="processTime d-flex justify-content-center mt-4"><img style="margin: 3px 10px 0px -5px; width: 24px; height: 24px;" alt="" src="img/Timer.png"><span id="confirmTimer" style="font-size: 24px;">' +
            moment(limit).format("mm:ss") +
            "</span></div>",
        };
        TVMSwal(sp_config);

        function confirmTimer() {
          timeDiff = moment() - createTime;
          timeRemaining = limit - timeDiff + 1000;
          if (timeRemaining < 0) {
            $("#timerContent").css("visibility", "hidden");
            if (vm.timer2 != null) clearInterval(vm.timer2);
          } else if (IsCTBCECCfail && fail && timeDiff > 5500) {
            if (vm.timer2 != null) clearInterval(vm.timer2);
            fail();
          } else {
            $("#confirmTimer").text(moment(timeRemaining).format("mm:ss"));
          }
        }
        vm.timer2 = setInterval(confirmTimer, 1000);
      }
    },
    resetTimer: function (limit) {
      var vm = this;
      var tmp = vm.limit - (moment() - vm.createTime);

      if (
        tmp > 0 &&
        !vm.IsPaymentCanceled &&
        vm.payType === "ICTCash" &&
        kiosk.status.cashPaid < kiosk.status.ticketTotalAmt
      ) {
        vm.IsShowCancelBtn = true;
        limit ? (vm.limit = limit) : (vm.limit = 40000);
        vm.createTime = moment();
        vm.showTime = moment(vm.limit).format("mm:ss");
        vm.resetIdle();
        vm.$forceUpdate();
      }
    },
    PaymentCancel: function (cancelType) {
      var vm = this;
      var createTime = moment();
      var limit = 3000;
      var timeRemaining = null;

      vm.IsPaymentCanceled = true;
      if (vm.IsGoNext) return;

      if (!cancelType) {
        var sp_config = {
          spTitleText: vm.model.actionHint,
          spContentTitle: vm.model.HintText,
          spTimerText:
            '<div class="d-flex" style="justify-content: center;"><img style="width: 24px; height: 24px; margin-top: 3px; margin-right: 10px;" alt="" src="img/Timer.png"><span class="cancelTimer" style="color: red; font-size: 24px;">' +
            moment(limit).format("mm:ss") +
            "</span></div>",
        };
        TVMSwal(sp_config);
      } else if (cancelType && cancelType === "PaymentError") {
        showAlert({
          title: vm.model.PaymentError,
          // text: res,
          type: "error",
          // confirm: "確認",
          // confirmFn: function () {
          //   vm.goHome();
          // },
        });
      }

      if (!kiosk.status.posPayType.PayTypeAction.startsWith("ICTCash")) {
        vm.posCancelPayment();
        !cancelType
          ? (vm.timer2 = setInterval(cancelTimer, 1000))
          : setTimeout(function () {
              var vm2 = vm;
              vm2.goHome();
            }, 3000);
      } else {
        vm.checkCashCancel(function () {
          if (vm.IsGoNext) {
            return;
          }
          kiosk.CashBox.cancelType = "cancel";
          if (!cancelType) {
            vm.timer3 = setInterval(cancelCashTimer, 1000);
          }

          var finisiCancel = false;

          vm.ICTCashCancel()
            .then(function (res) {
              vm.resetIdle();
              finisiCancel = true;

              vm.posCancelPayment();
              !cancelType
                ? (vm.timer4 = setInterval(checkCountDown, 1000))
                : vm.goHome();
            })
            .catch(function (err) {
              vm.resetIdle();
              finisiCancel = true;
              swal.close();
              vm.PaymentError();
            });

          // 若因硬體異常導致 ICTCashCancel 無法resolve或reject，停止現金付款並回到首頁
          setTimeout(function () {
            if (kiosk.currentModelKey === "Payment" && !finisiCancel) {
              var vm2 = vm;
              kiosk.app.deviceStatus.CASHBOXERROR = true;
              vm2.goHome();
            }
          }, 40000);

          function cancelCashTimer() {
            timeRemaining = limit - (moment() - createTime);
            if (timeRemaining <= 0) {
              if (vm.timer3 != null) {
                clearInterval(vm.timer3);
              }
              showTime = "00:00";
            } else {
              $(".cancelTimer").text(moment(timeRemaining).format("mm:ss"));
            }
          }

          function checkCountDown() {
            if (timeRemaining <= 0) {
              if (vm.timer4 != null) {
                clearInterval(vm.timer4);
              }
              vm.goHome();
            }
          }
        });
      }

      function cancelTimer() {
        timeRemaining = limit - (moment() - createTime) + 1000;
        if (timeRemaining <= 0) {
          showTime = "00:00";
          swal.close();
          vm.goHome();
        } else {
          $(".cancelTimer").text(moment(timeRemaining).format("mm:ss"));
        }
      }
    },
    checkCashCancel: function (CancelFn) {
      var vm = this;
      vm.IsPaymentCanceled = true;
      if (vm.IsGoNext) return;

      vm.resetIdle();
      showAlert({
        // title: "確認中，請稍候",
        title: vm.model.CheckPaymentProcess,
        type: "warning",
      });

      var StatusRetry = 0;
      setTimeout(function () {
        CashCancel(CancelFn);
      }, 1500);

      function handleStatusRetry(res) {
        setTimeout(function () {
          StatusRetry++;

          if (StatusRetry < 5) {
            WriteLog("handleCancelRetry:" + StatusRetry);
            setTimeout(function () {
              CashCancel();
            }, 200);
          } else {
            WriteLog("timerFn - cancelPayment error:" + JSON.stringify(res));
            kiosk.app.deviceStatus.CASHBOXERROR = true;
          }
          return;
        }, 200);
      }

      function CashCancel(CancelFn) {
        customLibDevice.CashBox.paymentStatus()
          .then(function (res) {
            // WriteLog("cancelPayment:" + JSON.stringify(res));
            // 確保回傳資料格式正確，也避免產生JS錯誤
            var IfSuccess = false;
            try {
              if (typeof JSON.parse(res.resultJson) === "object") {
                IfSuccess = true;
              }
            } catch (error) {
              IfSuccess = false;
              handleStatusRetry(res);
              return;
            }

            var result = JSON.parse(res.resultJson);

            if (IfSuccess && res.IsSuccess) {
              if (result.transactionStep === 5 && result.returnValue === 0) {
                if (result.issueCode !== 1 && result.issueCode !== 2) {
                  WriteLog(
                    "startCheckCash - checkCash - paymentStatus error:" +
                      JSON.stringify(res)
                  );
                }

                // 若沒有JSON.stringify，vue的v-if會抓不到
                kiosk.status.changeAmt = JSON.stringify(result.changeAmt);

                BackEnd.AddActionLog(
                  "3",
                  "現金付款-完成交易",
                  JSON.stringify({
                    member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
                    app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
                    version: kiosk.BESync ? kiosk.BESync.Version : "",
                    payable: kiosk.status.ticketTotalAmt
                      ? kiosk.status.ticketTotalAmt
                      : "",
                    paid: kiosk.status.cashPaid ? kiosk.status.cashPaid : "",
                    isSuccess: "Y",
                  })
                );

                setTimeout(function () {
                  vm.goNext();
                }, 1000);
                return;
              } else if (
                // 0-自我偵測中, 3-等待找錢
                result.transactionStep === 0 ||
                result.transactionStep === 3
              ) {
                setTimeout(function () {
                  CashCancel(CancelFn);
                }, 0);
                return;
              }
              CancelFn();
              // 6-找錢異常 → 取消交易
              // result.transactionStep === 6
            } else {
              handleCancelRetry(res);
              return;
            }
          })
          .catch(function (err) {
            WriteLog(
              "checkCashCancel - paymentStatus catch: " + JSON.stringify(err)
            );
          });
      }
    },
    ICTCashCancel: function (obj) {
      var vm = this;
      return new Promise(function (resolve, reject) {
        var CancelRetry = 0;
        var EndRetry = 0;

        // 重置idleTimer
        vm.resetIdle();

        CashCancel();

        function CashCancel() {
          if (kiosk.status.checkingCash) {
            setTimeout(function () {
              CashCancel();
            }, 500);
            return;
          }

          function handleCancelRetry(res) {
            setTimeout(function () {
              CancelRetry++;

              if (CancelRetry < 5) {
                WriteLog("handleCancelRetry:" + CancelRetry);
                setTimeout(function () {
                  CashCancel();
                }, 200);
              } else {
                WriteLog(
                  "ICTCashCancel - CashCancel - cancelPayment error:" +
                    JSON.stringify(res)
                );
                kiosk.app.deviceStatus.CASHBOXERROR = true;
              }
              return;
            }, 200);
          }

          customLibDevice.CashBox.cancelPayment()
            .then(function (res) {
              // 確保回傳資料格式正確，也避免產生JS錯誤
              var IfSuccess = false;
              try {
                if (typeof JSON.parse(res.resultJson) === "object") {
                  IfSuccess = true;
                }
              } catch (err) {
                IfSuccess = false;
                handleCancelRetry(res);
                if (CancelRetry >= 5) {
                  reject();
                }
                return;
              }

              var result = JSON.parse(res.resultJson);

              // 成功取消交易
              if (
                IfSuccess &&
                res.IsSuccess &&
                (result.transactionStep === 5 ||
                  // 取消交易時尚未發動付款(等待交易)
                  (result.transactionStep === 1 &&
                    result.returnValue === 1 &&
                    result.issueCode === 0))

                // result.transactionStep === 5 &&
                // // 中斷交易正常結束
                // result.returnValue === 1 &&
                // // 21-無須退款 || 22-退款正確 || 32-退款正確(但回傳存量參數異常?)
                // (result.issueCode === 21 ||
                //   result.issueCode === 22 ||
                //   result.issueCode === 32 ||
                //   // ※3是沒辦法找零時的狀態(可能是零錢不足 或是 零錢機的錢筒沒裝好導致零錢沒出來)
                //   result.issueCode === 3)
              ) {
                EndPayment();

                function handleEndRetry(res) {
                  setTimeout(function () {
                    EndRetry++;

                    if (EndRetry < 5) {
                      WriteLog("handleEndRetry:" + EndRetry);
                      setTimeout(function () {
                        EndPayment();
                      }, 200);
                    } else {
                      WriteLog(
                        "ICTCashCancel - CashCancel - cancelPayment - endPayment error:" +
                          JSON.stringify(res)
                      );
                      kiosk.app.deviceStatus.CASHBOXERROR = true;
                    }
                    return;
                  }, 200);
                }

                function EndPayment() {
                  customLibDevice.CashBox.endPayment()
                    .then(function (res) {
                      WriteLog(
                        "取消付款後 endPayment then:" + JSON.stringify(res)
                      );
                      // 確保回傳資料格式正確，也避免產生JS錯誤
                      var IfSuccess = false;
                      try {
                        if (typeof JSON.parse(res.resultJson) === "object") {
                          IfSuccess = true;
                        }
                      } catch (error) {
                        IfSuccess = false;
                        handleEndRetry(res);
                        if (EndRetry >= 5) {
                          reject();
                        }
                        return;
                      }

                      var result = JSON.parse(res.resultJson);

                      // 成功結束收款
                      if (
                        IfSuccess &&
                        res.IsSuccess &&
                        result.transactionStep === 1 &&
                        (result.returnValue === 0 ||
                          result.returnValue === 1) &&
                        result.issueCode === 0
                      ) {
                        DetectBalance();

                        BackEnd.AddActionLog(
                          "3",
                          "現金付款-取消交易",
                          JSON.stringify({
                            member: kiosk.sfAccount
                              ? kiosk.sfAccount.username
                              : "",
                            app: kiosk.systemSetting
                              ? kiosk.systemSetting.appName
                              : "",
                            version: kiosk.BESync ? kiosk.BESync.Version : "",
                            payable: kiosk.status.ticketTotalAmt
                              ? kiosk.status.ticketTotalAmt
                              : "",
                            paid: kiosk.status.cashPaid
                              ? kiosk.status.cashPaid
                              : "",
                            isSuccess: kiosk.CashBox.cancelType,
                          })
                        );
                        resolve();
                      }
                      // 結束收款狀態異常 或 res.IsSuccess false
                      else {
                        handleEndRetry(res);
                        if (EndRetry >= 5) {
                          reject();
                        }
                        return;
                      }
                    })
                    .catch(function (err) {
                      handleEndRetry(err);
                      if (EndRetry >= 5) {
                        reject();
                      }
                      return;
                    });
                }
              }
              // 尚未成功取消交易
              else {
                handleCancelRetry(res);
                if (CancelRetry >= 5) {
                  reject();
                }
                return;
              }
            })
            .catch(function (err) {
              handleCancelRetry(err);
              if (CancelRetry >= 5) {
                reject();
              }
              return;
            });
        }
      });
    },
    PaymentError: function () {
      var vm = this;
      vm.IsPaymentCanceled = true;

      if (vm.payType === "ICTCash") {
        DetectBalance();
        kiosk.app.deviceStatus.CASHBOXERROR = true;
      }

      vm.showRetryAlert(
        vm.model.PaymentError,
        function () {},
        function () {}
      );
    },
    showRetryAlert: function (title, retryFn, cancelFn) {
      var vm = this;
      vm.resetIdle();
      vm.IsPaymentCanceled = true;

      var BtnHtml =
        '<div class="mt-4 d-flex justify-content-around align-items-center w-100">' +
        '<button class="spBtnLeft btn btn-outline-success w-50 px-4 py-1 mx-1" style="font-size: 30px; outline: none;">' +
        vm.model.cancelOrder +
        "</button>" +
        '<button class="spBtnRight btn btn-primary w-50 px-4 py-1 mx-1" style="font-size: 30px; outline: none;">' +
        vm.model.RePay +
        "</button>" +
        "</div>";

      if (kiosk.currentModelKey === "Payment") {
        showAlert({
          title: title ? title : vm.model.PaymentError,
          html: BtnHtml,
          type: "error",
          onOpen: function () {
            $(".spBtnLeft").blur();
            $(".spBtnLeft").click(function () {
              if (cancelFn) cancelFn();
              vm.posCancelPayment();
              vm.goHome();
            });
            $(".spBtnRight").blur();
            $(".spBtnRight").click(function () {
              swal.close();
              // 避免除了掃碼以外的付款方式重複觸發(掃碼不影響)
              if (vm.IsWaitingPayment == false && vm.payType != "Fonpay") {
                return;
              }
              vm.IsWaitingPayment = false;
              if (retryFn) retryFn();
              vm.resetIdle();
              vm.IsShowConfirmAlert = false;
              vm.IsPaymentCanceled = false;
              vm.IsCTBCECCfail = false;
              vm.keyBoardValue = "";
              vm.createTime = moment();
              vm.updatePaymentUI();
              vm.timer = setInterval(vm.timerFn, 1000);
              vm.$forceUpdate();
            });
          },
        });
      }
    },
  },
  created: function () {},
  mounted: function () {
    var vm = this;
    // var idlesecond = parseInt(kiosk.API.idle.getIdleSeconds());
    // if (idlesecond == NaN || idlesecond == 0) {
    //   idlesecond = 60;
    // }
    vm.idleTimmer = setInterval(vm.idleGoHome, vm.idleSecond * 1000);

    // 目前"Cash"與"Offline"只有POS在用
    vm.payTypeAction.startsWith("Offline") ||
    vm.payTypeAction.startsWith("Cash")
      ? (vm.payType = "Offline")
      : vm.payTypeAction.startsWith("Free")
      ? (vm.payType = "Free")
      : vm.payTypeAction.startsWith("Fonpay")
      ? (vm.payType = "Fonpay")
      : vm.payTypeAction.startsWith("ICTCash")
      ? (vm.payType = "ICTCash")
      : (vm.payType = "CreditCard");

    vm.updatePaymentUI();
    this.$nextTick(function () {
      this.timer = setInterval(this.timerFn, 1000);
      vm.$forceUpdate();
    });
  },
  beforeDestroy: function () {
    swal.close();
    if (this.timer != null) clearInterval(this.timer);
    if (this.timer2 != null) clearInterval(this.timer2);
    if (this.idleTimmer != null) clearInterval(this.idleTimmer);
  },
});

// NavBar
Vue.component("component-Payment-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: false,
      isShowHome: false,
    };
  },
});
