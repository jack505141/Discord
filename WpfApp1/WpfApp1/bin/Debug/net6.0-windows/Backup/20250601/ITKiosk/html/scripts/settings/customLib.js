var kiosk = kiosk || {};
kiosk.API = kiosk.API || {};

kiosk.API.playAudio = (function () {
  var audio = $('<audio id="audioAPI" autoplay ></audio>');
  return {
    setupSrc: function (filePath) {
      if (filePath) kiosk.API.MediaPlayer.Play("content/audio/" + filePath);
      else console.log("filePath  is [" + filePath + "]");
    },
    pause: function () {
      kiosk.API.MediaPlayer.Pause();
    },
    stop: function () {
      kiosk.API.MediaPlayer.Stop();
    },
  };
})();

function testAlert(LogText) {
  alert(LogText);
  WriteLog(LogText);
  console.log(LogText);
}

/**
 * title\r\n,text,type,confirm(confirmFn),cancel(cancelFn),timer(timerFn),
 * @param {Object} popup
 */
function showAlert(popup) {
  swal({
    imageUrl: popup.imageUrl || null,
    imageClass: popup.imageClass || null,
    title: popup.title || null,
    text: popup.text || null,
    html: popup.html || null,
    type: popup.type || null,
    timer: popup.timer || null,
    allowOutsideClick: popup.allowOutsideClick || false,
    showConfirmButton: popup.confirm ? true : false,
    showCancelButton: popup.cancel ? true : false,
    confirmButtonText: popup.confirm || null,
    cancelButtonText: popup.cancel || null,
    heightAuto: false,
    onOpen: popup.onOpen || null,
  }).then(function (isConfirm) {
    if (isConfirm.dismiss === "timer") {
      if (popup.timerFn) {
        popup.timerFn();
      }
    } else if (isConfirm.value) {
      if (popup.confirmFn) {
        popup.confirmFn();
      }
    } else if (isConfirm.dismiss === "cancel") {
      if (popup.cancelFn) {
        popup.cancelFn();
      }
    }
  });
}

/**
 * title\r\n,text,type,confirm(confirmFn),cancel(cancelFn),timer(timerFn),
 * @param {Object} popup
 */
function showAlertForPOS(popup, afterFunction) {
  swal({
    title: popup.title || null,
    text: popup.text || null,
    type: popup.type || null,
    timer: popup.timer || null,
    allowOutsideClick: popup.allowOutsideClick || false,
    showConfirmButton: popup.confirm ? true : false,
    showCancelButton: popup.cancel ? true : false,
    confirmButtonText: popup.confirm || null,
    cancelButtonText: popup.cancel || null,
    html: popup.html || null,
    footer: popup.footer || null,
    customClass: popup.customClass || null,
    heightAuto: false,
    onOpen: popup.onOpen || null,
  }).then(function (isConfirm) {
    if (isConfirm.dismiss === "timer") {
      if (popup.timerFn) {
        popup.timerFn();
      }
    } else if (isConfirm.value) {
      if (popup.confirmFn) {
        popup.confirmFn();
      }
    } else if (isConfirm.dismiss === "cancel") {
      if (popup.cancelFn) {
        popup.cancelFn();
      }
    }
  });
}

function showAlertForBundle(list) {
  // list = [{
  //         "productName": "築夢南極生態藝術特展門票",
  //         "ticketTypeName": "一般票",
  //         "bundleModeName": "購買即提供",
  //         "quantity": 1,
  //         "inventory": 99999999
  //     },
  //     {
  //         "productName": "宮廷魚樂古典花鳥蟲魚特展",
  //         "ticketTypeName": "一般票",
  //         "bundleModeName": "兌換即贈",
  //         "quantity": 1,
  //         "inventory": 99999999
  //     }
  // ]
  titleStyle =
    'style="height: 36px; line-height: 36px; border-radius: 4px; border: 1px solid rgb(38, 154, 188); color: white; background-image: linear-gradient(-180deg, rgb(91, 192, 222) 0%, rgb(91, 192, 222) 0%, rgb(42, 171, 210) 100%, rgb(42, 171, 210) 100%);"';

  contentList = $('<div id="swContent"></div>');
  for (i = 0; i < list.length; i++) {
    itemHtml = $(
      '<div class="row" style="margin-top: 8px; margin-bottom: 8px;"></div>'
    );
    var item = list[i];
    var left = $('<div class="col-3" style="font-size: 14px;"></div>').append(
      "<div " + titleStyle + ">" + item.bundleModeName + "</div>"
    );
    var right = $(
      '<div class="col-9 d-flex" style="line-height: 36px;"></div>'
    ).append(
      "<div>" +
        item.productName +
        "-" +
        item.ticketTypeName +
        "*" +
        item.quantity +
        "</div>" +
        '<div style="margin-left: 16px; color:#169bd5;">庫存' +
        item.inventory +
        "</div>"
    );
    itemHtml.append(left, right);
    contentList.append(itemHtml);
  }

  html =
    '<svg version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="80px" height="80px" xmlns="http://www.w3.org/2000/svg">' +
    '<g transform="matrix(1 0 0 1 -504 -145 )">' +
    '<path d="M 52.8645833333333 66.1979166666667  C 53.1770833333333 65.8854166666667  53.3333333333333 65.4861111111111  53.3333333333333 65  L 53.3333333333333 56.6666666666667  C 53.3333333333333 56.1805555555556  53.1770833333333 55.78125  52.8645833333333 55.46875  C 52.5520833333333 55.15625  52.1527777777778 55  51.6666666666667 55  L 46 55  L 46 28.3333333333333  C 46.6666666666667 27.8472222222222  46.5104166666667 27.4479166666667  46.1979166666667 27.1354166666667  C 45.8854166666667 26.8229166666667  45.4861111111111 26.6666666666667  45 27  L 28.3333333333333 27  C 27.8472222222222 26.6666666666667  27.4479166666667 26.8229166666667  27.1354166666667 27.1354166666667  C 26.8229166666667 27.4479166666667  26.6666666666667 27.8472222222222  26.6666666666667 28.3333333333333  L 26.6666666666667 36.6666666666667  C 26.6666666666667 37.1527777777778  26.8229166666667 37.5520833333333  27.1354166666667 37.8645833333333  C 27.4479166666667 38.1770833333333  27.8472222222222 38.3333333333333  28.3333333333333 38.3333333333333  L 34 38.3333333333333  L 34 55  L 28.3333333333333 55  C 27.8472222222222 55  27.4479166666667 55.15625  27.1354166666667 55.46875  C 26.8229166666667 55.78125  26.6666666666667 56.1805555555556  26.6666666666667 56.6666666666667  L 26.6666666666667 65  C 26.6666666666667 65.4861111111111  26.8229166666667 65.8854166666667  27.1354166666667 66.1979166666667  C 27.4479166666667 66.5104166666667  27.8472222222222 66.6666666666667  28.3333333333333 66  L 51.6666666666667 66  C 52.1527777777778 66.6666666666667  52.5520833333333 66.5104166666667  52.8645833333333 66.1979166666667  Z M 46.1979166666667 19.53125  C 46.5104166666667 19.21875  46.6666666666667 18.8194444444444  46.6666666666667 18.3333333333333  L 46.6666666666667 10  C 46.6666666666667 9.51388888888888  46.5104166666667 9.11458333333333  46.1979166666667 8.80208333333333  C 45.8854166666667 8.48958333333333  45.4861111111111 8.33333333333333  45 9  L 35 9  C 34.5138888888889 8.33333333333333  34.1145833333333 8.48958333333333  33.8020833333333 8.80208333333333  C 33.4895833333333 9.11458333333333  33.3333333333333 9.51388888888888  33.3333333333333 10  L 33.3333333333333 18.3333333333333  C 33.3333333333333 18.8194444444444  33.4895833333333 19.21875  33.8020833333333 19.53125  C 34.1145833333333 19.84375  34.5138888888889 20  35 20  L 45 20  C 45.4861111111111 20  45.8854166666667 19.84375  46.1979166666667 19.53125  Z M 74.6354166666667 19.921875  C 78.2118055555555 26.0503472222222  80 32.7430555555555  80 40  C 80 47.2569444444444  78.2118055555555 53.9496527777778  74.6354166666667 60.078125  C 71.0590277777778 66.2065972222222  66.2065972222222 71.0590277777778  60.078125 74.6354166666667  C 53.9496527777778 78.2118055555556  47.2569444444444 80  40 80  C 32.7430555555556 80  26.0503472222222 78.2118055555556  19.921875 74.6354166666667  C 13.7934027777778 71.0590277777778  8.94097222222222 66.2065972222222  5.36458333333333 60.078125  C 1.78819444444444 53.9496527777778  0 47.2569444444444  0 40  C 0 32.7430555555555  1.78819444444444 26.0503472222222  5.36458333333333 19.921875  C 8.94097222222222 13.7934027777778  13.7934027777778 8.94097222222221  19.921875 5.36458333333333  C 26.0503472222222 1.78819444444444  32.7430555555556 0  40 0  C 47.2569444444444 0  53.9496527777778 1.78819444444444  60.078125 5.36458333333333  C 66.2065972222222 8.94097222222221  71.0590277777778 13.7934027777778  74.6354166666667 19.921875  Z " fill-rule="nonzero" fill="#000000" stroke="none" transform="matrix(1 0 0 1 504 145 )" />' +
    "</g>" +
    "</svg>";
  console.log(contentList);
  html +=
    '<div style="height: 2px; background-color: #333333; margin: 16px 16px;"></div>' +
    '<div id="swContent">' +
    contentList.html() +
    "</div>" +
    "</div>";

  popup = {
    html: html,
    confirm: "確認",
  };
  swal({
    title: popup.title || null,
    text: popup.text || null,
    type: popup.type || null,
    timer: popup.timer || null,
    allowOutsideClick: popup.allowOutsideClick || false,
    showConfirmButton: popup.confirm ? true : false,
    showCancelButton: popup.cancel ? true : false,
    confirmButtonText: popup.confirm || null,
    cancelButtonText: popup.cancel || null,
    html: popup.html || null,
    footer: popup.footer || null,
    customClass: popup.customClass || null,
    heightAuto: false,
    width: 672,
  }).then(function (isConfirm) {
    if (isConfirm.dismiss === "timer") {
      if (popup.timerFn) {
        popup.timerFn();
      }
    } else if (isConfirm.value) {
      if (popup.confirmFn) {
        popup.confirmFn();
      }
    } else if (isConfirm.dismiss === "cancel") {
      if (popup.cancelFn) {
        popup.cancelFn();
      }
    }
  });
}

/**
 * 靠右左補0,傳入字串及需要的長度
 * @param {String} str
 * @param {Number} length
 */
function padLeft(str, length) {
  if (str.length >= length) return str;
  else return padLeft("0" + str, length);
}

/**
 * 判斷是否為營業時間
 * 1.從workTimeData Arr中,尋找目前weekDay相同的Object
 * 2.判斷WorkStatus營業狀態,1為營業,0為不營業 =>reuturn false
 * 3.判斷當前時間是否在WorkTimeStart-WorkTimeEnd內
 * @param {Array} workTimeData
 */
function judgeWorkTime(workTimeData) {
  var nowDate = moment().format("YYYY-MM-DD");
  var nowTime = moment().format("HHmm");
  var nowWeekDay = moment(nowDate).day();
  // 取得0-6 當前weekDay
  var nowWeekDay = moment(nowDate).day();
  var currentWorkTimeData = workTimeData.find(function (item) {
    return item.WeekDay === nowWeekDay;
  });
  // === 測試時間用 Start ===
  // currentWorkTimeData.WorkTimeStart = "08:50";
  // currentWorkTimeData.WorkTimeEnd = "22:50";
  // currentWorkTimeData.WorkStatus = 1;
  // === 測試時間用 End ===

  if (
    currentWorkTimeData === undefined ||
    currentWorkTimeData.WorkStatus === 0
  ) {
    return false;
  } else {
    var time = moment(nowTime, "HH:mm");
    var beforeTime = moment(currentWorkTimeData.WorkTimeStart, "HH:mm");
    var afterTime = moment(currentWorkTimeData.WorkTimeEnd, "HH:mm");
    if (time.isBetween(beforeTime, afterTime)) {
      return true;
    } else {
      return false;
    }
  }
}

/**
 * 傳入YYYY/MM/DD 或 R/MM/DD
 * 回傳原日期+(當前星期)
 * @param {String} date
 */
function addWeekDay(date) {
  if (date === "") {
    return "查無資料";
  } else {
    var weekDay = ["日", "一", "二", "三", "四", "五", "六"];
    var currentWeekDay;
    // YYYY/MM/DD
    if (date.length === 10) {
      currentWeekDay = weekDay[moment(date, "YYYY/MM/DD").day()];
    } else {
      var RswitchVids = moment(date, "YYYY/MM/DD")
        .add(1911, "years")
        .format("YYYY/MM/DD");
      currentWeekDay = weekDay[moment(RswitchVids, "YYYY/MM/DD").day()];
      // date =
    }

    return date + "(" + currentWeekDay + ")";
  }
}

/**
 * 檢查Email格式是否正確
 * @param {String} remail
 */
function checkEmail(remail) {
  if (remail.search(/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/) != -1) {
    return true;
  } else {
    return false;
  }
}

function EZM_BirthdayConvert(birthday) {
  var str = "";
  if (birthday.length === 6) {
    // ex 099/01/01
    str =
      "0" +
      birthday.substr(0, 2) +
      "/" +
      birthday.substr(2, 2) +
      "/" +
      birthday.substr(4, 2);
  } else if (birthday.length === 7) {
    // ex 101/01/01
    str =
      birthday.substr(0, 3) +
      "/" +
      birthday.substr(3, 2) +
      "/" +
      birthday.substr(5, 2);
  }
  return str;
}

/**
 *
 * @param {*} printer
 * @param {*} item posEnablePayment.data.result.payment.productOrderList[i]
 * @param {*} count
 * @returns
 */
