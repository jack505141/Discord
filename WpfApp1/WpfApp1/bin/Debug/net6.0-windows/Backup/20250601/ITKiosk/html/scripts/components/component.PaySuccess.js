// MainPage
Vue.component("component-PaySuccess-main", {
  props: ["model"],
  template: "#template-PaySuccess-main",
  data: function () {
    return {
      subTotalCash: kiosk.status.ticketTotalAmt,
      changeAmt: kiosk.status.changeAmt ? kiosk.status.changeAmt : null,
      orderListSerial: kiosk.status.posCreatePayment.payment.paymentNumber,
      payName: kiosk.status.posPayType.CorporationPayTypeName,
      isDone: false,
      isInvoicePrintWithDetail: false,
      isPaymentPrintWithDetail: false,
      isPrintDetailIndividually: false,
    };
  },
  methods: {
    goHome: function () {
      kiosk.app.updateLoading(false);
      kiosk.API.initStatus();
      kiosk.API.goToNext("mainMenu");
    },
    goBack: function () {},
    goNext: function () {},
    Print: function () {
      var vm = this;
      var count = 0;
      var printDelay = 0;
      var retryLimit = 5;
      var printType = "single";
      var changeLang = kiosk.systemSetting.lang;

      if (kiosk.status.posEnablePayment.voucherMode == "PAYMENT") {
        vm.ticketTotalNum = 1;
        printType = "group";
      }

      BackEnd.AddActionLog(
        "4",
        "印票",
        JSON.stringify({
          member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          action: "request_print",
          printType: printType,
          version: kiosk.BESync ? kiosk.BESync.Version : "",
        })
      );

      switch (changeLang) {
        case "ja_JP":
          changeLang = "en_US";
          getDiffLangData(changeLang);
          break;

        case "ko_KR":
          changeLang = "en_US";
          getDiffLangData(changeLang);
          break;

        default:
          startPrint();
          break;
      }

      function getDiffLangData(lang) {
        PalaceAPI.posQueryPayment(kiosk.status.posEnablePayment.paymentId, lang)
          .then(function (res) {
            startPrint(res.payment);
          })
          .catch(function (errMsg) {
            startPrint();
          });
      }

      function startPrint(EngData) {
        startPrintElec(EngData)
          .then(function (res) {
            return startPrintDetails(EngData);
          })
          .then(function (res) {
            return startPrintTicket(EngData);
          })
          .then(function (res) {
            switch (res) {
              case "1":
                vm.isDone = true;
                setTimeout(function () {
                  if (kiosk.currentModelKey === "PaySuccess") {
                    vm.goHome();
                  }
                }, 10000);
                break;

              case "0":
                kiosk.API.goToNext("PrintFail");
                break;
            }
          })
          .catch(function (err) {
            WriteLog(
              "startPrint - startPrintElec - error: " + JSON.stringify(err)
            );
            setTimeout(function () {
              vm.goHome();
            }, 750);
          });
      }

      function startPrintElec(EngData) {
        return new Promise(function (resolve, reject) {
          if (
            kiosk.status.posEnablePayment.invoiceData &&
            kiosk.status.posEnablePayment.invoiceData.invoiceDeviceType ==
              "PAPER"
          ) {
            var retryPrintElec = 0;
            function goPrint() {
              if (vm.isInvoicePrintWithDetail) {
                customLibDevice.Thermal.ElecPrintWithDetail(
                  kiosk.BESync.ReveivePrinterName,
                  EngData && EngData.invoiceData
                    ? EngData.invoiceData
                    : kiosk.status.posEnablePayment.invoiceData,
                  EngData ? EngData : kiosk.status.posEnablePayment,
                  null
                )
                  .then(function (res) {
                    resolve();
                  })
                  .catch(function (err) {
                    if (retryPrintElec < retryLimit) {
                      retryPrintElec++;
                      setTimeout(function () {
                        goPrint();
                      }, printDelay);
                    } else {
                      showAlert({
                        title: "發票列印失敗",
                        type: "error",
                        confirm: "確認",
                        confirmFn: function () {
                          kiosk.app.deviceStatus.PRINTINVOICE = "0";
                          reject();
                        },
                      });
                    }
                  });
              } else {
                customLibDevice.Thermal.ElecPrint(
                  kiosk.BESync.ReveivePrinterName,
                  EngData && EngData.invoiceData
                    ? EngData.invoiceData
                    : kiosk.status.posEnablePayment.invoiceData
                )
                  .then(function (res) {
                    resolve();
                  })
                  .catch(function (err) {
                    if (retryPrintElec < retryLimit) {
                      retryPrintElec++;
                      setTimeout(function () {
                        goPrint();
                      }, printDelay);
                    } else {
                      showAlert({
                        title: "發票列印失敗",
                        type: "error",
                        confirm: "確認",
                        confirmFn: function () {
                          kiosk.app.deviceStatus.PRINTINVOICE = "0";
                          reject();
                        },
                      });
                    }
                  });
              }
            }

            if (
              kiosk.status.invoice != null &&
              kiosk.status.invoice.invoiceType == "2COPIES" &&
              kiosk.status.invoice.invoiceDeviceCode == null &&
              kiosk.BESync.PrintDetail == 0
            ) {
              // (開立紙本發票 且 (無統編 且 不要列印明細))
              // => 單獨列印發票 且 不印明細
              vm.isInvoicePrintWithDetail = false;
              vm.isPaymentPrintWithDetail = false;
            } else {
              // 1.(開立紙本發票 且 有統編)
              // 2.(開立紙本發票 且 (無統編 且 要列印明細))
              // => 發票明細合併列印 且 不印明細
              vm.isInvoicePrintWithDetail = true;
              vm.isPaymentPrintWithDetail = false;
            }
            goPrint();
          } else {
            if (
              kiosk.status.invoice == null &&
              kiosk.status.invoiceName == null &&
              kiosk.status.invoiceCode == null &&
              kiosk.BESync.PrintDetail == 0
            ) {
              // (不開紙本發票 且 (無統編) 且 不要列印明細)
              // => 不印發票 且 不印明細
              vm.isInvoicePrintWithDetail = false;
              vm.isPaymentPrintWithDetail = false;

              resolve();
            } else {
              // 1.(不開紙本發票 且 (有統編))
              // 2.(不開紙本發票 且 (無統編) 且 要列印明細)
              vm.isInvoicePrintWithDetail = false;
              vm.isPaymentPrintWithDetail = true;
              if (
                kiosk.status.posEnablePayment.voucherMode == "PAYMENT" &&
                kiosk.BESync.TicketPrinterName != "TSP-247"
              ) {
                // (不開紙本發票 且 ((團體票) 且 印表機非247)) => 不印明細(團體票含明細)
                resolve();
              } else {
                // (不開紙本發票 且 ((非團體票) 或 印表機是247)) => 強制列印明細
                vm.isPrintDetailIndividually = true;
                resolve();
              }
            }
          }
        });
      }

      function startPrintDetails(EngData) {
        return new Promise(function (resolve, reject) {
          var retryPrintDetails = 0;
          function goPrint(EngData) {
            if (vm.isPrintDetailIndividually) {
              printDetails(
                kiosk.BESync.ReveivePrinterName,
                EngData ? EngData : kiosk.status.posEnablePayment
              )
                .then(function (res) {
                  resolve();
                })
                .catch(function (err) {
                  if (retryPrintDetails < retryLimit) {
                    retryPrintDetails++;
                    setTimeout(function () {
                      goPrint(EngData);
                    }, printDelay);
                  } else {
                    showAlert({
                      title: "明細列印失敗",
                      type: "error",
                      confirm: "回首頁",
                      confirmFn: function () {
                        kiosk.app.deviceStatus.PRINTDETAILS = "0";
                        reject();
                      },
                    });
                  }
                });
            } else {
              resolve();
            }
          }

          goPrint(EngData);
        });
      }

      function startPrintTicket(EngData) {
        return new Promise(function (resolve, reject) {
          var lengthOfOrderList =
            kiosk.status.posEnablePayment.productOrderList.length;
          if (EngData) {
            var paymentSettingListName = EngData.paymentSettingList[0].name;
          } else {
            var paymentSettingListName =
              kiosk.status.posEnablePayment.paymentSettingList[0].name;
          }
          /**
           * 因Ext 非問題無法使用map & for
           * 設置count = 0; 當count小於newArr長度時
           * 將地址傳入Ext後,回傳結果賦值給MASK_ADDR
           * count ++ , Loop
           */
          var retryPrintTicket = 0;
          goPrint(EngData);

          function goPrint(EngData) {
            if (count < lengthOfOrderList) {
              if (EngData) {
                var item = EngData.productOrderList[count];
              } else {
                var item =
                  kiosk.status.posEnablePayment.productOrderList[count];
              }
              item.paymentSettingListName = paymentSettingListName;

              if (kiosk.status.posEnablePayment.voucherMode == "TICKET") {
                setTimeout(function () {
                  // 一人一票
                  printTicket(kiosk.BESync.TicketPrinterName, item, count)
                    .then(function (res) {
                      count++;
                      setTimeout(function () {
                        goPrint(EngData);
                      }, printDelay);
                    })
                    .catch(function (err) {
                      if (retryPrintTicket < retryLimit) {
                        retryPrintTicket++;
                        setTimeout(function () {
                          goPrint(EngData);
                        }, printDelay);
                      } else {
                        resolve("0");
                      }
                    });
                }, printDelay);
              } else if (
                kiosk.status.posEnablePayment.voucherMode == "PAYMENT"
              ) {
                setTimeout(function () {
                  // 團體出票
                  printPayment(
                    kiosk.BESync.TicketPrinterName,
                    kiosk.status.posEnablePayment,
                    count,
                    null,
                    vm.isPaymentPrintWithDetail
                  )
                    .then(function (res) {
                      count++;
                      setTimeout(function () {
                        goPrint(EngData);
                      }, printDelay);
                    })
                    .catch(function (err) {
                      if (retryPrintTicket < retryLimit) {
                        retryPrintTicket++;
                        setTimeout(function () {
                          goPrint(EngData);
                        }, printDelay);
                      } else {
                        resolve("0");
                      }
                    });
                }, printDelay);
              }
            } else {
              switch (kiosk.status.posEnablePayment.voucherMode) {
                case "TICKET":
                  BackEnd.AddActionLog(
                    "4",
                    "個別出票 single",
                    JSON.stringify({
                      member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
                      app: kiosk.systemSetting
                        ? kiosk.systemSetting.appName
                        : "",
                      behavior: "request_print",
                      printType: "single",
                      printCount: count,
                      version: kiosk.BESync ? kiosk.BESync.Version : "",
                    })
                  );
                  break;

                case "PAYMENT":
                  BackEnd.AddActionLog(
                    "4",
                    "團體出票 group",
                    JSON.stringify({
                      member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
                      app: kiosk.systemSetting
                        ? kiosk.systemSetting.appName
                        : "",
                      behavior: "request_print",
                      printType: "group",
                      printCount: count,
                      version: kiosk.BESync ? kiosk.BESync.Version : "",
                    })
                  );
                  break;

                default:
                  break;
              }
              WriteLog("AddPrintTicketCount: " + count);
              BackEnd.AddPrintTicketCount(1, count);
              resolve("1");
            }
          }
        });
      }
    },
    BuyContinue: function () {
      var vm = this;
      kiosk.app.updateLoading(true);
      checkPrinterStatus().then(function (res) {
        var isPrinterError = false;
        if (!testFlag.viewDebugger) {
          switch (kiosk.app.deviceStatus.TICKETPRINTER) {
            case 0:
              isPrinterError = true;
              break;

            case 1:
              break;
          }

          switch (kiosk.app.deviceStatus.REVEIVEPRINTER) {
            case 0:
              isPrinterError = true;
              break;

            case 1:
              break;
          }
          if (isPrinterError) {
            vm.goHome();
          } else {
            var checkDevice = kiosk.status.posCheckDevice;
            var SelectInfo = kiosk.status.SelectInfo;
            var recvCustomerInfo = kiosk.status.recvCustomerInfo;
            var TicketTemplates = kiosk.status.TicketTemplates;
            kiosk.API.initStatus();
            kiosk.status.posCheckDevice = checkDevice;
            kiosk.status.SelectInfo = SelectInfo;
            kiosk.status.recvCustomerInfo = recvCustomerInfo;
            kiosk.status.TicketTemplates = TicketTemplates;
            kiosk.app.updateLoading(false);
            kiosk.API.goToNext("ProductChoice");
          }
        } else {
        }
      });
    },
  },
  created: function () {},
  mounted: function () {
    var vm = this;

    handleEndICTCash();

    this.$nextTick(function () {
      setTimeout(function () {
        vm.Print();
      }, 700);
    });
  },
});
// NavBar
Vue.component("component-PaySuccess-navBar", {
  template:
    '<component-TVMcommon-navBar :isShowBack="isShowBack" :isShowHome="isShowHome"></component-TVMcommon-navBar>',
  data: function () {
    return {
      isShowBack: false,
      isShowHome: false,
    };
  },
});
