var customLibDevice = {
  Thermal: {
    TempData: "",
    TSP247TempData: "",
    Status: function () {
      return new Promise(function (resolve, reject) {
        if (kiosk.BESync.TicketPrinterName === "TSP-247") {
          kiosk.API.Device.TSC247Lib.GetStatus(
            function (res) {
              if (res.IsSuccess || res.retCode == 32) {
                customLibDevice.Thermal.TSP247TempData = "";
                resolve(res);
              } else {
                WriteLog(
                  "customLibDevice.Thermal.Status 247 - !res.IsSuccess && res.retCode != 32"
                );
                if (
                  customLibDevice.Thermal.TSP247TempData != JSON.stringify(res)
                ) {
                  WriteLog(
                    "customLibDevice.Thermal.Status 247 - before call AddActionLog"
                  );
                  BackEnd.AddActionLog(
                    "5",
                    kiosk.BESync.TicketPrinterName +
                      " - " +
                      customLibDevice.Thermal.converterError(
                        res,
                        kiosk.BESync.TicketPrinterName
                      ),
                    JSON.stringify(res)
                  );
                  WriteLog(
                    "customLibDevice.Thermal.Status 247 - after call AddActionLog"
                  );
                  customLibDevice.Thermal.TSP247TempData = JSON.stringify(res);
                }
                reject(res);
              }
            },
            function (resErr) {
              reject(resErr);
            }
          );
        } else {
          kiosk.API.Device.Thermal.getStatus(
            kiosk.BESync.TicketPrinterName,
            function (res) {
              if (res.IsSuccess) {
                if (!res.IsNearEnd) {
                  customLibDevice.Thermal.TempData = "";
                  resolve(res);
                } else {
                  WriteLog(
                    "customLibDevice.Thermal.Status - res.IsSuccess && res.IsNearEnd"
                  );
                  if (customLibDevice.Thermal.TempData != JSON.stringify(res)) {
                    WriteLog(
                      "customLibDevice.Thermal.Status - before call AddActionLog"
                    );
                    BackEnd.AddActionLog(
                      "5",
                      kiosk.BESync.TicketPrinterName +
                        " - " +
                        customLibDevice.Thermal.converterError(res),
                      JSON.stringify(res)
                    );
                    WriteLog(
                      "customLibDevice.Thermal.Status - after call AddActionLog"
                    );
                    customLibDevice.Thermal.TempData = JSON.stringify(res);
                  }
                  reject(res);
                }
              } else {
                WriteLog("customLibDevice.Thermal.Status - !res.IsSuccess");
                if (customLibDevice.Thermal.TempData != JSON.stringify(res)) {
                  WriteLog(
                    "customLibDevice.Thermal.Status - before call AddActionLog"
                  );
                  BackEnd.AddActionLog(
                    "5",
                    kiosk.BESync.TicketPrinterName +
                      " - " +
                      customLibDevice.Thermal.converterError(res),
                    JSON.stringify(res)
                  );
                  WriteLog(
                    "customLibDevice.Thermal.Status - after call AddActionLog"
                  );
                  customLibDevice.Thermal.TempData = JSON.stringify(res);
                }
                reject(res);
              }
            }
          );
        }
      });
    },
    ReveiveStatus: function () {
      return new Promise(function (resolve, reject) {
        if (kiosk.BESync.ReveivePrinterName === "TSP-247") {
          kiosk.API.Device.TSC247Lib.GetStatus(function (res) {
            if (res.IsSuccess || res.retCode == 32) {
              customLibDevice.Thermal.TSP247TempData = "";
              resolve(res);
            } else {
              WriteLog(
                "customLibDevice.Thermal.ReveiveStatus 247 - !res.IsSuccess && res.retCode != 32"
              );
              if (
                customLibDevice.Thermal.TSP247TempData != JSON.stringify(res)
              ) {
                WriteLog(
                  "customLibDevice.Thermal.ReveiveStatus 247 - before call AddActionLog"
                );
                BackEnd.AddActionLog(
                  "5",
                  kiosk.BESync.ReveivePrinterName +
                    " - " +
                    customLibDevice.Thermal.converterError(
                      res,
                      kiosk.BESync.ReveivePrinterName
                    ),
                  JSON.stringify(res)
                );
                WriteLog(
                  "customLibDevice.Thermal.Status 247 - after call AddActionLog"
                );
                customLibDevice.Thermal.TSP247TempData = JSON.stringify(res);
              }
              reject(res);
            }
          });
        } else {
          kiosk.API.Device.Thermal.getStatus(
            kiosk.BESync.ReveivePrinterName,
            function (res) {
              if (res.IsSuccess) {
                if (!res.IsNearEnd) {
                  customLibDevice.Thermal.TempData = "";
                  resolve(res);
                } else {
                  WriteLog(
                    "customLibDevice.Thermal.ReveiveStatus - res.IsSuccess && res.IsNearEnd"
                  );
                  if (customLibDevice.Thermal.TempData != JSON.stringify(res)) {
                    WriteLog(
                      "customLibDevice.Thermal.ReveiveStatus - before call AddActionLog"
                    );
                    BackEnd.AddActionLog(
                      "5",
                      kiosk.BESync.ReveivePrinterName +
                        " - " +
                        customLibDevice.Thermal.converterError(res),
                      JSON.stringify(res)
                    );
                    WriteLog(
                      "customLibDevice.Thermal.ReveiveStatus - after call AddActionLog"
                    );
                    customLibDevice.Thermal.TempData = JSON.stringify(res);
                  }
                  reject(res);
                }
              } else {
                WriteLog(
                  "customLibDevice.Thermal.ReveiveStatus - !res.IsSuccess"
                );
                if (customLibDevice.Thermal.TempData != JSON.stringify(res)) {
                  WriteLog(
                    "customLibDevice.Thermal.ReveiveStatus - before call AddActionLog"
                  );
                  BackEnd.AddActionLog(
                    "5",
                    kiosk.BESync.ReveivePrinterName +
                      " - " +
                      customLibDevice.Thermal.converterError(res),
                    JSON.stringify(res)
                  );
                  WriteLog(
                    "customLibDevice.Thermal.ReveiveStatus - after call AddActionLog"
                  );
                  customLibDevice.Thermal.TempData = JSON.stringify(res);
                }
                reject(res);
              }
            }
          );
        }
      });
    },
    Print: function (deviceName, templateID, jsonContent) {
      return new Promise(function (resolve, reject) {
        WriteLog(
          "START PRINT : " +
            JSON.stringify({
              deviceName: deviceName,
              templateID: templateID,
              jsonContent: jsonContent,
            })
        );

        var getStatusDelay = 300;
        var printDelay = 1000;
        if (deviceName === "TSP-247") {
          kiosk.API.Device.TSC247Lib.GetStatus(
            function (res) {
              if (res.IsSuccess) {
                kiosk.API.Device.TSC247Lib.GoPrint(
                  function (res) {
                    kiosk.systemSetting.printCount++;
                    commonExt.setJson("systemSetting", kiosk.systemSetting);
                    setTimeout(function () {
                      resolve(res);
                    }, printDelay);
                  },
                  function (resRej) {
                    setTimeout(function () {
                      resolve(resRej);
                    }, printDelay);
                  },
                  templateID,
                  jsonContent,
                  "101.5",
                  "53.8",
                  "7",
                  "8",
                  "0",
                  "2.8",
                  "0"
                );
              } else if (res.retCode == 32) {
                setTimeout(function () {
                  customLibDevice.Thermal.Print(
                    deviceName,
                    templateID,
                    jsonContent
                  )
                    .then(function (res) {
                      WriteLog("TSC-247 Retry");
                      setTimeout(function () {
                        resolve(res);
                      }, printDelay);
                    })
                    .catch(function (res) {
                      setTimeout(function () {
                        reject("列印失敗");
                      }, getStatusDelay);
                    });
                }, getStatusDelay);
              } else {
                reject(res);
              }
            },
            function (resErr) {
              reject(resErr);
            }
          );
        } else {
          kiosk.API.Device.Thermal.getStatus(deviceName, function (res) {
            if (res.IsSuccess) {
              setTimeout(function (res) {
                var result = kiosk.API.Device.Thermal.PrintTemplatePage(
                  deviceName,
                  templateID,
                  jsonContent
                );
                if (result.IsSuccess) {
                  kiosk.systemSetting.ReceiptPrinterNearEndPrintCount++;
                  commonExt.setJson("systemSetting", kiosk.systemSetting);
                  setTimeout(function (res) {
                    resolve(result);
                  }, printDelay);
                } else {
                  BackEnd.AddActionLog(
                    "5",
                    deviceName +
                      " - " +
                      customLibDevice.Thermal.converterError(res),
                    JSON.stringify(result)
                  );
                  setTimeout(function (res) {
                    reject(result);
                  }, printDelay);
                }
              }, getStatusDelay);
            } else {
              BackEnd.AddActionLog(
                "5",
                deviceName +
                  " - " +
                  customLibDevice.Thermal.converterError(res),
                JSON.stringify(res)
              );
              customLibDevice.Thermal.TempData = JSON.stringify(res);
              reject(res);
            }
          });
        }
      });
    },
    ElecPrint: function (deviceName, item) {
      // item = {
      //   "invoiceTypeName": "二聯式發票",
      //   "totalPrice": 799,
      //   "invoiceDeviceTypeName": "紙本",
      //   "sellerName": "豐趣科技股份有限公司",
      //   "invoiceTaxAmount": 38,
      //   "invoiceAmount": 799,
      //   "sellerVatNumber": "42760988",
      //   "invoiceDeviceType": "PAPER",
      //   "buyerVatNumber": "",
      //   "zeroTaxSaleAmount": 0,
      //   "invoicePeriod": "110年07-08月",
      //   "invoiceNumber": "LV61159049",
      //   "randomNumber": "0615",
      //   "statusName": "開立成功",
      //   "legacyId": "9594663020210812131205",
      //   "invoiceType": "2COPIES",
      //   "freeTaxSaleAmount": 0,
      //   "invoiceDeviceCode": "",
      //   "issueDate": "20210812131230",
      //   "rightQRcode": "**票 (雲端發票-不含娛樂稅/應稅0.5:1:799 ",
      //   "buyerTitle": "",
      //   "leftQRcode": "LV6115904911008120615000002f90000031f0000000042760988xbH+XMVPQiyxH1kzQo+tDQ==:**********:1:1:1:水上樂園門",
      //   "sellerLogo": "",
      //   "requireTaxSaleAmount": 761,
      //   "barCode": "11008LV611590490615",
      //   "amusementTaxAmount": 0,
      //   "untaxedSaleAmount": 761,
      //   "status": "SUCCESS"
      // }

      var printObj = {
        Logo: "C:\\ITKiosk\\html\\img\\invoice-name.bmp",
        //公司名稱
        SellCompanyName: "C:\\ITKiosk\\html\\img\\invoice-name.bmp",
        //發票期間
        InvoicePeriod: item.invoicePeriod,
        //發票號碼
        InvoiceNo:
          item.invoiceNumber.substring(0, 2) +
          "-" +
          item.invoiceNumber.substring(2),
        //列印時間
        InvoiceTime: moment(item.issueDate, "YYYYMMDDHHmmss").format(
          "YYYY/MM/DD HH:mm:ss"
        ),
        Formate: "",
        //隨機碼
        RandomCode: item.randomNumber,
        //發票總計(不含娛樂稅額amusementTaxAmount)
        InvoiceAmount: item.invoiceAmount.toString(),
        //賣方統編
        SellCode: item.sellerVatNumber,
        //買方統編
        BuyerCode: item.buyerVatNumber,
        //一維條碼
        BarCode: item.barCode,
        //旅安新增qr_code_left和qr_code_right欄位
        //電子發票qrcode1
        QRCode1: item.leftQRcode,
        //電子發票qrcode2
        QRCode2: item.rightQRcode,
        //信用卡號
        CreditCardL4: "",
        //發票總計
        TotalAmount: "1",
        //淨發票金額(發票主檔未稅總計)
        NetInvoiceAmount: "2",
        //發票主檔稅額
        InvoiceTax: "3",
        //發票主檔應稅銷售額
        InvoiceYesTaxAmount: "4",
        Remark1: "5",
        Remark2: "6",
        Remark3: "7",
        Remark4: "8",
        //公司住址
        SellCompanyAddress: "9",
        //商店
        Store: "10",
        //機台
        Machine: "11",
        Seq: "12",
        Memo1: "",
        Memo2: "",
        // "map_source": "C:\\ITKiosk\\html\\img\\bank.png",
        // "map_dest": "C:\\ITKiosk\\html\\img\\logo.bmp",
        // //列印時間
        // "DetailTime": invicetime,
        // //交易明細
        // "ItemList": list
      };
      if (item.amusementTaxAmount && item.amusementTaxAmount != 0) {
        printObj.Memo1 = "代徵娛樂稅 " + item.amusementTaxAmount;
      }
      if (item.exemptionAmount && item.exemptionAmount != 0) {
        printObj.Memo2 = "免開發票金額 " + item.exemptionAmount;
      }
      WriteLog("ElecPrint Request : " + JSON.stringify(printObj));
      return new Promise(function (resolve, reject) {
        kiosk.API.Device.Thermal.OnlyInvoice(
          deviceName,
          function (res) {
            WriteLog("ElecPrint Result : " + JSON.stringify(res));
            kiosk.systemSetting.ReceiptPrinterNearEndPrintCount++;
            commonExt.setJson("systemSetting", kiosk.systemSetting);
            resolve(res);
          },
          JSON.stringify(printObj)
        );
      });
    },
    ElecPrintWithDetail: function (deviceName, item, detailItem, recall) {
      // var item = {
      //   Logo: "C:\\ITKiosk\\html\\img\\invoice-name.bmp",
      //   // 公司名稱
      //   SellCompanyName: "C:\\ITKiosk\\html\\img\\invoice-name.bmp",
      //   // 發票期間
      //   InvoicePeriod: item.invoicePeriod,
      //   // 發票號碼
      //   InvoiceNo:
      //     item.invoiceNumber.substring(0, 2) +
      //     "-" +
      //     item.invoiceNumber.substring(2),
      //   // 列印時間
      //   InvoiceTime: moment(item.issueDate, "YYYYMMDDHHmmss").format(
      //     "YYYY/MM/DD HH:mm:ss"
      //   ),
      //   Formate: "",
      //   // 隨機碼
      //   RandomCode: item.randomNumber,
      //   // 發票總計
      //   InvoiceAmount: item.invoiceAmount.toString(),
      //   // 賣方統編
      //   SellCode: item.sellerVatNumber,
      //   // 買方統編
      //   BuyerCode: item.buyerVatNumber,
      //   // 一維條碼
      //   BarCode: item.barCode,
      //   // 旅安新增qr_code_left和qr_code_right欄位
      //   // 電子發票qrcode1
      //   QRCode1: item.leftQRcode,
      //   // 電子發票qrcode2
      //   QRCode2: item.rightQRcode,
      //   // 信用卡號
      //   CreditCardL4: "",
      //   // 發票總計
      //   TotalAmount: "1",
      //   // 淨發票金額(發票主檔未稅總計)
      //   NetInvoiceAmount: "2",
      //   // 發票主檔稅額
      //   InvoiceTax: "3",
      //   // 發票主檔應稅銷售額
      //   InvoiceYesTaxAmount: "4",
      //   Remark1: "5",
      //   Remark2: "6",
      //   Remark3: "7",
      //   Remark4: "8",
      //   // 公司住址
      //   SellCompanyAddress: "9",
      //   // 商店
      //   Store: "10",
      //   // 機台
      //   Machine: "11",
      //   Seq: "12",
      //   Memo1: "",
      //   Memo2: "",

      //   // 交易明細
      //   ItemList: [
      //     { ItemName: "[部份免開發票]單次核銷X無庫存" },
      //     { ItemName: " 全票 $150 * 1" },
      //     { ItemName: " 全票 $150 * 1" },
      //   ],
      //   CompanyShotName: kiosk.systemSetting.merchantName,
      //   OrderNo: "PN130923303",
      //   TransTime: moment(detailItem.paidDate, "YYYYMMDDHHmm").format(
      //     "YYYY-MM-DD HH:mm"
      //   ),
      //   KioskName: kiosk.systemSetting.deviceName,
      //   PayTypeName:
      //     detailItem.paymentSettingList[0].name +
      //     " $" +
      //     detailItem.paymentSettingList[0].price,
      //   InvoiceCarrier: detailItem.invoiceData.invoiceDeviceTypeName,
      //   DetailMemo1: "",
      //   DetailMemo2: "",
      //   DetailMemo3: "",
      //   DetailMemo4: "",
      //   DetailReturnMemoList: [
      //     { ItemName: "依消費者保護法之規定，線上購物" },
      //     { ItemName: "消費者享有商品貨到日起七天內(" },
      //     { ItemName: "含例假日)消費者有猶豫期的權益" },
      //   ],
      //   PrintTime: moment().format("YYYY-MM-DD HH:mm"),
      // };

      // var detailItem = JSON.parse(JSON.stringify(detailItemSource));

      var printObj = {
        Logo: "C:\\ITKiosk\\html\\img\\invoice-name.bmp",
        // 公司名稱
        SellCompanyName: "C:\\ITKiosk\\html\\img\\invoice-name.bmp",
        // 發票期間
        InvoicePeriod: item.invoicePeriod,
        // 發票號碼
        InvoiceNo:
          item.invoiceNumber.substring(0, 2) +
          "-" +
          item.invoiceNumber.substring(2),
        // 列印時間
        InvoiceTime: moment(item.issueDate, "YYYYMMDDHHmmss").format(
          "YYYY/MM/DD HH:mm:ss"
        ),
        Formate: "",
        // 隨機碼
        RandomCode: item.randomNumber,
        // 發票總計
        InvoiceAmount: item.invoiceAmount.toString(),
        // 賣方統編
        SellCode: item.sellerVatNumber,
        // 買方統編
        BuyerCode: item.buyerVatNumber ? item.buyerVatNumber : "",
        // 一維條碼
        BarCode: item.barCode,
        // 旅安新增qr_code_left和qr_code_right欄位
        // 電子發票qrcode1
        QRCode1: item.leftQRcode,
        // 電子發票qrcode2
        QRCode2: item.rightQRcode,
        // 信用卡號
        CreditCardL4: "",
        // 發票總計
        TotalAmount: "1",
        // 淨發票金額(發票主檔未稅總計)
        NetInvoiceAmount: "2",
        // 發票主檔稅額
        InvoiceTax: "3",
        // 發票主檔應稅銷售額
        InvoiceYesTaxAmount: "4",
        Remark1: "5",
        Remark2: "6",
        Remark3: "7",
        Remark4: "8",
        // 公司住址
        SellCompanyAddress: "9",
        // 商店
        Store: "10",
        // 機台
        Machine: "11",
        Seq: "12",
        Memo1: "",
        Memo2: "",
      };

      // ---發票 start---
      if (item.amusementTaxAmount && item.amusementTaxAmount != 0) {
        printObj.Memo1 = "代徵娛樂稅 " + item.amusementTaxAmount;
      }
      if (item.exemptionAmount && item.exemptionAmount != 0) {
        printObj.Memo2 = "免開發票金額 " + item.exemptionAmount;
      }
      // ---發票 end---

      // // ---交易明細 start---
      // var groupBy = function (xs, key) {
      //   return xs.reduce(function (rv, x) {
      //     (rv[x[key]] = rv[x[key]] || []).push(x);
      //     return rv;
      //   }, {});
      // };
      // var itemList = groupBy(detailItem.productOrderList, "productName");
      // var sfstrlenLimit = 28,
      //   ticketStrlenLimit = 30;

      // var tag = "└",
      //   count = 0;
      // function updateItemList(string, index) {
      //   // var ilStrLength = 29;
      //   if (index) {
      //     var temp = printObj.ItemList[index].ItemName + string;
      //     if (sfstrlen(temp) > sfstrlenLimit) {
      //       var tmpSplit = sfTSCPrintFormat(temp, [], sfstrlenLimit);
      //       for (var i = 0; i < tmpSplit.length; i++) {
      //         printObj.ItemList[index + i].ItemName = tmpSplit[i];
      //       }
      //     } else {
      //       printObj.ItemList[index].ItemName = temp + string;
      //     }
      //   } else {
      //     if (sfstrlen(string) > sfstrlenLimit) {
      //       var tmpSplit = sfTSCPrintFormat(string, [], sfstrlenLimit);
      //       for (var i = 0; i < tmpSplit.length; i++) {
      //         printObj.ItemList.push({ ItemName: tmpSplit[i] });
      //       }
      //     } else {
      //       printObj.ItemList.push({ ItemName: string });
      //     }
      //   }
      //   return printObj.ItemList.length - 1;
      // }

      // for (var k in itemList) {
      //   updateItemList(k);
      //   // item.generateStr += k + "\r\n";
      //   for (var p = 0; p < itemList[k].length; p++) {
      //     if (itemList[k][p].dateMode == "RESERVATION") {
      //       var level2 = groupBy(itemList[k], "bookingSpecName");
      //       // alert(JSON.stringify(level2))
      //       for (var lv in level2) {
      //         var index = updateItemList(
      //           " " + tag + lv + " " + level2[lv][0].sessionRange
      //         );
      //         // item.generateStr +=
      //         //   " " + tag + lv + " " + level2[lv][0].sessionRange;

      //         switch (kiosk.systemSetting.lang) {
      //           case "zh_TW":
      //             var Seat = " | 座位: ";
      //             break;

      //           default:
      //             var Seat = " | Seat: ";
      //             break;
      //         }
      //         var lvLength = level2[lv].length;
      //         var ifSeatAvail = false;
      //         for (let i = 0; i < lvLength; i++) {
      //           if (level2[lv][i].seatLabel !== "") {
      //             if (!ifSeatAvail) {
      //               ifSeatAvail = true;
      //               var index = updateItemList(Seat, index);
      //               // item.generateStr += Seat;
      //             }
      //             i === 0
      //               ? updateItemList(level2[lv][i].seatLabel, index)
      //               : updateItemList("," + level2[lv][i].seatLabel, index);
      //             // i === 0
      //             //   ? (item.generateStr += level2[lv][i].seatLabel)
      //             //   : (item.generateStr += "," + level2[lv][i].seatLabel);
      //           }
      //         }
      //         // item.generateStr += "\r\n";

      //         for (var lv3 in level2[lv]) {
      //           count += level2[lv][lv3].purchaseQuantity;
      //           tmpItemTitle = "  " + tag + level2[lv][lv3].ticketTypeName;
      //           tmpItemEnd =
      //             "$" +
      //             level2[lv][lv3].salePrice +
      //             " * " +
      //             level2[lv][lv3].purchaseQuantity;
      //           updateItemList(
      //             sfPaddingStr(
      //               tmpItemTitle,
      //               tmpItemEnd,
      //               ticketStrlenLimit,
      //               true
      //             )
      //           );
      //           // item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
      //           if (
      //             level2[lv][lv3].bundleProductOrderList &&
      //             level2[lv][lv3].bundleProductOrderList.length != 0
      //           ) {
      //             for (var d in level2[lv][lv3].bundleProductOrderList) {
      //               tmpItemTitle =
      //                 "   " +
      //                 tag +
      //                 level2[lv][lv3].bundleProductOrderList[d].productName +
      //                 " - " +
      //                 level2[lv][lv3].bundleProductOrderList[d].ticketTypeName;
      //               tmpItemEnd =
      //                 " * " +
      //                 level2[lv][lv3].bundleProductOrderList[d].quantity;
      //               updateItemList(
      //                 sfPaddingStr(
      //                   tmpItemTitle,
      //                   tmpItemEnd,
      //                   ticketStrlenLimit,
      //                   true
      //                 )
      //               );
      //               // item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
      //               // // item.generateStr += '  ' + tag + itemList[k][p].bundleProductOrderList[d].productName + ' * ' + itemList[k][p].bundleProductOrderList[d].quantity + '\r\n';
      //             }
      //           }
      //         }
      //       }
      //       p = itemList[k].length;
      //     } else {
      //       count += itemList[k][p].purchaseQuantity;
      //       tmpItemTitle = " " + tag + itemList[k][p].ticketTypeName;
      //       tmpItemEnd =
      //         "$" +
      //         itemList[k][p].salePrice +
      //         " * " +
      //         itemList[k][p].purchaseQuantity;
      //       updateItemList(
      //         sfPaddingStr(tmpItemTitle, tmpItemEnd, ticketStrlenLimit, true)
      //       );
      //       // item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
      //       if (
      //         itemList[k][p].bundleProductOrderList &&
      //         itemList[k][p].bundleProductOrderList.length != 0
      //       ) {
      //         for (var d in itemList[k][p].bundleProductOrderList) {
      //           tmpItemTitle =
      //             "  " +
      //             tag +
      //             itemList[k][p].bundleProductOrderList[d].productName +
      //             " - " +
      //             itemList[k][p].bundleProductOrderList[d].ticketTypeName;
      //           tmpItemEnd =
      //             " * " + itemList[k][p].bundleProductOrderList[d].quantity;
      //           updateItemList(
      //             sfPaddingStr(
      //               tmpItemTitle,
      //               tmpItemEnd,
      //               ticketStrlenLimit,
      //               true
      //             )
      //           );
      //           // item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
      //           // // item.generateStr += '  ' + tag + itemList[k][p].bundleProductOrderList[d].productName + ' * ' + itemList[k][p].bundleProductOrderList[d].quantity + '\r\n';
      //         }
      //       }
      //     }
      //   }
      // }

      // if (
      //   detailItem.invoiceData.invoiceDeviceType === "MOBILE" &&
      //   detailItem.invoiceData.invoiceDeviceCode
      // ) {
      //   printObj.InvoiceCarrier +=
      //     " " + detailItem.invoiceData.invoiceDeviceCode;
      // }

      // // 金額為0時改為字串避免沒印出金額
      // if (detailItem.totalPrice === 0) {
      //   var totalPrice = "0";
      // } else {
      //   var totalPrice = detailItem.totalPrice;
      // }
      // printObj.DetailMemo1 += "合計 " + count + " 項 | 應收總額 $" + totalPrice;

      // if (detailItem.invoiceData.untaxedSaleAmount != 0) {
      //   printObj.DetailMemo2 +=
      //     "未稅銷售額 " + detailItem.invoiceData.untaxedSaleAmount;
      // }
      // if (detailItem.invoiceData.invoiceTaxAmount != 0) {
      //   printObj.DetailMemo2 +=
      //     " " + "稅額 " + detailItem.invoiceData.invoiceTaxAmount;
      // }
      // if (detailItem.invoiceData.amusementTaxAmount != 0) {
      //   printObj.DetailMemo3 +=
      //     "代徵娛樂稅 " + detailItem.invoiceData.amusementTaxAmount;
      // }
      // if (detailItem.invoiceData.exemptionAmount != 0) {
      //   printObj.DetailMemo4 +=
      //     "免開發票金額 " + detailItem.invoiceData.exemptionAmount;
      // }
      // if (
      //   detailItem.refundDescription != null &&
      //   detailItem.refundDescription.split("\r\n").length > 0
      // ) {
      //   var rdData = detailItem.refundDescription.split("\r\n");
      //   // rdStrLength = 29;
      //   for (var i = 0; i < rdData.length; i++) {
      //     if (sfstrlen(rdData[i]) > sfstrlenLimit) {
      //       tmpSplit = sfTSCPrintFormat(rdData[i], [], sfstrlenLimit);
      //       for (var i = 0; i < tmpSplit.length; i++) {
      //         printObj.DetailReturnMemoList.push({ ItemName: tmpSplit[i] });
      //       }
      //     } else {
      //       printObj.DetailReturnMemoList.push({ ItemName: rdData[i] });
      //     }
      //   }
      // }

      // if (recall) {
      //   printObj.PrintTime += " 補印";
      // } else {
      //   printObj.PrintTime += " 印";
      // }
      // // ---交易明細 end---

      // WriteLog("ElecPrintWithDetail Request : " + JSON.stringify(printObj));
      // return new Promise(function (resolve, reject) {
      //   kiosk.API.Device.Thermal.ElecPrint2(
      //     deviceName,
      //     function (res) {
      //       WriteLog("ElecPrintWithDetail Result : " + JSON.stringify(res));
      //       resolve(res);
      //     },
      //     JSON.stringify(printObj)
      //   );
      // });
      WriteLog(
        "ElecPrintWithDetail(Elec) Request : " + JSON.stringify(printObj)
      );
      return new Promise(function (resolve, reject) {
        kiosk.API.Device.Thermal.ElecPrint2(
          deviceName,
          function (res) {
            WriteLog(
              "ElecPrintWithDetail(Elec) Result : " + JSON.stringify(res)
            );
            kiosk.systemSetting.ReceiptPrinterNearEndPrintCount++;
            commonExt.setJson("systemSetting", kiosk.systemSetting);
            setTimeout(function () {
              WriteLog(
                "ElecPrintWithDetail(Detail) Request : " +
                  JSON.stringify(detailItem)
              );
              printDetails(kiosk.BESync.ReveivePrinterName, detailItem, recall)
                .then(function (res) {
                  WriteLog(
                    "ElecPrintWithDetail(Detail) Result : " +
                      JSON.stringify(res)
                  );
                  resolve(res);
                })
                .catch(function (msg) {
                  reject(msg);
                });
            }, 200);
          },
          JSON.stringify(printObj)
        );
      });
    },
    converterError: function (res, printerName) {
      try {
        // TSP-247:
        // "retCode":0,"msg":"Normal
        // "retCode":1,"msg":"Head opened"
        // "retCode":2,"msg":"Paper Jam" (要列印時抓不到任何紙張，可能是卡紙或是完全沒紙)
        // "retCode":3,"msg":"Paper Jam and head opened"
        // "retCode":4,"msg":"Out of Paper" (印到一半沒紙，如:要印10張，但印表機只剩五張)
        // "retCode":5,"msg":"Out of paper and head opened"
        // "retCode":32,"msg":"Printing"
        // "retCode":255,"msg":"No Device!" (線沒插好或電源沒開)

        if (printerName && printerName === "TSP-247") {
          switch (res.retCode) {
            case 1:
              return "上蓋開啟";
            case 3:
              return "上蓋開啟";
            case 5:
              return "上蓋開啟";

            case 2:
              return "紙張異常";
            case 4:
              return "紙張用盡";

            case 255:
              return "連接異常";

            default:
              WriteLog(printerName + " 裝置異常:" + JSON.stringify(res));
              return "裝置異常(" + (res.retCode ? res.retCode : "00") + ")";
          }
        }
        // 以上目前僅針對TSP-247額外判斷，其他熱感印表機共用以下判斷
        else if (res.IsSuccess && res.IsNearEnd) {
          return "紙張將盡"; // 紙捲低水位
        } else {
          // 異常判斷清單(不含紙捲低水位)
          var ErrorList = {
            "0003": ["上蓋開啟", ["ErrorCodeExtended: 201"]], // 上蓋開啟
            "0002": ["紙張用盡", ["ErrorCodeExtended: 203"]], // 偵測不到紙捲
            "0001": [
              "連接異常",
              ["ErrorCodeExtended: 0", "Print is Not Ready"],
            ], // 線沒插好或電源沒開
            "01": ["裝置異常(01)", ["ErrorCode: Illegal"]], // 因裝置狀態或其他原因導致的command illegal，案場遇到時先檢查裝置狀態
          };

          var errCode = "00";
          // 從清單的Keyword判斷當前Error狀態
          for (
            var keyArr = Object.keys(ErrorList), length = keyArr.length, i = 0;
            i < length;
            i++
          ) {
            var array = ErrorList[keyArr[i]][1];
            array.forEach(function (ele) {
              if (res.Error.indexOf(ele) != -1) {
                errCode = keyArr[i];
              }
            });
            if (errCode !== "00") break;
          }

          // 根據清單return異常文字
          // 若發生非預期異常時額外寫Log，確保留下紀錄(若沒有AddActionLog也仍有WriteLog)
          if (errCode !== "00") {
            return ErrorList[errCode][0];
          } else {
            // 非預期異常
            WriteLog(
              printerName + " 裝置異常(" + errCode + "):" + JSON.stringify(res)
            );
            return "裝置異常(" + errCode + ")";
          }
        }
      } catch (err) {
        WriteLog(
          printerName +
            " 裝置異常(" +
            errCode +
            ") - tryCatch error:" +
            JSON.stringify(res)
        );
        return "裝置異常(" + errCode + ")";
      }
    },
  },
  CashBox: {
    /**
     * @param {String} ComPort 現金模組ComPort
     */
    openDevice: function () {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox openDevice req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.openDevice(function (res) {
          // Success
          BackEnd.AddActionLog(
            "3",
            "CashBox openDevice res",
            JSON.stringify(res)
          );
          if (res.IsSuccess) {
            resolve(res);
          } else {
            reject(res);
          }
        }, "COM3");
      });
    },
    deviceStatus: function () {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox deviceStatus req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.deviceStatus(function (res) {
          // Success
          BackEnd.AddActionLog(
            "3",
            "CashBox deviceStatus res",
            JSON.stringify(res)
          );
          if (res.IsSuccess) {
            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    paymentStatus: function () {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox paymentStatus req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.paymentStatus(function (res) {
          // Success
          BackEnd.AddActionLog(
            "3",
            "CashBox paymentStatus res",
            JSON.stringify(res)
          );
          if (res.IsSuccess) {
            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    /**
     * @param {String} transAmount 交易金額
     */
    begPayment: function (transAmount) {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox begPayment req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.begPayment(function (res) {
          // Success
          BackEnd.AddActionLog(
            "3",
            "CashBox begPayment res",
            JSON.stringify(res)
          );
          if (res.IsSuccess) {
            resolve(res);
          } else {
            reject(res);
          }
        }, transAmount);
      });
    },
    endPayment: function () {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox endPayment req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.endPayment(function (res) {
          // Success
          BackEnd.AddActionLog(
            "3",
            "CashBox endPayment res",
            JSON.stringify(res)
          );
          if (res.IsSuccess) {
            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    cancelPayment: function () {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox cancelPayment req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.cancelPayment(function (res) {
          // Success
          BackEnd.AddActionLog(
            "3",
            "CashBox cancelPayment res",
            JSON.stringify(res)
          );
          if (res.IsSuccess) {
            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
    /**
     * @param {String} NdNumber 退鈔機鈔票數量
     */
    setNdNumber: function (NdNumber) {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox setNdNumber req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.setNdNumber(
          function (res) {
            // Success
            BackEnd.AddActionLog(
              "3",
              "CashBox setNdNumber res",
              JSON.stringify(res)
            );
            if (res.IsSuccess) {
              resolve(res);
            } else {
              reject(res);
            }
          },
          NdNumber,
          0
        );
      });
    },
    closeDevice: function () {
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          "CashBox closeDevice req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.CashBox.closeDevice(function (res) {
          // Success
          BackEnd.AddActionLog(
            "3",
            "CashBox closeDevice res",
            JSON.stringify(res)
          );
          if (res.IsSuccess) {
            resolve(res);
          } else {
            reject(res);
          }
        });
      });
    },
  },
  FIN: {
    /**
     * @param {String} CardType 卡片類別
     * 信用卡: 01
     * 銀聯卡: 02
     * 電子票證: 03
     * @param {String} trans_amt 交易金額
     */
    CTBCPayment: function (trans_type, host_id, trans_amt) {
      // var trans_type = '';
      // var host_id = '';
      // switch (CardType) {
      //   case '01':
      //     trans_type = '01';
      //     host_id = '01';
      //     break;
      //   case '02':
      //     trans_type = '01';
      //     host_id = '04';
      //     break;
      //   case '03':
      //     trans_type = '21';
      //     host_id = '20';
      //     break;
      // }
      var transBEName = "";
      if (trans_type === "01") {
        transBEName = "CTBC 呼叫信用卡機";
      } else if (trans_type === "21") {
        transBEName = "CTBC 呼叫票證卡機";
      }
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          transBEName + "req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.FIN.CTBC_SL_PAYMENT(
          function (res) {
            // Success
            BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
            if (res.IsSuccess) {
              resolve(res);
            } else {
              reject(res);
            }
          },
          function (e) {
            // Fail
            reject(e);
          },
          trans_type,
          host_id,
          undefined,
          undefined,
          kiosk.systemSetting.StoreId,
          trans_amt
        );
      });
    },
    /**
     * @param {String} CardType 卡片類別
     * 信用卡: 01
     * 銀聯卡: 02
     * 電子票證: 03
     * @param {String} trans_amt 交易金額
     */
    POSRefund: function (host_id, trans_amt, invoice_no, card_no) {
      var trans_type = "";
      // var host_id = '';
      var transBEName = "";
      switch (host_id) {
        case "01":
          trans_type = "02";
          transBEName = "CTBC 呼叫信用卡機退款";
          break;
        case "20":
          trans_type = "22";
          transBEName = "CTBC 呼叫票證卡機退款";
          break;
      }
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          transBEName + "req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.FIN.CTBC_SL_PAYMENT(
          function (res) {
            // Success
            BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
            if (res.IsSuccess) {
              resolve(res);
            } else {
              reject(res);
            }
          },
          function (e) {
            // Fail
            reject(e);
          },
          trans_type,
          host_id,
          invoice_no,
          card_no,
          kiosk.systemSetting.StoreId,
          trans_amt
        );
      });
    },
    // === 中信信用卡結帳交易 ===
    CTBCSettle: function (PayTypes) {
      return new Promise(function (resolve, reject) {
        var delayTime = 10000;
        var isSettleSuccess = true;
        var settleFailHostIdArr = [];

        var transType = "50";

        BackEnd.AddActionLog(
          "3",
          "CTBC 卡機結帳req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );

        function checkRes(res, paymentHostId, logText) {
          try {
            BackEnd.AddActionLog("3", "CTBC 卡機結帳res", JSON.stringify(res));
            if (!res.IsSuccess) {
              isSettleSuccess = false;
              settleFailHostIdArr.push(paymentHostId);
              WriteLog(logText + ": " + JSON.stringify(res));
            }
          } catch (error) {
            WriteLog("CTBC 卡機結帳 checkRes error: " + JSON.stringify(error));
          }
        }

        var settleCount = 0;
        function processPayments(index) {
          if (index >= PayTypes.length) {
            // 所有PayType處理完畢
            if (isSettleSuccess) {
              resolve();
            } else {
              reject(settleFailHostIdArr);
            }
            return;
          }

          var PayType = PayTypes[index];
          if (PayType.PayTypeAction == "CTBC") {
            var settle = false;
            var hostId = "";
            var type = "";

            switch (PayType.PayMachineParameter) {
              case "01@01":
                type = "信用卡";
                hostId = "01";
                settle = true;
                break;

              case "21@21":
                type = "悠遊卡";
                hostId = "21";
                settle = true;
                break;

              case "21@23":
                type = "一卡通";
                hostId = "23";
                settle = true;
                break;

              // hostId 11:美國運通卡(目前TVM中信卡機無使用美國運通卡)
            }

            if (settle) {
              // 若符合條件，則呼叫卡機結帳，並在完成後處理下一個PayType
              settleCount++;

              setTimeout(
                function (res) {
                  kiosk.API.Device.FIN.CTBC_SL_PAYMENT(
                    function (res) {
                      checkRes(res, hostId, "CTBC 卡機" + type + "結帳失敗");
                      processPayments(index + 1);
                    },
                    function () {},
                    transType,
                    hostId,
                    undefined,
                    undefined,
                    kiosk.systemSetting.StoreId,
                    undefined
                  );
                },
                settleCount > 1 ? delayTime : 0
              );
            } else {
              // 若非需要結帳的支付類型，則處理下一個PayType
              processPayments(index + 1);
            }
          } else {
            // 若非正確收單行，則處理下一個PayType
            processPayments(index + 1);
          }
        }

        processPayments(0);
      });
    },
    /**
     * 故宮-中國信託
     * @param trans_type 交易類別 信用卡/紅利抵用/分期/銀聯 銷售:01; 退貨:02; 取消:30; 結帳:50; 票證 銷售:21; 退貨:22; 餘額查詢:23; 現金加值:24; 取消:25; 查詢前一筆成功交易:26; 重試一次:27; 結帳:50
     * @param host_id 授權銀行編碼 EDC進行交易模式選擇：00 ; 01 信用卡 ; 04 銀聯卡 ; 20電子票證–自動選卡
     * @param invoice_no 調閱編號
     * @param card_no 卡號 - 電子票證退貨需要
     * @param store_id 櫃號
     * @param trans_amt 扣款金額
     */
    CtbcSymlink: function (
      trans_type,
      host_id,
      invoice_no,
      card_no,
      store_id,
      trans_amt
    ) {
      kiosk.API.Device.FIN.CTBC_SL_PAYMENT(
        function (res) {
          // alert(JSON.stringify(res));
        },
        function () {},
        trans_type,
        host_id,
        invoice_no,
        card_no,
        store_id,
        trans_amt
      );
    },

    // === 聯合信用卡一般交易 ===
    // ECR_Indicator --> 'I'
    // TransType_Indicator --> ''
    // TransType --> '01'
    // CUP_SP_ESVC --> 'C' 銀聯卡；'N' 一般信用卡交易 ;'E' 票證卡 ;'S' Smart Pay 交易
    // HostID --> '03' 信用卡; '06' 票證卡
    // 交易金額 --> '100' 後 2 位是小數點，所以這是 1 元
    // 交易日期 (格式為西元年 YYMMDD)
    // 交易時間 (二十四小時制 hhmmss)
    NCCCPayment: function (trans_type, trans_amt, stime, etime) {
      trans_amt = trans_amt + "00";
      var transBEName = "";
      var HostID = "03";
      if (trans_type === "N") {
        HostID = "03";
        transBEName = "NCCC 呼叫信用卡機";
      } else if (trans_type === "E") {
        HostID = "06";
        transBEName = "NCCC 呼叫票證卡機";
      }
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          transBEName + "req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.FIN.NCCCPayment(
          function (res) {
            WriteLog("NCCCPayment ：" + JSON.stringify(res));
            BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
            if (res.IsSuccess) {
              resolve(JSON.parse(res.resultJson));
            } else {
              reject(res.Error);
            }
          },
          function () {},
          // 'I', '', '01', trans_type, '03', trans_amt, stime, etime
          "I",
          "",
          "01",
          trans_type,
          HostID,
          trans_amt,
          stime,
          etime,
          ""
        );
      });
    },
    // === 聯合信用卡退款 ===
    // ECR_Indicator --> 'I'
    // TransType_Indicator --> ''
    // TransType --> '01'
    // CUP_SP_ESVC --> 'C' 銀聯卡；'N' 一般信用卡交易；'E' 票證卡
    // HostID --> '03' 主機別, '06' 票證主機
    // 交易金額 --> '100' 後 2 位是小數點，所以這是 1 元
    // 交易日期 (格式為西元年 YYMMDD)
    // 交易時間 (二十四小時制 hhmmss)
    // [票證退款需要] Origin Dtte
    // [票證退款需要] Origin RRN
    NCCCRefund: function (
      trans_type,
      trans_amt,
      stime,
      etime,
      oriDate,
      sp_Origin_RRN,
      ApprovalNo
    ) {
      trans_amt = trans_amt + "00";
      var HostID = "03";
      var transBEName = "";
      if (trans_type === "N") {
        HostID = "03";
        transBEName = "NCCC 呼叫信用卡機 退款";
      } else if (trans_type === "E") {
        HostID = "06";
        transBEName = "NCCC 呼叫票證卡機 退款";
      }
      return new Promise(function (resolve, reject) {
        BackEnd.AddActionLog(
          "3",
          transBEName + "req",
          JSON.stringify({
            trans_type: trans_type,
            trans_amt: trans_amt,
            stime: stime,
            etime: etime,
            oriDate: oriDate,
            sp_Origin_RRN: sp_Origin_RRN,
            ApprovalNo: ApprovalNo,
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.FIN.NCCCRefund(
          function (res) {
            BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
            WriteLog("NCCCRefund ：" + JSON.stringify(res));
            if (res.IsSuccess) {
              resolve(JSON.parse(res.resultJson));
            } else {
              reject(res.Error);
            }
          },
          function () {},
          // 'I', '', '01', trans_type, '03', trans_amt, stime, etime
          "I",
          "",
          "02",
          trans_type,
          "",
          trans_amt,
          stime,
          etime,
          "",
          "20" + oriDate,
          sp_Origin_RRN,
          ApprovalNo
        );

        // kiosk.API.Device.FIN.NCCCRefund(
        //   function (res) {
        //     alert(JSON.stringify(res));
        //     WriteLog("聯信退款資訊：" + JSON.stringify(res));
        //   },
        //   function () {},
        //   'I', '', '02', 'E', '', '300', '210826', '192300', '', '20210826', '333333'
        // );
      });
    },
    // === 聯合信用卡結帳交易 ===
    NCCCSettle: function (PayTypes) {
      var date = moment().format("YYMMDD");
      var time = moment().format("HHmmss");
      return new Promise(function (resolve, reject) {
        var delayTime = 10000;
        var isSettleSuccess = true;
        var settleFailHostIdArr = [];

        BackEnd.AddActionLog(
          "3",
          "NCCC 卡機結帳req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );

        for (var i = 0; i < PayTypes.length; i++) {
          var PayType = PayTypes[index];
          if (PayType.PayTypeAction == "NCCC") {
            var settle = false;
            var hostId = "";
            var type = "";

            switch (PayType.PayMachineParameter) {
              case "N@03":
                type = "信用卡";
                hostId = "03";
                settle = true;
                break;
            }
          }
        }

        kiosk.API.Device.FIN.NCCCSettle(
          function (res) {
            BackEnd.AddActionLog("3", "NCCC 卡機結帳res", JSON.stringify(res));
            if (res.IsSuccess) {
              resolve();
            } else {
              // isSettleSuccess = false;
              settleFailHostIdArr.push(hostId);
              WriteLog("NCCC " + type + "結帳失敗: " + JSON.stringify(res));
              reject(settleFailHostIdArr);
            }
          },
          function () {
            reject();
          },
          // 'I', '', '03', '210326', '073100'
          "I",
          "",
          "",
          date,
          time
        );
      });
    },

    CTBCS3Payment: function (trans_amt) {
      return new Promise(function (resolve, reject) {
        kiosk.API.Device.FIN.CTBCPayment_S3(
          function (res) {
            alert(JSON.stringify(res));
            WriteLog(JSON.stringify(res));
          },
          function () {},
          trans_amt,
          "STOREID123",
          "01"
        );
      });
    },

    /**
     * 永豐卡機
     * @param TransType 交易類別 銷售:01; 悠遊卡購貨:71; 悠遊卡退貨:72
     * @param HostID 授權銀行 大來卡:00; 美國運通:01; 永豐:02; 財金:03; 永豐分期:04; 悠遊卡:05; 一卡通:06
     * @param TransAmount 交易金額
     * @param ApprovalNo 卡號 - 電子票證退貨需要
     * @param invoiceType 發票類別 不使用:0; 發票載具1代:1; 發票載具2代:2
     */
    SINOPACPayment: function (trans_type, trans_amt) {
      return new Promise(function (resolve, reject) {
        var transBEName = "";
        var transMode = "01";
        var HostID = "";
        var ticketType = "4";
        if (trans_type === "N") {
          transMode = "01";
          HostID = "";
          ticketType = "4";
          transBEName = "SINOPAC 呼叫信用卡機";
        } else if (trans_type === "E") {
          transMode = "71";
          HostID = "05";
          ticketType = "1";
          transBEName = "SINOPAC 呼叫票證卡機";
        }
        BackEnd.AddActionLog(
          "3",
          transBEName + "req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.FIN.SINOPAC_PAYMENT(
          function (res) {
            BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
            if (res.IsSuccess) {
              resolve(JSON.parse(res.resultJson));
            } else {
              reject(res.Error);
            }
          },
          function () {},
          transMode,
          HostID,
          trans_amt,
          "",
          "0",
          ticketType
        );
      });
    },
    SINOPACSettle: function (PayTypes) {
      return new Promise(function (resolve, reject) {
        var delayTime = 10000;
        var isSettleSuccess = true;
        var settleFailHostIdArr = [];

        BackEnd.AddActionLog(
          "3",
          "SINOPAC 卡機結帳req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );

        function checkRes(res, paymentHostId, logText) {
          try {
            BackEnd.AddActionLog(
              "3",
              "SINOPAC 卡機結帳res",
              JSON.stringify(res)
            );
            if (!res.IsSuccess) {
              isSettleSuccess = false;
              settleFailHostIdArr.push(paymentHostId);
              WriteLog(logText + ": " + JSON.stringify(res));
            }
          } catch (error) {
            WriteLog(
              "SINOPAC 卡機結帳 checkRes error: " + JSON.stringify(error)
            );
          }
        }

        var settleCount = 0;
        function processPayments(index) {
          if (index >= PayTypes.length) {
            // 所有PayType處理完畢
            if (isSettleSuccess) {
              resolve();
            } else {
              reject(settleFailHostIdArr);
            }
            return;
          }

          var PayType = PayTypes[index];
          if (PayType.PayTypeAction == "SINOPAC") {
            var settle = false;
            var transMode = "";
            var hostId = "";
            var type = "";

            switch (PayType.PayMachineParameter) {
              case "N@01":
                type = "信用卡";
                transMode = "51";
                hostId = "00";
                settle = true;
                break;

              case "E@71":
                type = "悠遊卡";
                transMode = "50";
                hostId = "05";
                settle = true;
                break;
            }

            if (settle) {
              // 若符合條件，則呼叫卡機結帳，並在完成後處理下一個PayType
              settleCount++;

              setTimeout(
                function (res) {
                  kiosk.API.Device.FIN.SINOPAC_SETTLE(
                    function (res) {
                      checkRes(res, hostId, "SINOPAC 卡機" + type + "結帳失敗");
                      processPayments(index + 1);
                    },
                    function () {},
                    transMode,
                    hostId,
                    "",
                    "",
                    "0",
                    "4" // ticketType (若transMode為51，因為永豐結帳沒有ticketType參數，所以ticketType要帶入1~3「以外」的數字)
                  );
                },
                settleCount > 1 ? delayTime : 0
              );
            } else {
              // 若非需要結帳的支付類型，則處理下一個PayType
              processPayments(index + 1);
            }
          } else {
            // 若非正確收單行，則處理下一個PayType
            processPayments(index + 1);
          }
        }

        processPayments(0);
      });
    },

    /**
     * 台新卡機
     * @param trans_type 交易類別 銷售:01; 結帳:50; 電子票證查詢:70; 電子票證購貨:71; 電子票證結帳:51;
     * @param trans_amount 交易金額
     * @param trans_no uniqueID trnasaction no (length 16)
     * @param Host_ID 電子票證類別 - 悠遊卡:51; 一卡通:52;
     */

    /**
     * @param {String} trans_mode 交易類別
     * N:信用卡
     * E:電子票證
     * @param {String} trans_amount 交易金額
     * @param {String} trans_no 訂單編號(16碼英數字混合，若不足16碼則TAISHIN_TVM_BANK_Parameter會自動補零，退款時使用)
     * @param {String} host_id 區別電子票證類別
     * 悠遊卡:51
     * 一卡通:52
     */
    TAISHINPayment: function (trans_mode, host_id, trans_amt, trans_no) {
      return new Promise(function (resolve, reject) {
        var transBEName = "";
        var function_name = "PAYMENT";
        var trans_type = "01";

        function AddReqActionLog() {
          BackEnd.AddActionLog(
            "3",
            transBEName + "req",
            JSON.stringify({
              member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
              app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
              localID: kiosk.status.serialNo,
              version: kiosk.BESync ? kiosk.BESync.Version : "",
            })
          );
        }

        function handleResult(res) {
          BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
          if (res.IsSuccess) {
            resolve(JSON.parse(res.resultJson));
          } else {
            reject(JSON.parse(res.resultJson));
          }
        }

        switch (trans_mode) {
          case "N":
            function_name = "PAYMENT";
            trans_type = "01";
            transBEName = "TAISHIN 呼叫信用卡機";
            AddReqActionLog();

            kiosk.API.Device.FIN.TAISHIN_TVM_BANK_Function(
              function (res) {
                handleResult(res);
              },
              function () {},
              function_name,
              trans_type,
              trans_amt,
              trans_no
            );
            break;

          case "E":
            trans_type = "71";
            transBEName = "TAISHIN 呼叫票證卡機";
            AddReqActionLog();

            kiosk.API.Device.FIN.TAISHIN_TVM_TICKET_Function(
              function (res) {
                handleResult(res);
              },
              function () {},
              trans_type,
              trans_amt,
              host_id
            );
            break;

          default:
            reject("付款失敗");
            break;
        }
      });
    },
    TAISHINSettle: function (PayTypes) {
      return new Promise(function (resolve, reject) {
        var delayTime = 10000;
        var isSettleSuccess = true;
        var settleFailHostIdArr = [];

        var transType_creditcard = "50";
        var transType_ETicket = "51";

        BackEnd.AddActionLog(
          "3",
          "TAISHIN 卡機結帳req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );

        function checkRes(res, paymentHostId, logText) {
          try {
            BackEnd.AddActionLog(
              "3",
              "TAISHIN 卡機結帳res",
              JSON.stringify(res)
            );
            if (!res.IsSuccess) {
              isSettleSuccess = false;
              settleFailHostIdArr.push(paymentHostId);
              WriteLog(logText + ": " + JSON.stringify(res));
            }
          } catch (error) {
            WriteLog(
              "TAISHIN 卡機結帳 checkRes error: " + JSON.stringify(error)
            );
          }
        }

        var settleCount = 0;
        function processPayments(index) {
          if (index >= PayTypes.length) {
            // 所有PayType處理完畢
            if (isSettleSuccess) {
              resolve();
            } else {
              reject(settleFailHostIdArr);
            }
            return;
          }

          var PayType = PayTypes[index];
          if (PayType.PayTypeAction == "TAISHIN") {
            var settle = false;
            var hostId = "";
            var type = "";

            switch (PayType.PayMachineParameter) {
              case "N@03":
                type = "信用卡";
                hostId = "03";
                settle = true;
                break;

              case "E@51":
                type = "悠遊卡";
                hostId = "51";
                settle = true;
                break;

              case "E@52":
                type = "一卡通";
                hostId = "52";
                settle = true;
                break;
            }

            if (settle) {
              // 若符合條件，則呼叫卡機結帳，並在完成後處理下一個PayType
              settleCount++;
              if (type == "信用卡") {
                setTimeout(
                  function () {
                    kiosk.API.Device.FIN.TAISHIN_TVM_BANK_Function(
                      function (res) {
                        checkRes(
                          res,
                          hostId,
                          "TAISHIN 卡機" + type + "結帳失敗"
                        );
                        processPayments(index + 1);
                      },
                      function () {},
                      "SETTLE",
                      transType_creditcard,
                      "0",
                      ""
                    );
                  },
                  settleCount > 1 ? delayTime : 0
                );
              } else {
                setTimeout(
                  function () {
                    kiosk.API.Device.FIN.TAISHIN_TVM_TICKET_Function(
                      function (res) {
                        checkRes(
                          res,
                          hostId,
                          "TAISHIN 卡機" + type + "結帳失敗"
                        );
                        processPayments(index + 1);
                      },
                      function () {},
                      transType_ETicket,
                      "0",
                      hostId
                    );
                  },
                  settleCount > 1 ? delayTime : 0
                );
              }
            } else {
              // 若非需要結帳的支付類型，則處理下一個PayType
              processPayments(index + 1);
            }
          } else {
            // 若非正確收單行，則處理下一個PayType
            processPayments(index + 1);
          }
        }

        processPayments(0);
      });
    },
	 /**
     * 合庫卡機
     * @param trans_type 交易類別 購貨:01; 退貨:02; 結帳:50
     * @param host_id 授權銀行 合庫:02;
     * @param trans_amt 交易金額
     */
    TCBPayment: function (trans_type, host_id, trans_amt) {
		
      return new Promise(function (resolve, reject) {
        var transBEName = "";
        if (trans_type === "01") {
          transBEName = "TCB 呼叫信用卡機";
        }
        BackEnd.AddActionLog(
          "3",
          transBEName + "req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        WriteLog("call kiosk.API.Device.FIN.TCBPayment");
		kiosk.API.Device.FIN.TCBPayment(
          function (res) {
            BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
            if (res.IsSuccess) {
              resolve(res);
            } else {
              reject(res.Error);
            }
          },
          function () {},
          trans_amt,
          host_id,
          ""
        );
      });
    },
    TCBRefund: function (trans_type, host_id, trans_amt) {
      return new Promise(function (resolve, reject) {
        var transBEName = "";
        if (trans_type === "02") {
          transBEName = "TCB 呼叫信用卡機退款";
        }
        BackEnd.AddActionLog(
          "3",
          transBEName + "req",
          JSON.stringify({
            member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
            app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
            localID: kiosk.status.serialNo,
            version: kiosk.BESync ? kiosk.BESync.Version : "",
          })
        );
        kiosk.API.Device.FIN.TCBRefund(
          function (res) {
            BackEnd.AddActionLog("3", transBEName + "res", JSON.stringify(res));
            if (res.IsSuccess) {
              resolve(res);
            } else {
              reject(res.Error);
            }
          },
          function () {},
          trans_amt,
          host_id,
          ""
        );
      });
    },
    TCBSettle: function () {
      return new Promise(function (resolve, reject) {
        var settle = new Promise(function (resolve, reject) {
          var transBEName = "TCB 卡機結帳";
          BackEnd.AddActionLog(
            "3",
            transBEName + "req",
            JSON.stringify({
              member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
              app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
              version: kiosk.BESync ? kiosk.BESync.Version : "",
            })
          );

          kiosk.API.Device.FIN.TCBSettle(
            function (res) {
              BackEnd.AddActionLog(
                "3",
                transBEName + "res",
                JSON.stringify(res)
              );
              if (res.IsSuccess) {
                var reponse = res
                  ? "信用卡 結帳資料 : " + JSON.stringify(res)
                  : "信用卡 結帳完成";
                WriteLog(reponse);
                resolve(res);
              } else {
                var error = res
                  ? "信用卡 結帳失敗 : " + JSON.stringify(res)
                  : "信用卡 結帳失敗";
                WriteLog(error);
                reject(res);
              }
            },
            function () {}
          );
        });
        Promise.all([settle])
          .then(function () {
            resolve("結帳成功");
          })
          .catch(function (res) {
            reject(res ? "總結帳失敗 : " + JSON.stringify(res) : "總結帳失敗");
          });
      });
    },

  },
};