function printTicket(printer, itemSource, count, recall) {
  var item = JSON.parse(JSON.stringify(itemSource));
  switch (printer) {
    case "TM-T82IIMU":
      break;
    case "":
      break;
  }
  return new Promise(function (resolve, reject) {
    if (printer === "TSP-247") {
      var effectiveDate = moment(item.effectiveDate, "YYYYMMDDHHmm");
      var expiredDate = moment(item.expiredDate, "YYYYMMDDHHmm");

      // Rander 使用期限
      if (
        effectiveDate.format("YYYY/MM/DD") === expiredDate.format("YYYY/MM/DD")
      ) {
        // 使用期限:\r\n
        item.printDate =
          "使用期限 : " + effectiveDate.format("YYYY-MM-DD") + " 當日有效";
      } else {
        item.printDate =
          "使用期限 : " +
          effectiveDate.format("YYYY-MM-DD HH:mm") +
          " ~ " +
          expiredDate.format("YYYY-MM-DD HH:mm");
      }
      var tmpSplit = [];
      item.productName2 = "";
      if (sfstrlen(item.productName) > 40) {
        tmpSplit = sfTSCPrintFormat(item.productName, [], 40);
        item.productName = tmpSplit[0];
        item.productName2 = tmpSplit[1];
      }
      if (sfstrlen(item.ticketTypeName) > 40) {
        tmpSplit = sfTSCPrintFormat(item.ticketTypeName, [], 40);
        item.ticketTypeName = tmpSplit[0];
      }

      var useMode = "2";
      item.now = moment().format("YYYY-MM-DD HH:mm");
      item.serialNum = count + 1;
      item.generateStr = "";
      item.salePriceStr = item.salePrice + "";
      item.sessionRangeStr1 = "";
      item.sessionRangeStr2 = "";
      if (item.sessionRange) {
        item.sessionRangeStr1 =
          "預約資訊 : " +
          item.sessionRange.substr(0, 10) +
          " | " +
          item.bookingSpecName;
        item.sessionRangeStr2 = "" + item.sessionRange.substr(11);

        if (item.seatLabel !== "") {
          switch (kiosk.systemSetting.lang) {
            case "zh_TW":
              var Seat = " | 座位: ";
              break;

            default:
              var Seat = " | Seat: ";
              break;
          }
          item.sessionRangeStr2 += Seat + item.seatLabel + "\r\n";
        } else {
          item.sessionRangeStr2 += "\r\n";
        }
        // if (sfstrlen(item.sessionRangeStr1) > 44) {
        //     tmpSplit = sfTSCPrintFormat(item.sessionRangeStr1, [], 44)
        //     item.sessionRangeStr1 = tmpSplit[0]
        //     item.sessionRangeStr2 = tmpSplit[1]
        // }
        useMode = "4";
      }
      if (item.trustNumberList && item.trustNumberList[0]) {
        item.generateStr += "---------- 履約保障機制 ----------\r\n";
        item.generateStr += "信託號碼: " + item.trustNumberList[0] + "\r\n";
        item.generateStr += "履約保障機制請上 inquiry.fonpay.tw 查詢\r\n";
        useMode = "1";
      }
      item.displayLimitationStr1 = "";
      item.displayLimitationStr2 = "";
      if (item.displayLimitation) {
        item.displayLimitationStr1 += "使用限制 : ";
        item.displayLimitationStr1 += item.displayLimitation;
        if (sfstrlen(item.displayLimitationStr1) > 72) {
          tmpSplit = sfTSCPrintFormat(item.displayLimitationStr1, [], 66);
          item.displayLimitationStr1 = tmpSplit[0];
          item.displayLimitationStr2 = tmpSplit[1];
        }
      }

      // 組合後台資訊
      var usePrintSet = null;
      for (var i = 0; i < kiosk.BESync.TicketTemplates.length; i++) {
        if (kiosk.BESync.TicketTemplates[i].TicketType == useMode) {
          usePrintSet = kiosk.BESync.TicketTemplates[i];
          break;
        }
      }
      if (usePrintSet == null) {
        reject("請確認設定資訊");
        return;
      }

      if (recall) {
        item.recall = "補印";
      } else {
        item.recall = "";
      }

      if (item.instruction != "") {
        item.memoStr = item.instruction;
      } else {
        item.memoStr = usePrintSet.Memo;
      }
      item.memoStr1 = "";
      item.memoStr2 = "";
      item.memoStr3 = "";
      item.memoStr4 = "";
      item.memoStr5 = "";
      if (item.memoStr != null && item.memoStr.split("\r\n").length > 0) {
        var memoData = item.memoStr.split("\r\n");
        for (var i = 0; i < memoData.length; i++) {
          item["memoStr" + (i + 1)] = memoData[i];
          if (sfstrlen(memoData[i]) > 66) {
            tmpSplit = sfTSCPrintFormat(memoData[i], [], 66);
            item["memoStr" + (i + 1)] = tmpSplit[0];
          }
        }
      }

      customLibDevice.Thermal.Print(printer, usePrintSet.ThermalPrintID, item)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (res) {
          reject("列印失敗");
        });
    } else {
      var effectiveDate = moment(item.effectiveDate, "YYYYMMDDHHmm");
      var expiredDate = moment(item.expiredDate, "YYYYMMDDHHmm");

      // Rander 使用期限
      if (
        effectiveDate.format("YYYY/MM/DD") === expiredDate.format("YYYY/MM/DD")
      ) {
        // 使用期限:\r\n
        item.printDate =
          "使用期限: " + effectiveDate.format("YYYY-MM-DD") + " 當日有效";
      } else {
        item.printDate =
          "使用期限:\r\n" +
          effectiveDate.format("YYYY-MM-DD") +
          " ~ " +
          expiredDate.format("YYYY-MM-DD");
        if (expiredDate.format("HH:mm") != "23:59") {
          item.printDate += " " + expiredDate.format("HH:mm");
        }
      }
      var useMode = "2";
      item.now = moment().format("YYYY-MM-DD HH:mm");
      item.serialNum = count + 1;
      item.generateStr = "";
      item.salePriceStr = item.salePrice + "";
      if (item.sessionRange) {
        item.generateStr += "------------ 預約資訊 ------------\r\n";
        item.generateStr += item.sessionRange + " | "; // + '\r\n'
        item.generateStr += item.bookingSpecName; // + "\r\n";

        if (item.seatLabel !== "") {
          switch (kiosk.systemSetting.lang) {
            case "zh_TW":
              var Seat = " | 座位: ";
              break;

            default:
              var Seat = " | Seat: ";
              break;
          }
          item.generateStr += Seat + item.seatLabel + "\r\n";
        } else {
          item.generateStr += "\r\n";
        }
        useMode = "4";
      }
      if (item.trustNumberList && item.trustNumberList[0]) {
        item.generateStr += "---------- 履約保障機制 ----------\r\n";
        item.generateStr += "信託號碼: " + item.trustNumberList[0] + "\r\n";
        item.generateStr += "履約保障機制請上 inquiry.fonpay.tw 查詢\r\n";
        useMode = "1";
      }
      if (item.displayLimitation) {
        item.generateStr += "------------ 使用限制 ------------\r\n";
        item.generateStr += item.displayLimitation + "\r\n";
      }

      // 組合後台資訊
      var usePrintSet = null;
      for (var i = 0; i < kiosk.BESync.TicketTemplates.length; i++) {
        if (kiosk.BESync.TicketTemplates[i].TicketType == useMode) {
          usePrintSet = kiosk.BESync.TicketTemplates[i];
          break;
        }
      }
      if (usePrintSet == null) {
        reject("請確認設定資訊");
        return;
      }

      if (recall) {
        item.recall = "補印";
      } else {
        item.recall = "";
      }

      if (item.instruction != "") {
        item.memoStr = item.instruction;
      } else {
        item.memoStr = usePrintSet.Memo;
      }

      customLibDevice.Thermal.Print(printer, usePrintSet.ThermalPrintID, item)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (res) {
          reject("列印失敗");
        });
    }
  });
}

/**
 *
 * @param {*} printer
 * @param {*} item posEnablePayment.data.result.payment
 * @param {*} count
 * @returns
 */
