var PalaceAPI = {
  /**
   * @param {String} description 設備說明(只有在第一次呼叫時有效，可不代入此參數)
   */
  posCheckDevice: function (description) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        deviceType: kiosk.systemSetting.appName,
        name: kiosk.BESync.KioskName,
        description: description ? description : kiosk.BESync.KioskName,
        loginMode: "DEVICE",
      };
      var basicObj = {};
      var isXignore = true;
      var APIname = "posCheckDevice";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} category 欲查詢之商品分類
   */
  posSaleProductList: function (category) {
    return new Promise(function (resolve, reject) {
      if (!category) {
        category = {
          categoryId: "",
          name: "ALL",
          showOrder: 0,
        };
      }
      var requestObj = {
        showCategory: true,
        categoryId: category.categoryId,
        order: "desc",
        max: 30,
        offset: "0",
      };
      var basicObj = {};
      var isXignore = true;
      var APIname = "posSaleProductList";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   *
   * @param {String} voucherMode 出票模式 團體出票 PAYMENT,個別出票 TICKET
   * @param {String} sales 銷售人員(非必填)
   * @param {Object} paymentData 訂單資訊
   * @param {Array} orderList 購買清單
   */
  posCreatePayment: function (voucherMode, sales, paymentData, orderList) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        voucherMode: voucherMode,
        sales: sales,
        paymentData: paymentData,
        orderList: orderList,
      };
      var basicObj = {};
      if (kiosk.status.recvCustomerInfo) {
        requestObj.paymentData.nationality = kiosk.status.SelectInfo.code;
      }
      var isXignore = true;
      var APIname = "posCreatePayment";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} paymentId 建立交易取得的訂單Id
   * @param {String} transactionData 交易相關資訊
   * @param {String} changePaymentSettingId 豐趣金流付款代碼(kiosk.BESync.FTPayTypeCode)
   */
  posEnablePayment: function (
    paymentId,
    transactionData,
    changePaymentSettingId
  ) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        paymentId: paymentId,
        transactionData: transactionData,
        mobilePayToken: kiosk.status.mobilePayToken,
        changePaymentSettingId: changePaymentSettingId,
      };
      var basicObj = {};
      var isXignore = false;
      var APIname = "posEnablePayment";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore, paymentId)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} paymentId 建立交易取得的訂單Id
   // version posCancelPayment版本號(目前填入v2)
   */
  posCancelPayment: function (paymentId) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        paymentId: paymentId,
        version: "v2",
      };
      var basicObj = {};
      var isXignore = true;
      var APIname = "posCancelPayment";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} paymentId 建立交易取得的訂單Id
   * @param {String} changeLang 欲查詢的語系代號(非必填)
   */
  posQueryPayment: function (paymentId, changeLang) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        paymentId: paymentId,
      };
      var basicObj = {};
      if (changeLang) basicObj.lang = changeLang;
      var isXignore = false;
      var APIname = "posQueryPayment";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore, paymentId)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} saleProductId 銷售商品ID
   */
  posQueryReservedSaleProductInventorySummary: function (saleProductId) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        saleProductId: saleProductId,
      };
      var basicObj = {};
      var isXignore = true;
      var APIname = "posQueryReservedSaleProductInventorySummary";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} saleProductId 欲查詢的銷售商品ID
   * @param {String} queryDate 欲查詢的指定日期(yyyyMMdd)
   */
  posQueryReservedSaleProductInventoryDetail: function (
    saleProductId,
    queryDate
  ) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        saleProductId: saleProductId,
        queryDate: queryDate,
      };
      var basicObj = {};
      var isXignore = true;
      var APIname = "posQueryReservedSaleProductInventoryDetail";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} saleProductId 欲查詢的銷售商品ID
   * @param {String} bookingSpecId 欲查詢的預約方案編號
   * @param {String} queryDate 欲查詢的指定日期(yyyyMMdd)
   */
  posQueryReservedSaleProductSeatingDetail: function (
    saleProductId,
    bookingSpecId,
    queryDate
  ) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        saleProductId: saleProductId,
        bookingSpecId: bookingSpecId,
        queryDate: queryDate,
      };
      var basicObj = {};
      var isXignore = true;
      var APIname = "posQueryReservedSaleProductSeatingDetail";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} username 銷售商品ID
   * @param {String} password 查詢的指定日期(yyyyMMdd)
   */
  posUserLogin: function (username, password) {
    return new Promise(function (resolve, reject) {
      var requestObj = {
        username: username,
        password: password,
      };
      var basicObj = {};
      var isXignore = true;
      var APIname = "posUserLogin";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   */
  posUserLogout: function () {
    return new Promise(function (resolve, reject) {
      var requestObj = {};
      var basicObj = {};
      var isXignore = true;
      var APIname = "posUserLogout";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * requestData
   * {
   *  startTime: yyyyMMddHHmmss
   *  endTime: yyyyMMddHHmmss
   *  salesName: username
   * }
   */
  posQueryReconciliation: function (requestData) {
    return new Promise(function (resolve, reject) {
      var requestObj = requestData;
      var basicObj = {};
      var isXignore = true;
      var APIname = "posQueryReconciliation";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   */
  posQueryDailySaleReport: function (requestData) {
    return new Promise(function (resolve, reject) {
      var requestObj = requestData;
      var basicObj = {};
      var isXignore = true;
      var APIname = "posQueryDailySaleReport";

      PalaceAPI.sendAPIReq(APIname, requestObj, basicObj, isXignore)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (err) {
          WriteLog(APIname + " sendAPIReq error:" + JSON.stringify(err));
          reject(err);
        });
    });
  },
  /**
   * @param {String} APIname API名稱
   * @param {Object} requestObj request物件
   * @param {Boolean} isXignore 是否略過時間與加密檢查(X-hash加密驗證參數 需要有paymentId才能產生(訂單相關API會用到))
   * @param {String} paymentId 建立交易取得的訂單Id
   */
  sendAPIReq: function (APIname, requestObj, basicObj, isXignore, paymentId) {
    return new Promise(function (resolve, reject) {
      // 純頁面流程
      if (testFlag.viewDebugger) {
        var response = fake.PalaceAPI[APIname]
          ? fake.PalaceAPI[APIname]
          : {
              data: { result: {}, response: {} },
              status: 200,
              statusText: "",
              headers: {},
              config: {},
              request: {},
            };
        resolve(response.data.result);
        return;
      }

      var checkBESync = new Promise(function (resolve, reject) {
        if (kiosk.BESync) {
          resolve();
          return;
        }
        commonExt
          .getJson("BESync")
          .then(function (res) {
            resolve();
          })
          .catch(function (msg) {
            reject(msg);
          });
      });

      var checkSystemSetting = new Promise(function (resolve, reject) {
        if (kiosk.systemSetting) {
          resolve();
          return;
        }
        commonExt
          .getJson("systemSetting")
          .then(function (res) {
            resolve();
          })
          .catch(function (msg) {
            reject(msg);
          });
      });

      Promise.all([checkBESync, checkSystemSetting])
        .then(function (res) {
          checkXignore(APIname, requestObj, basicObj, isXignore, paymentId);
        })
        .catch(function (err) {
          WriteLog(APIname + "--parameter error:" + JSON.stringify(err));
          reject("參數異常");
        });

      function checkXignore(
        APIname,
        requestObj,
        basicObj,
        isXignore,
        paymentId
      ) {
        if (!isXignore && paymentId) {
          var json_string = {
            Key: kiosk.BESync.APIKey,
            PK: paymentId,
            XTime: moment().format("YYYYMMDDHHmmss"),
          };

          External.TicketingServiceBizExt.TicketingService.ConvertToSHA256(
            JSON.stringify(json_string),
            function (res) {
              if (JSON.parse(res).isSuccess) {
                startSendAPIReq(
                  APIname,
                  requestObj,
                  basicObj,
                  isXignore,
                  json_string,
                  res
                );
              } else {
                reject(JSON.parse(res).message);
              }
            },
            function () {}
          );
          return;
        }
        isXignore = true;
        startSendAPIReq(APIname, requestObj, basicObj, isXignore);

        function startSendAPIReq(
          APIname,
          requestObj,
          basicObj,
          isXignore,
          json_string,
          XhashRes
        ) {
          if (basicObj && basicObj.lang) {
            var changeLang = basicObj.lang;
          }
          var request = {
            request: requestObj,
            basic: {
              appVersion: kiosk.systemSetting.appVersion,
              os: kiosk.systemSetting.os,
              appName: kiosk.systemSetting.appName,
              latitude: kiosk.systemSetting.latitude,
              clientIp: kiosk.systemSetting.clientIp,
              lang: changeLang ? changeLang : kiosk.systemSetting.lang,
              deviceId: window.external.System.GetKioskId,
              deviceCode: kiosk.systemSetting.deviceCode,
              longitude: kiosk.systemSetting.longitude,
            },
          };
          var headers = {
            headers: {
              key: kiosk.BESync.APIKey,
              secret: kiosk.BESync.APISecret,
              "Content-Type": "application/json",
              "User-Agent": "FONTIKCET_SYSTEM",
              "X-time":
                !isXignore && json_string
                  ? json_string.XTime
                  : moment().format("YYYYMMDDHHmmss"),
              "X-hash":
                !isXignore && XhashRes
                  ? JSON.parse(XhashRes).result.SHA256
                  : "7f6215c970053ff0b8b7f18280e608be9d3c443d94b9f96f6a8dba693d1cd272",
              "X-ignore": !isXignore ? false : true,
              accessToken: kiosk.systemSetting.accessToken,
            },
            timeout: 60000,
          };
          WriteLog(APIname + "--傳入:" + JSON.stringify(request));
          WriteLog(APIname + "--headers:" + JSON.stringify(headers));

          if (kiosk.systemSetting.useFakeData) {
            WriteLog(APIname + "--傳出假資料:" + JSON.stringify(response));
            CheckIfSuccess(fake.PalaceAPI[APIname]);
          } else {
            axios
              .post(
                kiosk.BESync.APIURL + "api/pos/" + APIname,
                request,
                headers
              )
              .then(function (response) {
                WriteLog(APIname + "--傳出:" + JSON.stringify(response));
                BackEnd.AddActionLog(
                  "2",
                  APIname,
                  JSON.stringify(response.data.response)
                );
                CheckIfSuccess(response);
              })
              .catch(function (err) {
                WriteLog(APIname + "--catch error:" + JSON.stringify(err));
                reject("網路連線異常");
                // err.message: Network Error
              });
          }

          function CheckIfSuccess(response) {
            if (!kiosk.status.APIresponse) kiosk.status.APIresponse = {};
            kiosk.status.APIresponse[APIname] = response.data.response;

            if (response.data.response.success === true) {
              var res = response.data.result;
              kiosk.status[APIname] = res;
              resolve(res);
            } else {
              var errMsg = response.data.response.msg;
              // if (response.data.response.errorCode) {
              //   if (response.data.response.errorCode == 2014) {
              //     kiosk.app.updateLoading(false);
              //     showAlert({
              //       title: errorMsg,
              //       type: "error",
              //       confirm: "確認",
              //       confirmFn: function () {
              //         kiosk.API.idle.GoHome();
              //       },
              //     });
              //   }
              // }
              reject(errMsg);
            }
          }
        }
      }
    });
  },
};