function printPayment(printer, itemSource, count, recall, isPrintWithDetail) {
  return new Promise(function (resolve, reject) {
    var item = JSON.parse(JSON.stringify(itemSource));
    if (printer === "TSP-247") {
      item.now = moment().format("YYYY-MM-DD HH:mm");
      item.serialNum = count + 1;
      item.generateStr = "";
      // // 預約資訊段落
      // for (i = 0; i < item.productOrderList.length; i++) {
      //     var tmpItem = item.productOrderList[i]
      //     if (tmpItem.sessionRange) {
      //         if (item.generateStr.indexOf('------------ 預約資訊 -------------') == -1) {
      //             item.generateStr += '------------ 預約資訊 -------------\r\n'
      //         }
      //         item.generateStr += tmpItem.productName + ' : ' + tmpItem.sessionRange + ' ' + tmpItem.bookingSpecName + '\r\n'
      //     }
      // }
      item.productName = item.productOrderList[0].productName;
      item.productName2 = "";
      if (sfstrlen(item.productName) > 42) {
        tmpSplit = sfTSCPrintFormat(
          item.productOrderList[0].productName,
          [],
          42
        );
        item.productName = tmpSplit[0];
        item.productName2 = tmpSplit[1];
      }
      // if (item.bookingSummary && item.bookingSummary.displayBookingSession) {
      //     item.printDate = item.bookingSummary.displayBookingSession + ' | ' + item.bookingSummary.bookingSpecName
      // }
      // 履約保障機制段落
      if (item.trustNumberList && item.trustNumberList[0]) {
        item.generateStr += "---------- 履約保障機制 -----------\r\n";
        item.generateStr += "信託號碼: " + item.trustNumberList[0] + "\r\n";
        item.generateStr += "履約保障機制請上 inquiry.fonpay.tw 查詢\r\n";
      }
      if (item.bookingSummary && item.bookingSummary.displayBookingSession) {
        item.sessionRangeStr1 =
          "預約資訊 : " +
          item.bookingSummary.displayBookingSession.substr(0, 10) +
          " | " +
          item.bookingSummary.bookingSpecName;
        item.sessionRangeStr2 =
          "" + item.bookingSummary.displayBookingSession.substr(11);
      }

      // Rander 使用期限
      if (
        item.productOrderList[0] &&
        item.productOrderList[0].effectiveDate &&
        item.productOrderList[0].expiredDate
      ) {
        var effectiveDate = moment(
          item.productOrderList[0].effectiveDate,
          "YYYYMMDDHHmm"
        );
        var expiredDate = moment(
          item.productOrderList[0].expiredDate,
          "YYYYMMDDHHmm"
        );
        if (
          effectiveDate.format("YYYY/MM/DD") ===
          expiredDate.format("YYYY/MM/DD")
        ) {
          // 使用期限:\r\n
          item.printDate =
            "使用期限 : " + effectiveDate.format("YYYY-MM-DD") + " 當日有效";
        } else {
          item.printDate =
            "使用期限 : " +
            effectiveDate.format("YYYY-MM-DD HH:mm") +
            " ~ " +
            expiredDate.format("YYYY-MM-DD HH:mm");
        }
      }
      // // 使用限制段落
      // for (i = 0; i < item.productOrderList.length; i++) {
      //     var tmpItem = item.productOrderList[i]
      //     if (tmpItem.displayLimitation) {
      //         if (item.generateStr.indexOf('------------ 使用限制 -------------') == -1) {
      //             item.generateStr += '------------ 使用限制 -------------\r\n'
      //         }
      //         item.generateStr += tmpItem.productName + ' : ' + tmpItem.displayLimitation + '\r\n'
      //     }
      // }

      var countTotal = 0;
      var ProdListlength = item.saleProductList.length;
      for (let i = 0; i < ProdListlength; i++) {
        countTotal += item.saleProductList[i].quantity;
      }
      item.countTotal = countTotal + "張";

      // 明細段
      item.paymentSettingListName = item.paymentSettingList[0].name;
      item.paymentSettingListPrice = item.paymentSettingList[0].price;

      item.paidDate = moment(item.paidDate, "YYYYMMDDHHmm");
      item.paidDate = item.paidDate.format("YYYY-MM-DD HH:mm");
      item.saleDeviceCode = kiosk.systemSetting.deviceName;

      var groupBy = function (xs, key) {
        return xs.reduce(function (rv, x) {
          (rv[x[key]] = rv[x[key]] || []).push(x);
          return rv;
        }, {});
      };
      var itemList = groupBy(item.productOrderList, "productName");
      item.DgenerateStr = "";

      // test function
      var sessionRangeKeys = Object.keys(itemList);
      for (var i in sessionRangeKeys) {
        var sessionGroup = groupBy(
          itemList[sessionRangeKeys[i]],
          "sessionRange"
        );
        if (!Object.keys(sessionGroup).includes("undefined")) {
          itemList[sessionRangeKeys[i]] = sessionGroup;
        }
      }
      // test function

      tag = "└";
      count = 0;
      for (var k in itemList) {
        item.DgenerateStr += k + "\r\n";
        for (var p in itemList[k]) {
          if (p.indexOf("-") == -1) {
            count += itemList[k][p].purchaseQuantity;
            tmpItemTitle = " " + tag + itemList[k][p].ticketTypeName;
            tmpItemEnd =
              "$" +
              itemList[k][p].salePrice +
              " * " +
              itemList[k][p].purchaseQuantity;
            item.DgenerateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
            if (
              itemList[k][p].bundleProductOrderList &&
              itemList[k][p].bundleProductOrderList.length != 0
            ) {
              for (var d in itemList[k][p].bundleProductOrderList) {
                item.DgenerateStr +=
                  "  " +
                  tag +
                  itemList[k][p].bundleProductOrderList[d].productName +
                  " * " +
                  itemList[k][p].bundleProductOrderList[d].quantity +
                  "\r\n";
              }
            }
          } else {
            item.DgenerateStr += " " + tag + " " + p + "\r\n";
            for (var l in itemList[k][p]) {
              count += itemList[k][p][l].purchaseQuantity;
              tmpItemTitle = "  " + tag + itemList[k][p][l].ticketTypeName;
              tmpItemEnd =
                "$" +
                itemList[k][p][l].salePrice +
                " * " +
                itemList[k][p][l].purchaseQuantity;
              item.DgenerateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);

              // 使用限制段落
              if (itemList[k][p][l].displayLimitation) {
                item.DgenerateStr +=
                  itemList[k][p][l].displayLimitation + "\r\n";
              }

              if (
                itemList[k][p][l].bundleProductOrderList &&
                itemList[k][p][l].bundleProductOrderList.length != 0
              ) {
                for (var d in itemList[k][p][l].bundleProductOrderList) {
                  tmpItemTitle =
                    "  " +
                    tag +
                    itemList[k][p][l].bundleProductOrderList[d].productName +
                    " - " +
                    itemList[k][p][l].bundleProductOrderList[d].ticketTypeName;
                  tmpItemEnd =
                    " * " +
                    itemList[k][p][l].bundleProductOrderList[d].quantity;
                  item.DgenerateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
                  // item.DgenerateStr += '  ' + tag + itemList[k][p][l].bundleProductOrderList[d].productName + ' * ' + itemList[k][p][l].bundleProductOrderList[d].quantity + '\r\n';
                }
              }
            }
          }
        }
      }

      item.totalCount = count;
      item.now = moment().format("YYYY-MM-DD HH:mm");

      item.productName = "一票多人．入場憑證";
      item.productName2 = "";
      item.displayLimitationStr1 = "";
      item.displayLimitationStr2 = "";
      item.printDate = "使用限制：「以現場公告為準」";
      item.sessionRangeStr1 = "";
      item.sessionRangeStr2 = "";
      // 組合後台資訊
      var usePrintSet = null;
      for (var i = 0; i < kiosk.BESync.TicketTemplates.length; i++) {
        if (kiosk.BESync.TicketTemplates[i].TicketType == "8") {
          usePrintSet = kiosk.BESync.TicketTemplates[i];
          break;
        }
      }
      if (usePrintSet == null) {
        reject("找不到列印對應(8)");
        return;
      }

      if (recall) {
        item.recall = "補印";
      } else {
        item.recall = "";
      }

      if (item.instruction != "") {
        item.memoStr = item.instruction;
      } else {
        item.memoStr = usePrintSet.Memo;
      }
      item.memoStr1 = "";
      item.memoStr2 = "";
      item.memoStr3 = "";
      item.memoStr4 = "";
      item.memoStr5 = "";
      if (item.memoStr != null && item.memoStr.split("\r\n").length > 0) {
        var memoData = item.memoStr.split("\r\n");
        for (var i = 0; i < memoData.length; i++) {
          item["memoStr" + (i + 1)] = memoData[i];
          if (sfstrlen(memoData[i]) > 66) {
            tmpSplit = sfTSCPrintFormat(memoData[i], [], 66);
            item["memoStr" + (i + 1)] = tmpSplit[0];
          }
        }
      }
      /**
       * 沒發票的訂單：
       * 交易明細：退貨時請出示交易明細、票券
       * 有發票得訂單：
       * 交易明細：退貨時請出示發票、交易明細、票券
       */
      if (item.receiptType === "INVOICE") {
        item.taxInfo = "";
        if (item.invoiceData.untaxedSaleAmount != 0) {
          item.taxInfo += "未稅銷售額 " + item.invoiceData.untaxedSaleAmount;
        }
        if (item.invoiceData.invoiceTaxAmount != 0) {
          item.taxInfo += "稅額 " + item.invoiceData.invoiceTaxAmount;
        }
        if (item.invoiceData.amusementTaxAmount != 0) {
          item.taxInfo += "\n代徵娛樂稅 " + item.invoiceData.amusementTaxAmount;
          // item.taxInfo += "娛樂稅 " + item.invoiceData.amusementTaxAmount;
        }
        if (item.taxInfo != "") {
          item.taxInfo += "\r\n";
        }
      }

      item.Unified = "";
      item.kioskInvoice = "";
      if (item.touristInformation && item.touristInformation.remark != "") {
        item.Unified += item.touristInformation.remark.replace("買方 : ", "");
      }
      if (item.refundDescription != null) {
        item.kioskInvoice += item.refundDescription + "\r\n";
      }

      customLibDevice.Thermal.Print(printer, usePrintSet.ThermalPrintID, item)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (res) {
          reject("列印失敗");
        });
    } else {
      item.now = moment().format("YYYY-MM-DD HH:mm");
      item.serialNum = count + 1;
      item.generateStr = "";
      // // 預約資訊段落
      // for (i = 0; i < item.productOrderList.length; i++) {
      //     var tmpItem = item.productOrderList[i]
      //     if (tmpItem.sessionRange) {
      //         if (item.generateStr.indexOf('------------ 預約資訊 -------------') == -1) {
      //             item.generateStr += '------------ 預約資訊 -------------\r\n'
      //         }
      //         item.generateStr += tmpItem.productName + ' : ' + tmpItem.sessionRange + ' ' + tmpItem.bookingSpecName + '\r\n'
      //     }
      // }

      // 履約保障機制段落
      if (item.trustNumberList && item.trustNumberList[0]) {
        item.generateStr += "---------- 履約保障機制 -----------\r\n";
        item.generateStr += "信託號碼: " + item.trustNumberList[0] + "\r\n";
        item.generateStr += "履約保障機制請上 inquiry.fonpay.tw 查詢\r\n";
      }

      // // 使用限制段落
      // for (i = 0; i < item.productOrderList.length; i++) {
      //     var tmpItem = item.productOrderList[i]
      //     if (tmpItem.displayLimitation) {
      //         if (item.generateStr.indexOf('------------ 使用限制 -------------') == -1) {
      //             item.generateStr += '------------ 使用限制 -------------\r\n'
      //         }
      //         item.generateStr += tmpItem.productName + ' : ' + tmpItem.displayLimitation + '\r\n'
      //     }
      // }

      // 明細段
      if (isPrintWithDetail) {
        item.paymentSettingListName = item.paymentSettingList[0].name;
        item.paymentSettingListPrice = item.paymentSettingList[0].price + "";

        item.paidDate = moment(item.paidDate, "YYYYMMDDHHmm");
        item.paidDate = item.paidDate.format("YYYY-MM-DD HH:mm");
        item.saleDeviceCode = kiosk.systemSetting.deviceName;

        var groupBy = function (xs, key) {
          return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
          }, {});
        };
        var itemList = groupBy(item.productOrderList, "productName");
        item.DgenerateStr = "";

        // // test function
        // var sessionRangeKeys = Object.keys(itemList)
        // for (var i in sessionRangeKeys) {
        //     var sessionGroup = groupBy(itemList[sessionRangeKeys[i]], 'sessionRange');
        //     if (!Object.keys(sessionGroup).includes('undefined')) {
        //         itemList[sessionRangeKeys[i]] = sessionGroup
        //     }
        // }
        // // test function

        tag = "└";
        count = 0;
        for (var k in itemList) {
          item.DgenerateStr += k + "\r\n";
          for (var p = 0; p < itemList[k].length; p++) {
            if (itemList[k][p].dateMode == "RESERVATION") {
              var level2 = groupBy(itemList[k], "bookingSpecName");
              for (var lv in level2) {
                item.DgenerateStr +=
                  " " + tag + lv + " " + level2[lv][0].sessionRange;

                switch (kiosk.systemSetting.lang) {
                  case "zh_TW":
                    var Seat = " | 座位: ";
                    break;

                  default:
                    var Seat = " | Seat: ";
                    break;
                }
                var lvLength = level2[lv].length;
                var ifSeatAvail = false;
                for (let i = 0; i < lvLength; i++) {
                  if (level2[lv][i].seatLabel !== "") {
                    if (!ifSeatAvail) {
                      ifSeatAvail = true;
                      item.DgenerateStr += Seat;
                    }
                    i === 0
                      ? (item.DgenerateStr += level2[lv][i].seatLabel)
                      : (item.DgenerateStr += "," + level2[lv][i].seatLabel);
                  }
                }
                item.DgenerateStr += "\r\n";

                for (var lv3 in level2[lv]) {
                  count += level2[lv][lv3].purchaseQuantity;
                  tmpItemTitle = "  " + tag + level2[lv][lv3].ticketTypeName;
                  tmpItemEnd =
                    "$" +
                    level2[lv][lv3].salePrice +
                    " * " +
                    level2[lv][lv3].purchaseQuantity;
                  item.DgenerateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
                  if (
                    level2[lv][lv3].bundleProductOrderList &&
                    level2[lv][lv3].bundleProductOrderList.length != 0
                  ) {
                    for (var d in level2[lv][lv3].bundleProductOrderList) {
                      tmpItemTitle =
                        "   " +
                        tag +
                        level2[lv][lv3].bundleProductOrderList[d].productName +
                        " - " +
                        level2[lv][lv3].bundleProductOrderList[d]
                          .ticketTypeName;
                      tmpItemEnd =
                        " * " +
                        level2[lv][lv3].bundleProductOrderList[d].quantity;
                      item.DgenerateStr += sfPaddingStr(
                        tmpItemTitle,
                        tmpItemEnd
                      );
                      // item.generateStr += '  ' + tag + itemList[k][p].bundleProductOrderList[d].productName + ' * ' + itemList[k][p].bundleProductOrderList[d].quantity + '\r\n';
                    }
                  }
                }
              }
              p = itemList[k].length;
            } else {
              count += itemList[k][p].purchaseQuantity;
              tmpItemTitle = " " + tag + itemList[k][p].ticketTypeName;
              tmpItemEnd =
                "$" +
                itemList[k][p].salePrice +
                " * " +
                itemList[k][p].purchaseQuantity;
              item.DgenerateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
              if (
                itemList[k][p].bundleProductOrderList &&
                itemList[k][p].bundleProductOrderList.length != 0
              ) {
                for (var d in itemList[k][p].bundleProductOrderList) {
                  tmpItemTitle =
                    "  " +
                    tag +
                    itemList[k][p].bundleProductOrderList[d].productName +
                    " - " +
                    itemList[k][p].bundleProductOrderList[d].ticketTypeName;
                  tmpItemEnd =
                    " * " + itemList[k][p].bundleProductOrderList[d].quantity;
                  item.DgenerateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
                  // item.generateStr += '  ' + tag + itemList[k][p].bundleProductOrderList[d].productName + ' * ' + itemList[k][p].bundleProductOrderList[d].quantity + '\r\n';
                }
              }
            }
          }
        }

        item.totalCount = count;

        /**
         * 沒發票的訂單：
         * 交易明細：退貨時請出示交易明細、票券
         * 有發票的訂單：
         * 交易明細：退貨時請出示發票、交易明細、票券
         */
        if (item.receiptType === "INVOICE") {
          item.taxInfo = "";
          if (item.invoiceData.untaxedSaleAmount != 0) {
            item.taxInfo += "未稅銷售額 " + item.invoiceData.untaxedSaleAmount;
          }
          if (item.invoiceData.invoiceTaxAmount != 0) {
            item.taxInfo += "稅額 " + item.invoiceData.invoiceTaxAmount;
          }
          if (item.invoiceData.amusementTaxAmount != 0) {
            item.taxInfo +=
              "\n代徵娛樂稅 " + item.invoiceData.amusementTaxAmount;
          }
          if (item.taxInfo != "") {
            item.taxInfo += "\r\n";
          }
        }

        item.Unified = "";
        item.kioskInvoice = "";
        if (item.touristInformation && item.touristInformation.remark != "") {
          item.Unified += item.touristInformation.remark.replace("買方 : ", "");
        }
        if (item.refundDescription != null) {
          item.kioskInvoice += item.refundDescription + "\r\n";
        }
      }

      item.now = moment().format("YYYY-MM-DD HH:mm");

      // 組合後台資訊
      var usePrintSet = null;
      for (var i = 0; i < kiosk.BESync.TicketTemplates.length; i++) {
        if (kiosk.BESync.TicketTemplates[i].TicketType == "8") {
          usePrintSet = kiosk.BESync.TicketTemplates[i];
          break;
        }
      }
      if (usePrintSet == null) {
        reject("找不到列印對應(8)");
        return;
      }

      if (item.instruction != "") {
        item.memoStr = item.instruction;
      } else {
        item.memoStr = usePrintSet.Memo;
      }
      if (recall) {
        item.recall = "補印";
      } else {
        item.recall = "";
      }

      if (!isPrintWithDetail) {
        usePrintSet.ThermalPrintID = "Payment-NoDetail";
      }

      customLibDevice.Thermal.Print(printer, usePrintSet.ThermalPrintID, item)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (res) {
          reject("列印失敗");
        });
    }
    // kios
  });
}

function printDetails(printer, itemSource, recall) {
  var item = JSON.parse(JSON.stringify(itemSource));
  item.merchantName =
    kiosk.status.posCheckDevice.merchantDeviceList[0].merchant.name;
  item.paymentSettingListName = item.paymentSettingList[0].name;
  item.paymentSettingListPrice = item.paymentSettingList[0].price + "";

  item.paidDate = moment(item.paidDate, "YYYYMMDDHHmm");
  item.paidDate = item.paidDate.format("YYYY-MM-DD HH:mm");

  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };
  var itemList = groupBy(item.productOrderList, "productName");
  item.generateStr = "";

  tag = "└";
  count = 0;
  for (var k in itemList) {
    item.generateStr += k + "\r\n";
    for (var p = 0; p < itemList[k].length; p++) {
      if (itemList[k][p].dateMode == "RESERVATION") {
        var level2 = groupBy(itemList[k], "bookingSpecName");
        for (var lv in level2) {
          item.generateStr += " " + tag + lv + " " + level2[lv][0].sessionRange;

          switch (kiosk.systemSetting.lang) {
            case "zh_TW":
              var Seat = " | 座位: ";
              break;

            default:
              var Seat = " | Seat: ";
              break;
          }
          var lvLength = level2[lv].length;
          var ifSeatAvail = false;
          for (let i = 0; i < lvLength; i++) {
            if (level2[lv][i].seatLabel !== "") {
              if (!ifSeatAvail) {
                ifSeatAvail = true;
                item.generateStr += Seat;
              }
              i === 0
                ? (item.generateStr += level2[lv][i].seatLabel)
                : (item.generateStr += "," + level2[lv][i].seatLabel);
            }
          }
          item.generateStr += "\r\n";

          for (var lv3 in level2[lv]) {
            count += level2[lv][lv3].purchaseQuantity;
            tmpItemTitle = "  " + tag + level2[lv][lv3].ticketTypeName;
            tmpItemEnd =
              "$" +
              level2[lv][lv3].salePrice +
              " * " +
              level2[lv][lv3].purchaseQuantity;
            item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
            if (
              level2[lv][lv3].bundleProductOrderList &&
              level2[lv][lv3].bundleProductOrderList.length != 0
            ) {
              for (var d in level2[lv][lv3].bundleProductOrderList) {
                tmpItemTitle =
                  "   " +
                  tag +
                  level2[lv][lv3].bundleProductOrderList[d].productName +
                  " - " +
                  level2[lv][lv3].bundleProductOrderList[d].ticketTypeName;
                tmpItemEnd =
                  " * " + level2[lv][lv3].bundleProductOrderList[d].quantity;
                item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
                // item.generateStr += '  ' + tag + itemList[k][p].bundleProductOrderList[d].productName + ' * ' + itemList[k][p].bundleProductOrderList[d].quantity + '\r\n';
              }
            }
          }
        }
        p = itemList[k].length;
      } else {
        count += itemList[k][p].purchaseQuantity;
        tmpItemTitle = " " + tag + itemList[k][p].ticketTypeName;
        tmpItemEnd =
          "$" +
          itemList[k][p].salePrice +
          " * " +
          itemList[k][p].purchaseQuantity;
        item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
        if (
          itemList[k][p].bundleProductOrderList &&
          itemList[k][p].bundleProductOrderList.length != 0
        ) {
          for (var d in itemList[k][p].bundleProductOrderList) {
            tmpItemTitle =
              "  " +
              tag +
              itemList[k][p].bundleProductOrderList[d].productName +
              " - " +
              itemList[k][p].bundleProductOrderList[d].ticketTypeName;
            tmpItemEnd =
              " * " + itemList[k][p].bundleProductOrderList[d].quantity;
            item.generateStr += sfPaddingStr(tmpItemTitle, tmpItemEnd);
            // item.generateStr += '  ' + tag + itemList[k][p].bundleProductOrderList[d].productName + ' * ' + itemList[k][p].bundleProductOrderList[d].quantity + '\r\n';
          }
        }
      }
    }
  }

  console.log(item.generateStr);
  item.totalCount = count;
  item.now = moment().format("YYYY-MM-DD HH:mm");
  item.saleDeviceCode = kiosk.systemSetting.deviceName;

  return new Promise(function (resolve, reject) {
    if (recall) {
      item.recall = "補印";
    } else {
      item.recall = "";
    }
    /**
     * 沒發票的訂單：
     * 交易明細：退貨時請出示交易明細、票券
     * 有發票得訂單：
     * 交易明細：退貨時請出示發票、交易明細、票券
     */
    if (item.receiptType === "INVOICE") {
      item.taxInfo = "";
      if (item.invoiceData.untaxedSaleAmount != 0) {
        item.taxInfo += "未稅銷售額 " + item.invoiceData.untaxedSaleAmount;
      }
      if (item.invoiceData.invoiceTaxAmount != 0) {
        item.taxInfo += " " + "稅額 " + item.invoiceData.invoiceTaxAmount;
      }
      if (item.invoiceData.amusementTaxAmount != 0) {
        item.taxInfo += "\r\n代徵娛樂稅 " + item.invoiceData.amusementTaxAmount;
      }
      if (item.invoiceData.exemptionAmount != 0) {
        item.taxInfo += "\r\n免開發票金額 " + item.invoiceData.exemptionAmount;
      }
      if (item.taxInfo != "") {
        item.taxInfo += "\r\n";
      }
    }

    item.Unified = "";
    item.kioskInvoice = "";
    if (item.touristInformation && item.touristInformation.remark != "") {
      item.Unified += item.touristInformation.remark.replace("買方 : ", "");
    }
    if (item.refundDescription != null) {
      item.kioskInvoice += item.refundDescription + "\r\n";
    }

    var usePrinterID = "Details";
    if (item.invoiceAllowanceList && item.invoiceAllowanceList.length != 0) {
      usePrinterID = "DetailsRefund";
      for (var index in item.invoiceAllowanceList) {
        item.invoiceAllowanceList[index].refundDate = moment(
          item.invoiceAllowanceList[index].refundDate,
          "YYYYMMDDHHmm"
        );
        item.invoiceAllowanceList[index].refundDate =
          item.invoiceAllowanceList[index].refundDate.format(
            "YYYY-MM-DD HH:mm"
          );
        item.invoiceAllowanceList[index].generateRefundStr = "";
        item.invoiceAllowanceList[index].totalCount = 0;
        item.invoiceAllowanceList[index].paymentNumber = item.paymentNumber;

        for (var kIndex in item.invoiceAllowanceList[index].itemList) {
          var k = item.invoiceAllowanceList[index].itemList[kIndex];
          item.invoiceAllowanceList[index].generateRefundStr += k.name + "\r\n";
          item.invoiceAllowanceList[index].generateRefundStr +=
            "$" + (k.unitPrice + "x" + k.quantity + "\r\n");
          item.invoiceAllowanceList[index].totalCount += k.quantity;
        }
        // item.generateRefundStr = '\r\n'
        if (item.receiptType === "INVOICE") {
          var refundTaxData = 0;
          item.invoiceAllowanceList[index].taxRefundInfo = "";
          if (item.invoiceAllowanceList[index].requireTaxSaleAmount != 0) {
            refundTaxData =
              item.invoiceAllowanceList[index].requireTaxSaleAmount;
          }
          if (item.invoiceAllowanceList[index].freeTaxSaleAmount != 0) {
            refundTaxData = item.invoiceAllowanceList[index].freeTaxSaleAmount;
          }
          if (item.invoiceAllowanceList[index].zeroTaxSaleAmount != 0) {
            refundTaxData = item.invoiceAllowanceList[index].zeroTaxSaleAmount;
          }
          if (refundTaxData != 0) {
            item.invoiceAllowanceList[index].taxRefundInfo +=
              "未稅銷售額 " + refundTaxData;
            item.invoiceAllowanceList[index].taxRefundInfo +=
              " " +
              "稅額 " +
              item.invoiceAllowanceList[index].allowanceTaxAmount;
            if (item.invoiceData.amusementTaxAmount != 0) {
              item.invoiceAllowanceList[index].taxRefundInfo +=
                "\r\n代徵娛樂稅 " + item.invoiceData.amusementTaxAmount;
            }
            if (item.invoiceData.exemptionAmount != 0) {
              item.invoiceAllowanceList[index].taxRefundInfo +=
                "\r\n免開發票金額 " + item.invoiceData.exemptionAmount;
            }
            item.invoiceAllowanceList[index].taxRefundInfo += "\r\n";
          }
        }
      }
    }
    if (item.invoiceData) {
      item.invoiceNumber = item.invoiceData.invoiceNumber;

      if (
        item.invoiceData.invoiceDeviceType === "MOBILE" &&
        item.invoiceData.invoiceDeviceCode
      ) {
        item.invoiceDeviceTypeName =
          item.invoiceData.invoiceDeviceTypeName +
          " " +
          item.invoiceData.invoiceDeviceCode;
      } else {
        item.invoiceDeviceTypeName = item.invoiceData.invoiceDeviceTypeName;
      }
    }

    customLibDevice.Thermal.Print(printer, usePrinterID, item)
      .then(function (res) {
        resolve(res);
      })
      .catch(function (err) {
        reject("列印失敗");
      });
  });
}

function PrintCashBalanceRecordChart() {
  return new Promise(function (resolve, reject) {
    var item = {};

    var setItem = new Promise(function (resolve, reject) {
      item.currentTime = moment().format("YYYY-MM-DD HH:mm");

      if (
        kiosk.CashBox.cc10_stock_now &&
        kiosk.CashBox.cc50_stock_now
        // && kiosk.CashBox.nd_stock_now
      ) {
        item.cc1_stock_now = 0;
        item.cc5_stock_now = 0;
        item.cc10_stock_now = kiosk.CashBox.cc10_stock_now;
        item.cc50_stock_now = kiosk.CashBox.cc50_stock_now;
        // item.nd_stock_now = kiosk.CashBox.nd_stock_now;

        item.cc1Total = 0;
        item.cc5Total = 0;
        item.cc10Total = item.cc10_stock_now * 10;
        item.cc50Total = item.cc50_stock_now * 50;
        // item.ndTotal = item.nd_stock_now * 100;

        var cashTotal = item.cc10Total + item.cc50Total;
        // + item.ndTotal;

        item.cashTotal = cashTotal;
        resolve();
      } else {
        customLibDevice.CashBox.deviceStatus()
          .then(function (res) {
            // 確保回傳資料格式正確，也避免產生JS錯誤
            var IfSuccess = false;
            try {
              if (typeof JSON.parse(res.resultJson) === "object") {
                IfSuccess = true;
              }
            } catch (err) {
              // 回傳資料格式錯誤
              IfSuccess = false;
              WriteLog(
                "PrintCashBalanceRecordChart - deviceStatus error:" +
                  JSON.stringify(res)
              );
              reject("列印失敗");
              return;
            }

            if (IfSuccess & res.IsSuccess) {
              var result = JSON.parse(res.resultJson);
              kiosk.CashBox.cc1_stock_now = 0;
              kiosk.CashBox.cc5_stock_now = 0;
              kiosk.CashBox.cc10_stock_now = result.cc10_stock;
              kiosk.CashBox.cc50_stock_now = result.cc50_stock;
              // kiosk.CashBox.nd_stock_now = result.nd_stock;

              item.cc1_stock_now = 0;
              item.cc5_stock_now = 0;
              item.cc10_stock_now = kiosk.CashBox.cc10_stock_now;
              item.cc50_stock_now = kiosk.CashBox.cc50_stock_now;
              // item.nd_stock_now = kiosk.CashBox.nd_stock_now;

              item.cc1Total = 0;
              item.cc5Total = 0;
              item.cc10Total = item.cc10_stock_now * 10;
              item.cc50Total = item.cc50_stock_now * 50;
              // item.ndTotal = item.nd_stock_now * 100;

              var cashTotal = item.cc10Total + item.cc50Total;
              // + item.ndTotal;

              item.cashTotal = cashTotal;
              resolve();
              return;
            }
          })
          .catch(function (err) {
            WriteLog(
              "PrintCashBalanceRecordChart - deviceStatus error:" +
                JSON.stringify(err)
            );
            reject("列印失敗");
          });
      }
    });

    Promise.all([setItem]).then(function (res) {
      if (res) {
        customLibDevice.Thermal.Print(
          kiosk.BESync.ReveivePrinterName,
          "CashBalanceRecordChart",
          item
        )
          .then(function (res) {
            resolve(res);
          })
          .catch(function (err) {
            WriteLog(
              "PrintCashBalanceRecordChart --- Print error：" +
                JSON.stringify(err)
            );
            reject("列印失敗");
          });
      }
    });
  });
}

function sfstrlen(str) {
  return str.replace(/[^\x00-\xff]/g, "xx").length;
}

function sfPaddingStr(tmpItemTitle, tmpItemEnd) {
  tmpItemTitle = tmpItemTitle + "";
  tmpItemEnd = tmpItemEnd + "";
  tmpItemTitleLen = sfstrlen(tmpItemTitle);
  tmpItemEndLen = sfstrlen(tmpItemEnd) + 1;
  var padding = 0;
  while (35 - tmpItemTitleLen - tmpItemEndLen < 0) {
    tmpItemTitleLen -= 35;
  }
  padding = 35 - tmpItemTitleLen - tmpItemEndLen;
  // console.log(padding)
  return tmpItemTitle + " ".padEnd(padding, " ") + tmpItemEnd + "\r\n";
}

function sfTSCPrintFormat(source, initArr, splitLen) {
  for (var i = 0; i < source.length; i++) {
    if (sfstrlen(source.substr(0, i)) > splitLen) {
      initArr.push(source.substr(0, i));
      sfTSCPrintFormat(source.substr(i), initArr, splitLen);
      break;
    }
    if (i + 1 == source.length) {
      initArr.push(source);
    }
  }
  return initArr;
}

function generateRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function generateRandomIntIP() {
  return (
    "127.0." + generateRandomInt(100, 200) + "." + generateRandomInt(100, 200)
  );
}

// 開錢箱
function OpenDrawer(printer) {
  kiosk.API.Device.Thermal.OpenDrawer(printer, function (res) {
    WriteLog(
      "OpenDrawer, printer: " + printer + ", res: " + JSON.stringify(res)
    );
  });
}

// 轉換卡機資料
function convertReaderRes(item, readerKey) {
  var result = {};
  switch (readerKey) {
    case "NCCC":
      //
      result.card_no = item.Card_No != null ? item.Card_No.trim() : "";
      result.terminal_id =
        item.Terminal_ID != null ? item.Terminal_ID.trim() : "";
      result.approval_code =
        item.Approval_No != null ? item.Approval_No.trim() : "";
      result.ref_no = item.Receipt_No != null ? item.Receipt_No.trim() : "";
      result.invoice_no = item.invoice_no != null ? item.invoice_no.trim() : "";
      result.amount1 = parseInt(
        item.Trans_Amount.substring(0, item.Trans_Amount.length - 2).trim()
      ).toString();
      result.resp_code =
        item.ECR_Response_Code != null ? item.ECR_Response_Code.trim() : "";
      result.rrn = item.Sp_Origin_RRN != null ? item.Sp_Origin_RRN.trim() : "";
      result.transDate = item.Trans_Date != null ? item.Trans_Date.trim() : "";
      // result.card_no = item.card_no.trim();
      // result.terminal_id = item.terminal_id.trim();
      // result.approval_code = item.approval_code.trim();
      // result.ref_no = item.ref_no.trim();
      // result.invoice_no = item.invoice_no.trim();
      // result.amount1 = item.amount1
      //   .substring(0, item.amount1.length - 2)
      //   .trim();
      // result.resp_code = item.resp_code.trim();
      break;

    case "CTBCS3":
      // 中信
      result.card_no = item.card_no.trim();
      result.terminal_id = item.terminal_id.trim();
      result.approval_code = item.approval_code.trim();
      result.ref_no = item.ref_no.trim();
      result.invoice_no = item.invoice_no.trim();
      result.amount1 = item.amount1
        .substring(0, item.amount1.length - 2)
        .trim();
      result.resp_code = item.resp_code.trim();
      break;

    case "CTBC":
      // 中信
      result.card_no = item.card_no;
      result.terminal_id = item.terminal_id;
      result.approval_code = item.approval_code;
      result.ref_no = item.ref_no;
      result.invoice_no = item.invoice_no;
      result.amount1 = item.amount1
        .substring(0, item.amount1.length - 2)
        .trim();
      result.resp_code = item.resp_code;
      // result.card_no = item.card_no.trim();
      // result.terminal_id = item.terminal_id.trim();
      // result.approval_code = item.approval_code.trim();
      // result.ref_no = item.ref_no.trim();
      // result.invoice_no = item.invoice_no.trim();
      // result.amount1 = item.amount1
      //   .substring(0, item.amount1.length - 2)
      //   .trim();
      // result.resp_code = item.resp_code.trim();
      break;

    case "SINOPAC":
      // 永豐
      if (item.TransType == "01") {
        result.card_no = item.CardNo.trim();
        result.terminal_id = item.TerminalID.trim();
        result.approval_code = item.ApprovalNo.trim();
        result.ref_no = item.ReferenceNo.trim();
        result.invoice_no = item.InvoiceNo.trim();
        result.amount1 = parseInt(
          item.TransAmount.substring(0, item.TransAmount.length - 2).trim()
        ).toString();
        result.resp_code = item.ECRResponseCode.trim();
      } else {
        result.card_no = item.EasyCardNo.trim();
        result.terminal_id = item.EDCTerminalID.trim();
        result.ref_no = item.Reference_No.trim();
        result.invoice_no = item.InvoiceNo.trim();
        result.amount1 = parseInt(
          item.TransAmount.substring(0, item.TransAmount.length - 2).trim()
        ).toString();
        result.resp_code = item.ECR_Response_Code.trim();
      }
      break;
    case "TAISHIN":
      // 台新TVM
      if (item.Trans_Type == "01") {
        result.card_no = item.Card_No.trim();
        result.terminal_id = item.Terminal_ID.trim();
        result.approval_code = item.Approval_No.trim();
        result.ref_no = item.Reference_No.trim();
        result.invoice_no = item.Receipt_No.trim();
        result.amount1 = parseInt(
          item.Trans_Amount.substring(0, item.Trans_Amount.length - 2).trim()
        ).toString();
        result.resp_code = item.ECR_Response_Code.trim();
      } else {
        result.card_no = item.Card_No.trim();
        result.terminal_id = item.Terminal_ID.trim();
        result.ref_no = item.Reference_No.trim();
        result.invoice_no = "";
        result.amount1 = parseInt(
          item.Trans_Amount.substring(0, item.Trans_Amount.length - 2).trim()
        ).toString();
        result.resp_code = item.ECR_Response_Code.trim();
      }
      break;
  }
  return result;
}

function refreshTicketData() {
  try {
    // var vm = this;
    var orderListUI = [];
    var ticketTotalAmt = 0;
    var ticketTotalNum = 0;
    var product = kiosk.status.posSaleProductList.saleProductList;
    var orderList = [];

    kiosk.status.orderList = [];
    kiosk.status.ticketTotalNum = 0;
    kiosk.status.ticketTotalAmt = 0;
    kiosk.status.hasOrder = false;

    product.map(function (productItem) {
      var subtotal = 0;
      var orderItemList = [];
      var dec;
      var bookingDate;

      if (productItem.productType === "TICKET") {
        var Session = {
          dec: null,
          ticketItem: [],
        };
        var orderItemListForPay = [];
        productItem.ticketData.saleProductSpecList.map(function (ticketItem) {
          if (ticketItem.quantity > 0) {
            // API posCreatePayment用
            subtotal += ticketItem.quantity * ticketItem.salePrice;
            ticketTotalNum += ticketItem.quantity;
            kiosk.status.ticketTotalNum += ticketItem.quantity;
            Session.ticketItem.push(ticketItem);
            orderItemListForPay.push({
              // UI 用  START
              ticketTypeName: ticketItem.ticketTypeName,
              salePrice: ticketItem.salePrice,
              // UI 用  E N D
              quantity: ticketItem.quantity,
              saleProductSpecId: ticketItem.saleProductSpecId,
            });
            console.log(ticketItem);
            // confirm UI用
            var selTicket = ticketItem;
            selTicket.saleProductName = productItem.saleProductName;
            //   kiosk.status.selTicket.push(selTicket)
          }
        });
        if (Session.ticketItem.length != 0) {
          orderItemList.push(Session);
        }
        if (orderItemList.length != 0) {
          // API posCreatePayment用
          var orderListTmp2 = {
            // UI 用
            saleProductName: productItem.saleProductName,
            saleProductId: productItem.saleProductId,
            dec: dec,
            bookingDate: bookingDate,
            subtotal: subtotal,
            orderItemList: orderItemList,
            needInvoice: productItem.needInvoice,
            paymentSettingList: productItem.paymentSettingList,
            productType: productItem.productType,
          };
          var orderListForPay = {
            // UI 用
            saleProductName: productItem.saleProductName,
            saleProductId: productItem.saleProductId,
            subtotal: subtotal,
            orderItemList: orderItemListForPay,
          };
          ticketTotalAmt += subtotal;
          orderList.push(orderListTmp2);
          kiosk.status.hasOrder |= true;
          // confirm UI用
          kiosk.status.orderList.push(orderListForPay);
          orderListUI.push(orderListTmp2);
          kiosk.status.ticketTotalAmt += subtotal;
        }
      } else if (productItem.productType === "RESERVATION") {
        if (productItem.saleProductSum != null) {
          productItem.saleProductSum.map(function (saleProductItem) {
            if (saleProductItem.detail != null) {
              var orderItemListForPay = [];
              var tmpTotal = 0;
              saleProductItem.detail.map(function (detailItem) {
                var date = saleProductItem.date;
                date =
                  date.substring(0, 4) +
                  "/" +
                  date.substring(4, 6) +
                  "/" +
                  date.substring(6, 8);
                date += " ";
                if (detailItem.sessionStartTime != null) {
                  date += detailItem.sessionStartTime + " ";
                }
                var Session = {
                  dec: date + detailItem.bookingSpecName,
                  sndec: {
                    date:
                      saleProductItem.date.substring(0, 4) +
                      "/" +
                      saleProductItem.date.substring(4, 6) +
                      "/" +
                      saleProductItem.date.substring(6, 8),
                    time: detailItem.sessionStartTime,
                    name: detailItem.bookingSpecName,
                  },
                  ticketItem: [],
                };
                bookingDate = detailItem.bookingDate;
                detailItem.ticketType.map(function (ticketItem) {
                  if (ticketItem.quantity > 0) {
                    // API posCreatePayment用
                    subtotal += ticketItem.quantity * ticketItem.salePrice;
                    tmpTotal += ticketItem.quantity * ticketItem.salePrice;
                    ticketTotalNum += ticketItem.quantity;
                    kiosk.status.ticketTotalNum += ticketItem.quantity;
                    var seats = "";
                    if (
                      ticketItem.seatDataList &&
                      Array.isArray(ticketItem.seatDataList) &&
                      ticketItem.seatDataList.length > 0
                    ) {
                      for (
                        var i = 0, length = ticketItem.seatDataList.length;
                        i < length;
                        i++
                      ) {
                        if (ticketItem.seatDataList[i].coordinate) {
                          if (i > 0) {
                            seats += ",";
                          }
                          seats += ticketItem.seatDataList[i].coordinate;
                        }
                      }
                    }
                    Session.ticketItem.push(ticketItem);
                    orderItemListForPay.push({
                      // UI 用  START
                      ticketTypeName: ticketItem.ticketTypeName,
                      salePrice: ticketItem.salePrice,
                      // UI 用  E N D
                      quantity: ticketItem.quantity,
                      saleProductSpecId: ticketItem.saleProductSpecId,
                      seats: seats,
                    });
                    // confirm UI用
                    var selTicket = ticketItem;
                    selTicket.saleProductName = productItem.saleProductName;
                    //   kiosk.status.selTicket.push(selTicket)
                  }
                });
                if (Session.ticketItem.length != 0) {
                  orderItemList.push(Session);
                }
              });

              if (orderItemListForPay.length != 0) {
                // API posCreatePayment用
                var orderListForPay = {
                  // UI 用
                  saleProductName: productItem.saleProductName,
                  saleProductId: productItem.saleProductId,
                  subtotal: tmpTotal,
                  orderItemList: orderItemListForPay,
                  bookingDate: saleProductItem.date,
                  needInvoice: productItem.needInvoice,
                };
                // confirm UI用
                kiosk.status.orderList.push(orderListForPay);
              }
            }
          });

          if (orderItemList.length != 0) {
            // API posCreatePayment用
            var orderListTmp = {
              // UI 用
              saleProductName: productItem.saleProductName,
              saleProductId: productItem.saleProductId,
              dec: dec,
              bookingDate: bookingDate,
              subtotal: subtotal,
              orderItemList: orderItemList,
              needInvoice: productItem.needInvoice,
              paymentSettingList: productItem.paymentSettingList,
            };
            ticketTotalAmt += subtotal;
            orderList.push(orderListTmp);
            kiosk.status.hasOrder |= true;
            // confirm UI用
            orderListUI.push(orderListTmp);
            kiosk.status.ticketTotalAmt += subtotal;
          }
        }
      }
    });
    kiosk.status.orderListForCart = orderList;
    kiosk.status.orderListUI = orderListUI;
    kiosk.status.SecendMonitor = {
      mode: 1,
      ticketTotalAmt: kiosk.status.ticketTotalAmt,
      ticketTotalNum: kiosk.status.ticketTotalNum,
      orderListUI: orderListUI,
    };
  } catch (error) {
    WriteLog("refreshTicketData catch: " + JSON.stringify(error));
  }
}

function TVMSwal(sp_config) {
  // var sp_config = {
  //   spTitleText: '付款失敗',
  //   spContentTitle: '付款失敗<br>請重新付款',
  //   spContentText: '訂單編號 : PN1371330858<br>#123-12345678',
  //   spBtnLeftText: '<img src="./img/icon_notok.png" alt="">放棄購買',
  //   spBtnLeftFn: function () {},
  //   spBtnRightText: '重新付款',
  //   spBtnRightFn: function () {},
  // }
  var swal_config = {
    title:
      '<div class="alertItem">' +
      '<div class="alertTitle">' +
      (sp_config.spTitleText ? sp_config.spTitleText : "") +
      "</div>" +
      '<div class="alertCont">' +
      '<div class="alertContTitle d-flex flex-column justify-content-center h-100">' +
      (sp_config.spContentTitle ? sp_config.spContentTitle : "") +
      (sp_config.spContentText
        ? '<div class="alertContText">' +
          (sp_config.spContentText ? sp_config.spContentText : "") +
          "</div>"
        : "") +
      "</div>" +
      "</div>" +
      '<div class="alertFooter my-2" style="">' +
      (sp_config.spBtnLeftText
        ? '<button class="btn btn-lg  rounded-pill btnSize PJFailbtn spBtnLeft">' +
          (sp_config.spBtnLeftText ? sp_config.spBtnLeftText : "") +
          "</button>"
        : "") +
      (sp_config.spBtnRightText
        ? '<button class="btn btn-lg   rounded-pill btnSize PJbtn  spBtnRight ">' +
          (sp_config.spBtnRightText ? sp_config.spBtnRightText : "") +
          "</button>"
        : "") +
      (sp_config.spTimerText
        ? "<div>" +
          (sp_config.spTimerText ? sp_config.spTimerText : "") +
          "</div>"
        : "") +
      "</div>" +
      "</div>",
    allowOutsideClick: false,
    buttonsStyling: false,
    showConfirmButton: false,
    showCloseButton: false,
    showCancelButton: false,
    customClass: "alertItem",
    onOpen: function () {
      $(".spBtnLeft").click(function () {
        if (sp_config.spBtnLeftFn != null) {
          sp_config.spBtnLeftFn();
        }
        swal.close();
      });
      $(".spBtnRight").click(function () {
        if (sp_config.spBtnRightFn != null) {
          sp_config.spBtnRightFn();
        }
        swal.close();
      });
    },
  };
  swal(swal_config);
}

function TVMSettle() {
  return new Promise(function (resolve, reject) {
    var index = -1;
    var SettleType = "";
    var PayTypes = kiosk.BESync.PayTypes;

    // 結帳清單
    var SettleList = [
      { PayTypes: "NCCC", SettleFn: customLibDevice.FIN.NCCCSettle },
      { PayTypes: "CTBC", SettleFn: customLibDevice.FIN.CTBCSettle },
      { PayTypes: "SINOPAC", SettleFn: customLibDevice.FIN.SINOPACSettle },
      { PayTypes: "TAISHIN", SettleFn: customLibDevice.FIN.TAISHINSettle },
    ];

    // 根據清單中的PayTypes呼叫對應function
    SettleList.forEach(function (ele) {
      if (SettleType === "") {
        index = PayTypes.findIndex(function (res) {
          return res.PayTypeAction === ele.PayTypes;
        });

        if (index != -1) {
          SettleType = ele.PayTypes;
          handleSettle(ele.SettleFn, PayTypes);
        }
      }
    });

    function handleSettle(SettleFn, PayTypes) {
      SettleFn(PayTypes)
        .then(function (res) {
          resolve(res);
        })
        .catch(function (res) {
          reject(res);
        });
    }
  });
}

function checkPrinterStatus() {
  return new Promise(function (resolve, reject) {
    if (
      // 若 票券印表機 跟 明細印表機 是同一台
      kiosk.BESync.TicketPrinterName === kiosk.BESync.ReveivePrinterName
    ) {
      var IfSamePrinter = true;
    } else {
      var IfSamePrinter = false;
    }

    if (!testFlag.viewDebugger) {
      var TicketPrinter_STATUS = new Promise(function (resolve, reject) {
        // 檢查狀態時，若印表機是247則進行二次檢查
        // 247的紙張相關異常與上蓋未關異常，需要二次檢查才會回傳正確的印表機狀態
        customLibDevice.Thermal.Status()
          .then(function (res) {
            if (kiosk.BESync.TicketPrinterName === "TSP-247") {
              customLibDevice.Thermal.Status()
                .then(function (res) {
                  checkTSCLimit(res);

                  resolve(res);
                })
                .catch(function (err) {
                  updateDeviceErrorText(1, 0, err);

                  if (IfSamePrinter) {
                    updateDeviceErrorText(2, 0, err);
                  }

                  resolve(err);
                });
            } else {
              updateDeviceErrorText(1, 1, res);

              if (IfSamePrinter) {
                updateDeviceErrorText(2, 1, res);
                // 若非低水位且狀態正常，則歸零可再印製張數
                kiosk.systemSetting.ReceiptPrinterNearEndPrintCount = 0;
                commonExt.setJson("systemSetting", kiosk.systemSetting);
              }
              resolve(res);
            }
          })
          .catch(function (err) {
            if (kiosk.BESync.TicketPrinterName === "TSP-247") {
              customLibDevice.Thermal.Status()
                .then(function (res) {
                  checkTSCLimit(res);

                  resolve(res);
                })
                .catch(function (err) {
                  updateDeviceErrorText(1, 0, err);

                  if (IfSamePrinter) {
                    updateDeviceErrorText(2, 0, err);
                  }

                  resolve(err);
                });
            } else {
              // 若低水位時，有預期可再印製張數，則繼續列印
              if (
                err.IsSuccess &&
                err.IsNearEnd &&
                parseInt(kiosk.systemSetting.ReceiptPrinterNearEndPrintLimit) >
                  0 &&
                kiosk.systemSetting.ReceiptPrinterNearEndPrintCount /
                  parseInt(
                    kiosk.systemSetting.ReceiptPrinterNearEndPrintLimit
                  ) <
                  1
              ) {
                handleResult(true, err);
              } else {
                handleResult(false, err);
              }

              function handleResult(isSuccess, res) {
                updateDeviceErrorText(1, isSuccess ? 1 : 0, res);

                if (IfSamePrinter) {
                  updateDeviceErrorText(2, isSuccess ? 1 : 0, res);
                }
              }
              resolve(err);
            }
          });

        function checkTSCLimit(response) {
          if (
            !isNaN(parseInt(kiosk.systemSetting.TSCLimit)) &&
            !isNaN(parseInt(kiosk.systemSetting.printCount))
          ) {
            handleCheckRes(response);
          } else {
            commonExt.getJson("systemSetting").then(function (res) {
              handleCheckRes(response);
            });
          }

          function handleCheckRes(res) {
            var TSCLimit = parseInt(kiosk.systemSetting.TSCLimit);
            var printCount = parseInt(kiosk.systemSetting.printCount);
            if (printCount > TSCLimit) {
              // 非直接判斷回傳JSON的欄位，因此需要額外加ActionLog
              // 更新異常提示文字並寫入裝置異常Log(TSCLimit)
              updateDeviceErrorText(1, 2, "紙張將盡");
              addDeviceActionLog(1, res);
            } else {
              // 更新異常提示文字(正常)
              updateDeviceErrorText(1, 1, res);
            }
          }
        }
        return;
      });

      var ReveivePrinter_STATUS = new Promise(function (resolve, reject) {
        if (IfSamePrinter) {
          resolve();
          return;
        } else {
          customLibDevice.Thermal.ReveiveStatus()
            .then(function (res) {
              if (res.IsSuccess) {
                // 若非低水位且狀態正常，則歸零可再印製張數
                kiosk.systemSetting.ReceiptPrinterNearEndPrintCount = 0;
                commonExt.setJson("systemSetting", kiosk.systemSetting);
                updateDeviceErrorText(2, 1, res);
              } else {
                updateDeviceErrorText(2, 0, res);
              }
              resolve(res);
            })
            .catch(function (err) {
              // 若低水位時，有預期可再印製張數，則繼續列印
              if (
                err.IsSuccess &&
                err.IsNearEnd &&
                parseInt(kiosk.systemSetting.ReceiptPrinterNearEndPrintLimit) >
                  0 &&
                kiosk.systemSetting.ReceiptPrinterNearEndPrintCount /
                  parseInt(
                    kiosk.systemSetting.ReceiptPrinterNearEndPrintLimit
                  ) <
                  1
              ) {
                updateDeviceErrorText(2, 1, err);
              } else {
                updateDeviceErrorText(2, 0, err);
              }
              resolve(err);
            });
        }
      });

      Promise.all([TicketPrinter_STATUS, ReveivePrinter_STATUS]).then(function (
        res
      ) {
        // 檢查是否LINE通知
        checkIfKioskNotify();
        resolve(res);
      });

      /**
       * @param {number} printer
       * 1：票券印表機
       * 2：明細印表機
       */
      // 寫入 裝置異常Log
      function addDeviceActionLog(printer, status) {
        var ticketPrinterAcitonLog = JSON.stringify({
          member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          action: "request_print",
          version: kiosk.BESync ? kiosk.BESync.Version : "",
          TicketPrinterName: kiosk.BESync.TicketPrinterName
            ? kiosk.BESync.TicketPrinterName
            : "",
          response: status ? status : "",
        });

        var ReveivePrinterActionLog = JSON.stringify({
          member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          action: "request_print",
          version: kiosk.BESync ? kiosk.BESync.Version : "",
          ReveivePrinterName: kiosk.BESync.ReveivePrinterName
            ? kiosk.BESync.ReveivePrinterName
            : "",
          response: status ? status : "",
        });

        switch (printer) {
          // 票券印表機
          case 1:
            if (
              kiosk.BESync.TicketPrinterName === "TSP-247" &&
              kiosk.app.deviceStatus.TicketPrinter_errorType === "紙張將盡"
            ) {
              BackEnd.AddActionLog(
                "5",
                kiosk.BESync.TicketPrinterName +
                  " - " +
                  kiosk.app.deviceStatus.TicketPrinter_errorType,
                ticketPrinterAcitonLog
              );
            } else {
              BackEnd.AddActionLog(
                "5",
                kiosk.BESync.TicketPrinterName +
                  " - " +
                  customLibDevice.Thermal.converterError(
                    status,
                    kiosk.BESync.TicketPrinterName
                  ),
                ticketPrinterAcitonLog
              );
            }
            break;

          // 明細印表機
          case 2:
            BackEnd.AddActionLog(
              "5",
              kiosk.BESync.ReveivePrinterName +
                " - " +
                customLibDevice.Thermal.converterError(
                  status,
                  kiosk.BESync.ReveivePrinterName
                ),
              ReveivePrinterActionLog
            );
            break;
        }
      }

      /**
       * @param {number} printer
       * 1：票券印表機
       * 2：明細印表機
       * @param {number} error
       * 0：異常
       * 1：正常
       * 2：特殊異常(非印表機回傳異常，如程式判斷的TSC紙張低水位)
       * @param {object} status 印表機狀態(印表機回傳 或 傳入文字)
       */
      function updateDeviceErrorText(printer, error, status) {
        var DefaultErrorText = "異常";

        // 判斷異常狀態並轉換為文字(LINE通知與畫面顯示)
        function startUpdate(printerType, ErrorType, callBackFn) {
          var PRINTER, ERROR;
          switch (printerType) {
            case 1:
              PRINTER = "TICKETPRINTER";
              ERROR = "TicketPrinter_errorType";
              break;

            case 2:
              PRINTER = "REVEIVEPRINTER";
              ERROR = "ReveivePrinter_errorType";
              break;
          }
          kiosk.app.deviceStatus[PRINTER] = ErrorType;
          if (kiosk.app.deviceStatus[PRINTER] == 1) {
            kiosk.app.deviceStatus[ERROR] = null;
          } else {
            if (error == 2 && typeof status == "string") {
              kiosk.app.deviceStatus[ERROR] = status;
            } else {
              kiosk.app.deviceStatus[ERROR] = status
                ? customLibDevice.Thermal.converterError(
                    status,
                    printerType == 1
                      ? kiosk.BESync.TicketPrinterName
                      : kiosk.BESync.ReveivePrinterName
                  )
                : DefaultErrorText;
            }
          }
          if (callBackFn != null) {
            callBackFn();
          }
        }

        switch (error) {
          // 異常
          case 0:
            startUpdate(printer, 0);
            break;

          // 正常
          case 1:
            startUpdate(printer, 1);
            break;

          // 特殊異常
          case 2:
            startUpdate(printer, 0);
            break;
        }
        // // updateLastErrorType(printer);
        // switch (printer) {
        //   case 1:
        //     switch (error) {
        //       case 0:
        //         startUpdate(printer, 0);
        //         break;

        //       case 1:
        //         startUpdate(printer, 1);
        //         break;

        //       // 特殊異常
        //       case 2:
        //         startUpdate(printer, 0);
        //         break;
        //     }
        //     break;

        //   case 2:
        //     switch (error) {
        //       // 異常
        //       case 0:
        //         startUpdate(printer, 0);
        //         break;

        //       // 正常
        //       case 1:
        //         startUpdate(printer, 1);
        //         break;

        //       // 特殊異常
        //       case 2:
        //         startUpdate(printer, 0);
        //         break;
        //     }
        //     break;
        // }
      }

      // LINE通知
      function checkIfKioskNotify() {
        var DefaultErrorText = "異常";
        // 檢查印表機是否有任何異常
        if (
          kiosk.app.deviceStatus.TICKETPRINTER !== 1 ||
          kiosk.app.deviceStatus.REVEIVEPRINTER !== 1
        ) {
          // // 檢查印表機狀態是否改變(與前次檢查結果比較) → 改變 → 發LINE通知
          // // 若 持續正常 或 持續相同異常 → 不發LINE通知
          // if (
          //   kiosk.app.deviceStatus.TicketPrinter_errorType !==
          //     kiosk.app.deviceStatus.LAST_TicketPrinter_errorType ||
          //   kiosk.app.deviceStatus.ReveivePrinter_errorType !==
          //     kiosk.app.deviceStatus.LAST_ReveivePrinter_errorType
          // ) {
          // 產生LINE通知內容
          var NotifyText = "";
          // 票券印表機
          switch (kiosk.app.deviceStatus.TICKETPRINTER) {
            case 0:
              NotifyText +=
                "\n" +
                kiosk.BESync.TicketPrinterName +
                "票券印表機-" +
                (kiosk.app.deviceStatus.TicketPrinter_errorType
                  ? kiosk.app.deviceStatus.TicketPrinter_errorType
                  : DefaultErrorText) +
                "\n";
              break;

            case 1:
              NotifyText +=
                "\n" + kiosk.BESync.TicketPrinterName + "票券印表機-連線正常\n";
              break;

            default:
              break;
          }

          // 交易明細印表機
          switch (kiosk.app.deviceStatus.REVEIVEPRINTER) {
            case 0:
              NotifyText +=
                kiosk.BESync.ReveivePrinterName +
                "明細印表機-" +
                (kiosk.app.deviceStatus.ReveivePrinter_errorType
                  ? kiosk.app.deviceStatus.ReveivePrinter_errorType
                  : DefaultErrorText);
              break;

            case 1:
              NotifyText +=
                kiosk.BESync.ReveivePrinterName + "明細印表機-連線正常";
              break;

            default:
              break;
          }

          // 打API到KMS，讓KMS發LINE通知
          BackEnd.KioskNotify(NotifyText);
          // }
        }
      }
    } else {
      // 測試 - 印表機檢查ByPass
      kiosk.app.deviceStatus.TicketPrinter_errorType = "";
      kiosk.app.deviceStatus.ReveivePrinter_errorType = "";
      kiosk.app.deviceStatus.TICKETPRINTER = 1;
      kiosk.app.deviceStatus.REVEIVEPRINTER = 1;
      resolve("TEST");
    }
  });
}

function checkCashBox() {
  var vm = this;
  if (!kiosk.systemSetting.useICTCash) return;

  // 檢查現金模組各機器 連線狀態
  customLibDevice.CashBox.deviceStatus()
    .then(function (res) {
      // WriteLog("deviceStatus:" + JSON.stringify(res));

      // 確保回傳資料格式正確，也避免產生JS錯誤
      var IfSuccess = false;
      try {
        if (typeof JSON.parse(res.resultJson) === "object") {
          IfSuccess = true;
        }
      } catch (err) {
        IfSuccess = false;
        handleCASHBOXERROR(
          "checkCashBox - deviceStatus error:",
          JSON.stringify(err)
        );
        return;
      }

      if (IfSuccess && res.IsSuccess) {
        // WriteLog("checkCashBox - deviceStatus success - IfSuccess true");
        var result = JSON.parse(res.resultJson);
        // 避免存量參數有問題時仍更新變數(特定異常狀況下存量參數可能變成-1)
        // 存量參數都在deviceStatus中檢查並更新，不能透過paymentStatus來取得現金存量參數
        // 因為機器狀態異常時，paymentStatus回傳的現金存量參數會歸零，但此時deviceStatus或endPayment回傳的是正常的
        if (
          !isNaN(result.cc1_stock) &&
          !isNaN(result.cc5_stock) &&
          !isNaN(result.cc10_stock) &&
          !isNaN(result.cc50_stock) &&
          // !isNaN(result.nd_stock) &&
          result.cc1_stock >= 0 &&
          result.cc5_stock >= 0 &&
          result.cc10_stock >= 0 &&
          result.cc50_stock >= 0
          // && result.nd_stock >= 0
        ) {
          // 開機後首次進入首頁 或 idle回首頁時，才會更新變數(平常只會在結帳完才更新)
          if (
            kiosk.CashBox.cc1_stock_now === "載入中" ||
            kiosk.CashBox.cc5_stock_now === "載入中" ||
            kiosk.CashBox.cc10_stock_now === "載入中" ||
            kiosk.CashBox.cc50_stock_now === "載入中"
            // || kiosk.CashBox.nd_stock_now === "載入中"
          ) {
            // 開機更新存量參數
            kiosk.CashBox.cc1_stock_now = 0;
            kiosk.CashBox.cc5_stock_now = 0;
            kiosk.CashBox.cc10_stock_now = result.cc10_stock;
            kiosk.CashBox.cc50_stock_now = result.cc50_stock;
            // kiosk.CashBox.cc1_stock_now = result.cc1_stock;
            // kiosk.CashBox.cc5_stock_now = result.cc5_stock;
            // kiosk.CashBox.nd_stock_now = result.nd_stock;
          }
        } else {
          // 存量參數異常
          handleCASHBOXERROR(
            "checkCashBox - deviceStatus error:",
            JSON.stringify(res)
          );
          handleBalanceError();
          return;
        }

        // 若全裝置 連線狀態正常
        // currencyStatus硬幣機 rejectStatus驗鈔機 slotStatus退鈔機
        if (
          result &&
          result.currencyStatus_obj === 0 &&
          result.rejectStatus_obj == 0
          // && result.slotStatus_obj == 0
        ) {
          // 檢查現金模組各機器 機器狀態及使用狀態(包含感測器異常等狀況)
          customLibDevice.CashBox.paymentStatus()
            .then(function (res) {
              // WriteLog("paymentStatus:" + JSON.stringify(res));

              // 確保回傳資料格式正確，也避免產生JS錯誤
              var IfSuccess = false;
              try {
                if (typeof JSON.parse(res.resultJson) === "object") {
                  IfSuccess = true;
                }
              } catch (err) {
                IfSuccess = false;
                handleCASHBOXERROR(
                  "checkCashBox - paymentStatus error:",
                  JSON.stringify(err)
                );
                return;
              }

              // 若全裝置 機器狀態正常
              // 交易狀態：1-等待交易
              // 硬幣機 15-停用
              // 驗鈔機 11-停用 (6-存鈔箱滿，3-感測器異常 → 可能是儲存盒被拔下)
              // 退鈔機 0-正常 (16-鈔票太少警戒 → 沒鈔票)
              if (
                IfSuccess &&
                res.IsSuccess &&
                JSON.parse(res.resultJson) &&
                JSON.parse(res.resultJson).transactionStep == 1 &&
                JSON.parse(res.resultJson).currencyStatus_obj == 15 &&
                JSON.parse(res.resultJson).rejectStatus_obj == 11
                // && JSON.parse(res.resultJson).slotStatus_obj == 0
              ) {
                kiosk.app.deviceStatus.CASHBOX = 1;
                kiosk.app.deviceStatus.CASHBOXERRORalert = false;
              }
              // 若任一裝置 機器狀態異常
              else {
                handleCASHBOXERROR(
                  "checkCashBox - paymentStatus error:",
                  JSON.stringify(res)
                );
                return;
              }
            })
            .catch(function (err) {
              handleCASHBOXERROR(
                "checkCashBox - paymentStatus catch:",
                JSON.stringify(err)
              );
            });
        }
        // 若任一裝置 連線狀態異常
        else {
          handleCASHBOXERROR(
            "checkCashBox - deviceStatus error:",
            JSON.stringify(res)
          );
        }
      } else {
        handleCASHBOXERROR(
          "checkCashBox - deviceStatus error:",
          JSON.stringify(res)
        );
        handleBalanceError();
      }
    })
    .catch(function (err) {
      handleCASHBOXERROR(
        "checkCashBox - deviceStatus catch:",
        JSON.stringify(err)
      );
      handleBalanceError();
    });

  function handleCASHBOXERROR(LogText, ERROR) {
    if (!kiosk.systemSetting.useICTCash) return;

    kiosk.app.deviceStatus.CASHBOX = 0;
    typeof JSON.parse(ERROR) === "object"
      ? handleCASHBOXERRORalert(JSON.parse(ERROR))
      : handleCASHBOXERRORalert();
    if (typeof LogText === "string" && typeof ERROR === "string") {
      WriteLog(LogText + ERROR);
    } else {
      WriteLog("handleCASHBOXERROR parameter error");
    }
  }

  function handleBalanceError() {
    if (!kiosk.CashBox.cc1_stock_now) kiosk.CashBox.cc1_stock_now = 0;
    if (!kiosk.CashBox.cc5_stock_now) kiosk.CashBox.cc5_stock_now = 0;
    if (!kiosk.CashBox.cc10_stock_now) kiosk.CashBox.cc10_stock_now = "異常";
    if (!kiosk.CashBox.cc50_stock_now) kiosk.CashBox.cc50_stock_now = "異常";

    // if (!kiosk.CashBox.cc1_stock_now) kiosk.CashBox.cc1_stock_now = "異常";
    // if (!kiosk.CashBox.cc5_stock_now) kiosk.CashBox.cc5_stock_now = "異常";
    // if (!kiosk.CashBox.nd_stock_now) kiosk.CashBox.nd_stock_now = "異常";
  }

  function handleCASHBOXERRORalert(res) {
    // 若現金模組異常須停止現金付款
    if (!kiosk.app.deviceStatus.CASHBOXERRORalert) {
      kiosk.app.deviceStatus.CASHBOXERRORalert = true;
      var NotifyText =
        moment().format("YYYY-MM-DD") +
        " 現金機異常通知 - 已停止現金收款功能，請檢查機器狀態並重開app。";
      BackEnd.KioskNotify(NotifyText);
      res && typeof res === "object"
        ? WriteLog(
            "handleCASHBOXERRORalert - CASHBOXERROR :" + JSON.stringify(res)
          )
        : WriteLog("handleCASHBOXERRORalert - CASHBOXERROR");
    }
  }
}

function DetectBalance() {
  customLibDevice.CashBox.deviceStatus()
    .then(function (res) {
      // 確保回傳資料格式正確，也避免產生JS錯誤
      var IfSuccess = false;
      try {
        if (typeof JSON.parse(res.resultJson) === "object") {
          IfSuccess = true;
        }
      } catch (error) {
        IfSuccess = false;
        WriteLog(
          "DetectBalance - deviceStatus success - IfSuccess false:" +
            JSON.stringify(res)
        );
        kiosk.app.deviceStatus.CASHBOX = 0;
        handleBalanceError();
        return;
      }

      var result = JSON.parse(res.resultJson);

      if (IfSuccess && res.IsSuccess) {
        if (
          !isNaN(result.cc1_stock) &&
          !isNaN(result.cc5_stock) &&
          !isNaN(result.cc10_stock) &&
          !isNaN(result.cc50_stock) &&
          // !isNaN(result.nd_stock) &&
          result.cc1_stock >= 0 &&
          result.cc5_stock >= 0 &&
          result.cc10_stock >= 0 &&
          result.cc50_stock >= 0
          // && result.nd_stock >= 0
        ) {
          // 存量參數正常
          // WriteLog("Return Balance:" + JSON.stringify(result));
          kiosk.CashBox.cc1_stock_now = 0;
          kiosk.CashBox.cc5_stock_now = 0;
          kiosk.CashBox.cc10_stock_now = result.cc10_stock;
          kiosk.CashBox.cc50_stock_now = result.cc50_stock;

          // kiosk.CashBox.cc1_stock_now = result.cc1_stock;
          // kiosk.CashBox.cc5_stock_now = result.cc5_stock;
          // kiosk.CashBox.nd_stock_now = result.nd_stock;

          handleBalanceCheck();
        } else {
          // 存量參數異常
          WriteLog(
            "DetectBalance - deviceStatus success - CashBalance error:" +
              JSON.stringify(res)
          );
          kiosk.app.deviceStatus.CASHBOX = 0;
          handleBalanceError();
          return;
        }
      }
    })
    .catch(function (err) {
      WriteLog("DetectBalance - deviceStatus catch:" + JSON.stringify(res));
      kiosk.app.deviceStatus.CASHBOX = 0;
      handleBalanceError();
    });

  function handleBalanceError() {
    if (!kiosk.CashBox.cc1_stock_now) kiosk.CashBox.cc1_stock_now = 0;
    if (!kiosk.CashBox.cc5_stock_now) kiosk.CashBox.cc5_stock_now = 0;
    if (!kiosk.CashBox.cc10_stock_now) kiosk.CashBox.cc10_stock_now = "異常";
    if (!kiosk.CashBox.cc50_stock_now) kiosk.CashBox.cc50_stock_now = "異常";

    // if (!kiosk.CashBox.cc1_stock_now) kiosk.CashBox.cc1_stock_now = "異常";
    // if (!kiosk.CashBox.cc5_stock_now) kiosk.CashBox.cc5_stock_now = "異常";
    // if (!kiosk.CashBox.nd_stock_now) kiosk.CashBox.nd_stock_now = "異常";
  }
}

function handleBalanceCheck() {
  return new Promise(function (resolve, reject) {
    var cc10Total = kiosk.CashBox.cc10_stock_now * 10;
    var cc50Total = kiosk.CashBox.cc50_stock_now * 50;
    var changeTotal = cc10Total + cc50Total;

    // var cc1Total = kiosk.CashBox.cc1_stock_now * 1;
    // var cc5Total = kiosk.CashBox.cc5_stock_now * 5;
    // var changeTotal = cc1Total + cc5Total + cc10Total + cc50Total;

    var IfLowBalance = false;

    var shortage = false;

    kiosk.currentModelKey === "ConfirmDetail" &&
    changeTotal < kiosk.status.ticketTotalAmt
      ? (shortage = true)
      : (shortage = false);

    changeTotal < kiosk.systemSetting.changeLowBalance ||
    cc10Total < 110 ||
    cc50Total < 150
      ? (IfLowBalance = true)
      : (IfLowBalance = false);

    // 低水位通知 - 零錢
    if (IfLowBalance) {
      var NotifyText =
        moment().format("YYYY-MM-DD") +
        " 低水位通知 - 零用金已達低水位，請儘速補齊，已停止現金收款功能。";
      BackEnd.KioskNotify(NotifyText);
      kiosk.app.deviceStatus.CASHBOXERROR = true;
      kiosk.app.deviceStatus.CASHBOXLowBalance = true;

      WriteLog(
        "handleBalanceCheck - LowBalance" +
          ", cc10_stock_now：" +
          kiosk.CashBox.cc10_stock_now +
          ", cc50_stock_now：" +
          kiosk.CashBox.cc50_stock_now +
          ", changeTotal:" +
          changeTotal +
          ", kiosk.status.ticketTotalAmt:" +
          kiosk.status.ticketTotalAmt
      );
      // ", cc1_stock_now：" +
      // kiosk.CashBox.cc1_stock_now +
      // ", cc5_stock_now：" +
      // kiosk.CashBox.cc5_stock_now +
      // ", nd_stock_now：" +
      // kiosk.CashBox.nd_stock_now +
    } else {
      kiosk.app.deviceStatus.CASHBOXERROR = undefined;
      kiosk.app.deviceStatus.CASHBOXLowBalance = false;
    }

    var result = {
      IfLowBalance: IfLowBalance,
      shortage: shortage,
    };

    resolve(result);
  });
}

function handleEndICTCash() {
  if (kiosk.status.posPayType.PayTypeAction.startsWith("ICTCash")) {
    var EndRetry = 0;
    // 結束收款作業
    endPayment();

    // 結束收款作業
    function endPayment() {
      function handleEndRetry(res) {
        setTimeout(function () {
          EndRetry++;
          kiosk.status.checkingCash = false;

          if (EndRetry < 5) {
            WriteLog("handleEndRetry:" + EndRetry);
            setTimeout(function () {
              endPayment();
            }, 200);
          } else {
            WriteLog("endPayment error:" + JSON.stringify(res));
            kiosk.app.deviceStatus.CASHBOXERROR = true;
          }
          return;
        }, 200);
      }

      customLibDevice.CashBox.endPayment()
        .then(function (res) {
          // WriteLog("endPayment:" + JSON.stringify(res));
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
            handleEndRetry(res);
            return;
          }

          var result = JSON.parse(res.resultJson);

          // 交易狀態正常，結束收款
          if (
            IfSuccess &&
            res.IsSuccess &&
            result.transactionStep === 1 &&
            result.returnValue === 0 &&
            result.issueCode === 0
          ) {
            EndRetry = 0;
            DetectBalance();
            return;
          }
          // 結束收款時，交易狀態異常 或 res.IsSuccess false
          else {
            handleEndRetry(res);
          }
        })
        .catch(function (err) {
          handleEndRetry(err);
          return;
        });
    }
  }
}

function getOpeningHours() {
  // moment().weekday(); // 0 ~ 6 , 0 is Sunday
  if (kiosk.BESync.WorkDays) {
    // 當日是否啟用
    kiosk.status.weekDaySet = kiosk.BESync.WorkDays.find(function (res) {
      if (res.WeekDay == moment().weekday()) return res;
    });
    if (kiosk.status.weekDaySet) {
      // 當日工作時間
      kiosk.status.weekTimeSet = kiosk.BESync.WorkTimes.find(function (res) {
        if (res.WeekDay == moment().weekday()) return res;
      });
      // 啟用
      if (kiosk.status.weekDaySet.WorkStatus) {
        if (kiosk.status.weekTimeSet.WorkTimeStart) {
          kiosk.systemSetting.openTime = kiosk.status.weekTimeSet.WorkTimeStart;
        }
        if (kiosk.status.weekTimeSet.WorkTimeEnd) {
          kiosk.systemSetting.closeTime = kiosk.status.weekTimeSet.WorkTimeEnd;
        }
      } else {
        kiosk.systemSetting.openTime = "00:00";
        kiosk.systemSetting.closeTime = "00:00";
      }
    }
  }
}

function getNextOpeningHours() {
  if (kiosk.BESync.WorkDays) {
    // 當日是否啟用
    kiosk.status.nextWeekDaySet = kiosk.BESync.WorkDays.find(function (res) {
      if (res.WeekDay == moment().add(1, "day").weekday()) return res;
    });

    if (kiosk.status.nextWeekDaySet) {
      // 當日工作時間
      kiosk.status.nextWeekTimeSet = kiosk.BESync.WorkTimes.find(function (
        res
      ) {
        if (res.WeekDay == moment().add(1, "day").weekday()) return res;
      });
    } else {
      setFakeNextWeekTimeSet();
    }
  } else {
    setFakeNextWeekTimeSet();
  }

  function setFakeNextWeekTimeSet() {
    kiosk.status.nextWeekTimeSet = {
      WeekDay: moment().weekday() === 6 ? 0 : moment().weekday() + 1,
      WorkTimeStart: "08:30",
      WorkTimeEnd: "17:00",
    };
  }
}

function updateBESync(response) {
  return new Promise(function (resolve, reject) {
    var resObj = response;
    if (!response) {
      commonExt
        .getJson("BESync")
        .then(function (res) {
          resObj = res;
          kiosk.systemSetting.DataVersion = resObj.DataVersion;
          return commonExt.setJson("systemSetting", kiosk.systemSetting);
        })
        .then(function (res) {
          resolve(resObj);
        })
        .catch(function (err) {
          WriteLog("updateBESync catch:" + JSON.stringify(err));
          reject(err);
        });
    } else {
      startConvertImage(response)
        .then(function (res) {
          resObj = res;
          return commonExt.setJson("BESync", resObj);
        })
        .then(function (res) {
          return commonExt.setJson("systemSetting", kiosk.systemSetting);
        })
        .then(function (res) {
          resolve(resObj);
        })
        .catch(function (err) {
          WriteLog("updateBESync catch:" + JSON.stringify(err));
          reject(err);
        });
    }

    function startConvertImage(response) {
      return new Promise(function (resolve, reject) {
        var tmpList = [];
        kiosk.status.recvCustomerInfo = response.IsCollectNationalInfo == "1";

        function convertImage(isNotGrayscale, key, FilePath) {
          return new Promise(function (resolve, reject) {
            var ExtFnName = "Base64ToPayTypeImage";

            if (!key || key === "") {
              resolve();
            }

            var _img = {
              FilePath: FilePath,
              Base64: key,
            };

            if (tmpList.indexOf(_img.FilePath) != -1) {
              resolve();
            } else {
              tmpList.push(_img.FilePath);
            }

            if (!isNotGrayscale) {
              ExtFnName = "Base64ToLogoImage";
            }

            WriteLog(ExtFnName + "--傳入:" + JSON.stringify(_img));
            External.TicketingServiceBizExt.TicketingService[ExtFnName](
              JSON.stringify(_img),
              function (res) {
                WriteLog(ExtFnName + "--傳出:" + JSON.stringify(res));
                resolve(res);
              },
              function (err) {
                WriteLog(ExtFnName + "--傳出:" + JSON.stringify(err));
                reject(err);
              }
            );
          });
        }

        var InvoiceLogo = new Promise(function (resolve, reject) {
          convertImage(
            false,
            response.InvoiceLogo,
            "C:\\ITKiosk\\html\\img\\invoice-name.bmp"
          )
            .then(function (res) {
              response.InvoiceLogo = "";
              resolve(res);
            })
            .catch(function (err) {
              WriteLog("InvoiceLogo fail: " + JSON.stringify(err));
              reject(err);
            });
        });

        var PASSLogo = new Promise(function (resolve, reject) {
          convertImage(
            true,
            response.PASSLogo,
            "C:\\ITKiosk\\html\\img\\PASSLogo.png"
          )
            .then(function (res) {
              response.PASSLogo = "";
              resolve(res);
            })
            .catch(function (err) {
              WriteLog("PASSLogo fail: " + JSON.stringify(err));
              reject(err);
            });
        });

        var PASSHome = new Promise(function (resolve, reject) {
          convertImage(
            true,
            response.PASSHome,
            "C:\\ITKiosk\\html\\img\\PASSHome.png"
          )
            .then(function (res) {
              response.PASSHome = "";
              resolve(res);
            })
            .catch(function (err) {
              WriteLog("PASSHome fail: " + JSON.stringify(err));
              reject(err);
            });
        });

        var TicketLogo = new Promise(function (resolve, reject) {
          var TicketLogoRes = [];
          var length = response.TicketTemplates.length;

          function startConvertTicketLogo(
            index,
            isNotGrayscale,
            key,
            FilePath
          ) {
            TicketLogoRes[index] = new Promise(function (resolve, reject) {
              convertImage(isNotGrayscale, key, FilePath)
                .then(function (res) {
                  response.TicketTemplates[index].TicketLogo = "";
                  resolve();
                })
                .catch(function (err) {
                  WriteLog(
                    "TicketTemplates[" +
                      index +
                      "].ThermalPrintID: " +
                      response.TicketTemplates[index].ThermalPrintID +
                      ", fail: " +
                      JSON.stringify(err)
                  );
                  reject();
                });
            });
          }

          for (var i = 0; i < length; i++) {
            startConvertTicketLogo(
              i,
              false,
              response.TicketTemplates[i].TicketLogo,
              "C:\\ITKiosk\\html\\img\\" +
                response.TicketTemplates[i].ThermalPrintID +
                ".bmp"
            );
          }

          Promise.all(TicketLogoRes)
            .then(function (res) {
              resolve(res);
            })
            .catch(function (err) {
              reject(err);
            });
        });

        var PayTypeLogo = new Promise(function (resolve, reject) {
          var PayTypeLogoRes = [];
          var length = response.PayTypes.length;

          function startConvertPayTypeLogo(
            index,
            isNotGrayscale,
            key,
            FilePath
          ) {
            PayTypeLogoRes[index] = new Promise(function (resolve, reject) {
              convertImage(isNotGrayscale, key, FilePath)
                .then(function (res) {
                  response.PayTypes[index].PayTypeLogo = "";
                  resolve();
                })
                .catch(function (err) {
                  WriteLog(
                    "PayTypes[" +
                      index +
                      "].FTPayTypeCode: " +
                      response.PayTypes[index].FTPayTypeCode +
                      ", fail: " +
                      JSON.stringify(err)
                  );
                  reject();
                });
            });
          }

          for (var i = 0; i < length; i++) {
            startConvertPayTypeLogo(
              i,
              true,
              response.PayTypes[i].PayTypeLogo,
              "C:\\ITKiosk\\html\\img\\" +
                response.PayTypes[i].FTPayTypeCode +
                ".png"
            );
          }

          Promise.all(PayTypeLogoRes)
            .then(function (res) {
              resolve(res);
            })
            .catch(function (err) {
              reject(err);
            });
        });

        Promise.all([InvoiceLogo, PASSLogo, PASSHome, TicketLogo, PayTypeLogo])
          .then(function (res) {
            response.LastTime = moment();
            kiosk.systemSetting.DataVersion = response.DataVersion;
            kiosk.BESync = response;
            resolve(response);
          })
          .catch(function (err) {
            WriteLog("startConvertImage catch: " + JSON.stringify(err));
            response.LastTime = moment();
            kiosk.systemSetting.DataVersion = response.DataVersion;
            kiosk.BESync = response;
            resolve(response);
          });
      });
    }
  });
}

function updateOrderListUI() {
  try {
    var isFree = kiosk.status.ticketTotalAmt == 0;
    var freePay = null;
    var payTypes = kiosk.BESync.PayTypes;
    var OKPayTypes = [];
    for (var i = 0; i < payTypes.length; i++) {
      for (var j = 0; j < kiosk.status.orderListUI.length; j++) {
        var isOK = false;
        for (
          var k = 0;
          k < kiosk.status.orderListUI[j].paymentSettingList.length;
          k++
        ) {
          if (
            kiosk.status.orderListUI[j].paymentSettingList[k]
              .paymentSettingId == payTypes[i].FTPayTypeCode
          ) {
            payTypes[i].CorporationPayTypeName =
              kiosk.status.orderListUI[j].paymentSettingList[
                k
              ].paymentSettingName;
            if (
              kiosk.status.orderListUI[j].paymentSettingList[k]
                .acceptZeroTransaction
            ) {
              if (isFree) {
                isOK = true;
                freePay = payTypes[i];
              }
            } else if (!isFree) {
              isOK = true;
            }
          }
        }
        if (isOK) {
          var check = OKPayTypes.findIndex(function (n) {
            return n.FTPayTypeCode == payTypes[i].FTPayTypeCode;
          });
          if (check == -1 && payTypes[i].Status === 1) {
            OKPayTypes.push(payTypes[i]);
          }
        }
      }
    }
    var arr = OKPayTypes;
    OKPayTypes = sortingPayTypes(arr);
    return [isFree, freePay, OKPayTypes];
  } catch (error) {
    WriteLog("updateOrderListUI error: " + JSON.stringify(error));
  }

  function sortingPayTypes(array) {
    if (!Array.isArray(array)) {
      WriteLog("mergeSort parameter is not an array.");
      return array;
    }
    function mergeSort(array) {
      if (array.length <= 1) {
        return array;
      }
      var length = array.length;
      var middle = Math.floor(length / 2);
      var left = array.slice(0, middle);
      var right = array.slice(middle);
      return merge(mergeSort(left), mergeSort(right));
    }
    function merge(left, right) {
      var result = [],
        leftIndex = 0,
        rightIndex = 0;
      while (leftIndex < left.length && rightIndex < right.length) {
        if (left[leftIndex].Seq >= right[rightIndex].Seq) {
          result.push(left[leftIndex]);
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          rightIndex++;
        }
      }
      return result
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
    }
    var newArray = mergeSort(array);
    return newArray;
  }
}

function CreatePayment(payType, isFree, goBackFn, goHomeFn) {
  try {
    // if (kiosk.status.posCreatePayment != null) {
    //   kiosk.status.posPayType = payType;
    //   kiosk.status.posPayTypeCode = payType.FTPayTypeCode;
    //   kiosk.API.goToNext("Payment");
    // } else {
    var invoice = null;
    if (kiosk.status.invoiceCode) {
      invoice = "買方 : " + kiosk.status.invoiceCode;
    } else if (kiosk.status.invoice && kiosk.status.invoice.invoiceVatNumber) {
      invoice = "買方 : " + kiosk.status.invoice.invoiceVatNumber;
    }

    var paymentData = {
      totalPrice: kiosk.status.ticketTotalAmt,
      subtotal: kiosk.status.ticketTotalAmt,
      discount: 0,
      transactionFee: 0,
      nationality: null,
      touristInformation: {},
      contactInformation: {
        remark: invoice,
      },
      invoiceInformation: kiosk.status.invoice,
      legacyId: moment().format("YYYYMMDDHHmmss") + "001",
      // 暫代第一筆藍新信用卡  待補搜尋條件
      paymentSettingId: payType.FTPayTypeCode,
      note: kiosk.status.memos,
    };

    kiosk.app.updateLoading(true);

    var ticketType = "TICKET"; //kiosk.status.printmode == "o" ? "TICKET" : "PAYMENT";

    if (!testFlag.viewDebugger) {
      // 更新MainSerialNoDate與MainSerialNo格式(for serialNo)
      if (kiosk.KMSSetting.MainSerialNoDate != moment().format("YYYYMMDD")) {
        kiosk.KMSSetting.MainSerialNoDate = moment().format("YYYYMMDD");
        kiosk.systemSetting.MainSerialNo = padLeft(1, 6);
      }

      kiosk.status.serialNo =
        kiosk.systemSetting.deviceCode +
        kiosk.KMSSetting.MainSerialNoDate +
        kiosk.KMSSetting.MainSerialNo;

      kiosk.KMSSetting.MainSerialNo = padLeft(
        Number(kiosk.KMSSetting.MainSerialNo) + 1,
        6
      );

      BackEnd.AddActionLog(
        "3",
        "成立本機訂單",
        JSON.stringify({
          member: kiosk.sfAccount ? kiosk.sfAccount.username : "",
          app: kiosk.systemSetting ? kiosk.systemSetting.appName : "",
          localID: kiosk.status.serialNo,
          version: kiosk.BESync ? kiosk.BESync.Version : "",
        })
      );
      paymentData.legacyId = kiosk.status.serialNo;
      commonExt.setJson("KMSSetting", kiosk.KMSSetting);
    } else {
      kiosk.status.serialNo = "T00001" + moment().format("YYYYMMDD") + "000001";
    }

    // 打豐趣API建立訂單
    PalaceAPI.posCreatePayment(
      ticketType,
      "Kiosk",
      paymentData,
      kiosk.status.orderList
    )
      .then(function (res) {
        kiosk.status.posCreatePayment = res;
        kiosk.status.posPayType = payType;
        kiosk.status.posPayTypeCode = payType.FTPayTypeCode;
        kiosk.status.serialNo =
          kiosk.status.posCreatePayment.payment.paymentNumber;

        // Sqlite 紀錄交易資料 START -----------
        if (!testFlag.viewDebugger) {
          _localTrans = {
            localorderNo: kiosk.status.serialNo,
            orderNo: res.payment.paymentNumber,
            orderTime: moment().format("YYYY-MM-DD HH:mm:ss"),
            orderPrice: res.payment.subtotal,
            orderPaymentType: payType.CorporationPayTypeName,
            username: kiosk.sfAccount ? kiosk.sfAccount.username : "",
          };
          External.TicketingServiceBizExt.TicketingService.addLocalTrans(
            JSON.stringify(_localTrans),
            function (res) {}
          );
        }
        // Sqlite 紀錄交易資料 E N D -----------

        if (!isFree) {
          kiosk.API.goToNext("Payment");
        } else {
          // 打豐趣API改變訂單狀態
          PalaceAPI.posEnablePayment(
            kiosk.status.posCreatePayment.payment.paymentId,
            this.NCCCPaymentJSON,
            kiosk.status.posPayTypeCode
          )
            .then(function (res) {
              kiosk.status.posEnablePayment = res.payment;

              // Sqlite 更新交易資料 START -----------
              if (!testFlag.viewDebugger) {
                // 儲存部分內容
                _localTrans = {
                  orderNo: res.payment.paymentNumber,
                  orderPrice: res.payment.subtotal,
                  orderPaymentType: res.payment.paymentSettingList[0].name,
                  payTime: moment().format("YYYY-MM-DD HH:mm:ss"),
                  isPay: true,
                  username: kiosk.sfAccount ? kiosk.sfAccount.username : "",
                };
                // 打後端API存資料
                External.TicketingServiceBizExt.TicketingService.updateLocalTrans(
                  JSON.stringify(_localTrans),
                  function (res) {}
                );
              }
              // Sqlite 更新交易資料 E N D -----------

              setTimeout(function () {
                kiosk.API.goToNext("PaySuccess");
              }, 370);
            })
            .catch(function (errMsg) {
              kiosk.app.updateLoading(false);
              PalaceAPI.posCancelPayment(
                kiosk.status.posCreatePayment.payment.paymentId
              );
              showAlert({
                title: errMsg,
                type: "error",
                confirm: "確認",
                confirmFn: function () {
                  goBackFn();
                },
              });
            });
        }
      })
      .catch(function (errMsg) {
        WriteLog("posCreatePayment catch: " + errMsg);
        var sp_config = {
          spTitleText: "提醒",
          spContentTitle: "訂單成立失敗，請再做一次",
          spContentText: errMsg,
          spBtnLeftText: '<img src="./img/Path5751.png" alt="">   繼續嘗試',
          spBtnRightText: '<img src="./img/MaskGroup3.png" alt="">   回到首頁',
          spBtnRightFn: goHomeFn,
        };
        if (
          kiosk.status.APIresponse.posCreatePayment &&
          kiosk.status.APIresponse.posCreatePayment.errorCode &&
          kiosk.status.APIresponse.posCreatePayment.errorCode == 3051
        ) {
          sp_config.spBtnLeftFn = function () {
            kiosk.API.goToNext("ProductChoiceReserTicket");
          };
          kiosk.status.posSaleProductList.saleProductList.map(function (
            productItem
          ) {
            if (productItem.saleProductId == kiosk.status.sfSelectProductId) {
              if (productItem.saleProductSum != null) {
                productItem.saleProductSum.map(function (saleProductItem) {
                  if (saleProductItem.detail != null) {
                    saleProductItem.detail.map(function (detailItem) {
                      if (
                        detailItem.bookingSpecId ==
                        kiosk.status.currentBookingSpecId
                      ) {
                        for (
                          var i = 0, lengthA = detailItem.ticketType.length;
                          i < lengthA;
                          i++
                        ) {
                          var ticketItem = detailItem.ticketType[i];
                          for (
                            var j = 0, lengthB = ticketItem.seatDataList.length;
                            j < lengthB;
                            j++
                          ) {
                            ticketItem.seatDataList[j] = {};
                          }
                        }
                      }
                    });
                  }
                });
              }
            }
          });
        }
        kiosk.app.updateLoading(false);
        TVMSwal(sp_config);
      });
    // }
  } catch (error) {
    WriteLog("CreatePayment error: " + JSON.stringify(error));
    kiosk.API.initStatus();
    kiosk.API.goToNext("mainMenu");
  }
}

function checkIfFreePayment(goNextFn) {
  var UIres = updateOrderListUI();
  if (
    UIres[0] &&
    UIres[1] &&
    UIres[2].length === 1 &&
    UIres[2][0].PayTypeAction.startsWith("Free")
  ) {
    if (kiosk.status.needInvoice) {
      kiosk.status.invoice = {};
      kiosk.status.invoice.invoiceDeviceType = "PAPER";
      kiosk.status.invoice.invoiceType = "2COPIES";
    }
    CreatePayment(
      UIres[2][0],
      true,
      function () {
        kiosk.API.initStatus();
        kiosk.API.goToNext("mainMenu");
      },
      function () {
        kiosk.API.initStatus();
        kiosk.API.goToNext("mainMenu");
      }
    );
  } else {
    if (kiosk.status.needInvoice) {
      kiosk.status.invoice = {};
    }
    goNextFn();
  }
}

function updateSystemSettingDeviceInfo(res) {
  return new Promise(function (resolve, reject) {
    try {
      if (res.merchantDeviceList[0].merchant) {
        kiosk.systemSetting.accessToken =
          res.merchantDeviceList[0].merchant.accessToken;
        kiosk.systemSetting.deviceCode =
          res.merchantDeviceList[0].device.deviceCode;

        kiosk.systemSetting.deviceName =
          kiosk.status.posCheckDevice.merchantDeviceList[0].device.name;
        kiosk.systemSetting.deviceId =
          kiosk.status.posCheckDevice.merchantDeviceList[0].device.deviceId;
        kiosk.systemSetting.merchantCode =
          kiosk.status.posCheckDevice.merchantDeviceList[0].merchant.merchantCode;
        kiosk.systemSetting.merchantSiteName =
          kiosk.status.posCheckDevice.merchantDeviceList[0].merchant.merchantSiteName;
        kiosk.systemSetting.merchantName =
          kiosk.status.posCheckDevice.merchantDeviceList[0].merchant.name;
        kiosk.systemSetting.merchantSiteGroupName =
          kiosk.status.posCheckDevice.merchantDeviceList[0].merchant.merchantSiteGroupName;
      }
      resolve(commonExt.setJson("systemSetting", kiosk.systemSetting));
    } catch (error) {
      reject(JSON.stringify(error));
    }
  });
}
